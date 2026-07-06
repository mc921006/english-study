import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { resolve } from "node:path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type CefrLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

type SeedGrammar = {
  title: string;
  slug: string;
  description: string;
  example: string;
  example_meaning: string;
  cefr_level: CefrLevel;
  order_index: number;
};

type GrammarRow = SeedGrammar & {
  id: string;
  created_at: string;
};

type ChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

type ChatCompletionErrorResponse = {
  error?: {
    message?: string;
  };
};

type SeedProgress = {
  cefrLevel: CefrLevel;
  targetCount: number;
  insertedCount: number;
  skippedCount: number;
  batchSize: number;
  nextOrderIndex: number;
  startedAt: string;
  updatedAt: string;
};

type SeedDatabase = {
  public: {
    Tables: {
      grammar: {
        Row: GrammarRow;
        Insert: SeedGrammar;
        Update: Partial<SeedGrammar>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

type GrammarSupabaseClient = SupabaseClient<SeedDatabase>;

const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
const DEFAULT_MODEL = "openai/gpt-4.1-mini";
const OPENAI_DEFAULT_MODEL = "gpt-4.1-mini";
const DEFAULT_BATCH_SIZE = 25;
const DEFAULT_MAX_RETRIES = 3;
const EXCLUSION_PROMPT_LIMIT = 150;
const PROGRESS_DIR = resolve(process.cwd(), ".seed-progress");

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

async function main() {
  loadEnvLocal();

  const { cefrLevel, count, batchSize, maxRetries } = parseArgs(
    process.argv.slice(2),
  );
  const supabaseUrl = getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL");
  const supabaseAnonKey = getRequiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  const aiClient = getAIClient();

  const supabase: GrammarSupabaseClient = createClient<SeedDatabase>(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: { persistSession: false },
    },
  );

  const existingTitles = await fetchExistingTitleSet(supabase, cefrLevel);
  const existingSlugs = await fetchExistingSlugSet(supabase);
  const nextOrderIndex = await fetchNextOrderIndex(supabase, cefrLevel);
  const progress = loadOrCreateProgress({
    cefrLevel,
    count,
    batchSize,
    nextOrderIndex,
  });

  console.log(
    [
      `Seeding ${count} ${cefrLevel} grammar items with ${aiClient.model}`,
      `batch=${batchSize}`,
      `retries=${maxRetries}`,
      `existing=${existingTitles.size}`,
      `resuming_inserted=${progress.insertedCount}`,
      `next_order_index=${progress.nextOrderIndex}`,
    ].join(" | "),
  );

  const result = await seedGrammarInBatches({
    supabase,
    cefrLevel,
    count,
    batchSize,
    maxRetries,
    aiClient,
    excludedTitles: existingTitles,
    excludedSlugs: existingSlugs,
    progress,
  });

  clearProgress(cefrLevel, count);
  console.log(
    `Done. Inserted ${result.insertedCount} grammar items. Skipped ${result.skippedCount} duplicates.`,
  );
}

function parseArgs(args: string[]) {
  const [cefrLevelArg, countArg] = args;

  if (!isCefrLevel(cefrLevelArg)) {
    throw new Error(
      `Usage: pnpm seed:grammar <${CEFR_LEVELS.join("|")}> <count>\nExample: pnpm seed:grammar A1 20`,
    );
  }

  const count = Number(countArg);
  if (!Number.isInteger(count) || count < 1) {
    throw new Error("count must be a positive integer.");
  }

  return {
    cefrLevel: cefrLevelArg,
    count,
    batchSize: parsePositiveIntEnv("SEED_GRAMMAR_BATCH_SIZE", DEFAULT_BATCH_SIZE),
    maxRetries: parsePositiveIntEnv("SEED_GRAMMAR_MAX_RETRIES", DEFAULT_MAX_RETRIES),
  };
}

function isCefrLevel(value: string | undefined): value is CefrLevel {
  return CEFR_LEVELS.includes(value as CefrLevel);
}

function getRequiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required. Add it to .env.local.`);
  }

  return value;
}

function parsePositiveIntEnv(name: string, fallback: number) {
  const value = process.env[name];
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error(`${name} must be a positive integer.`);
  }

  return parsed;
}

function getAIClient() {
  const openAIKey = process.env.OPENAI_API_KEY;
  if (openAIKey) {
    return {
      apiKey: openAIKey,
      endpoint: "https://api.openai.com/v1/chat/completions",
      model: process.env.OPENAI_MODEL ?? OPENAI_DEFAULT_MODEL,
      providerName: "OpenAI",
      usesOpenRouter: false,
    };
  }

  const openRouterKey = process.env.OPENROUTER_API_KEY;
  if (openRouterKey) {
    return {
      apiKey: openRouterKey,
      endpoint: "https://openrouter.ai/api/v1/chat/completions",
      model: process.env.OPENROUTER_MODEL ?? DEFAULT_MODEL,
      providerName: "OpenRouter",
      usesOpenRouter: true,
    };
  }

  throw new Error(
    "OPENAI_API_KEY or OPENROUTER_API_KEY is required. Add one to .env.local.",
  );
}

function loadEnvLocal() {
  const envPath = resolve(process.cwd(), ".env.local");
  if (!existsSync(envPath)) {
    return;
  }

  const envFile = readFileSync(envPath, "utf8");
  for (const line of envFile.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const match = trimmed.match(/^([\w.-]+)\s*=\s*(.*)$/);
    if (!match || process.env[match[1]] !== undefined) {
      continue;
    }

    process.env[match[1]] = stripEnvValue(match[2]);
  }
}

function stripEnvValue(value: string) {
  const withoutComment = value.replace(/\s+#.*$/, "").trim();
  const quote = withoutComment[0];

  if (
    (quote === "'" || quote === '"') &&
    withoutComment[withoutComment.length - 1] === quote
  ) {
    return withoutComment.slice(1, -1);
  }

  return withoutComment;
}

async function seedGrammarInBatches({
  supabase,
  cefrLevel,
  count,
  batchSize,
  maxRetries,
  aiClient,
  excludedTitles,
  excludedSlugs,
  progress,
}: {
  supabase: GrammarSupabaseClient;
  cefrLevel: CefrLevel;
  count: number;
  batchSize: number;
  maxRetries: number;
  aiClient: ReturnType<typeof getAIClient>;
  excludedTitles: Set<string>;
  excludedSlugs: Set<string>;
  progress: SeedProgress;
}) {
  while (progress.insertedCount < count) {
    const remainingCount = count - progress.insertedCount;
    const currentBatchSize = Math.min(batchSize, remainingCount);
    const batchNumber = Math.floor(progress.insertedCount / batchSize) + 1;
    const totalBatches = Math.ceil(count / batchSize);

    console.log(
      `[${new Date().toISOString()}] Batch ${batchNumber}/${totalBatches} | target=${currentBatchSize} | inserted=${progress.insertedCount}/${count}`,
    );

    const grammarItems = await withRetries(
      () =>
        generateNewGrammar({
          cefrLevel,
          count: currentBatchSize,
          startOrderIndex: progress.nextOrderIndex,
          aiClient,
          excludedTitles,
          excludedSlugs,
        }),
      maxRetries,
      `generate ${cefrLevel} grammar batch ${batchNumber}`,
    );

    if (grammarItems.length === 0) {
      progress.skippedCount += currentBatchSize;
      saveProgress(progress);
      break;
    }

    const inserted = await withRetries(
      () => insertGrammar(supabase, grammarItems),
      maxRetries,
      `insert ${cefrLevel} grammar batch ${batchNumber}`,
    );

    progress.insertedCount += inserted.length;
    progress.skippedCount += currentBatchSize - inserted.length;
    progress.nextOrderIndex += inserted.length;
    progress.updatedAt = new Date().toISOString();
    saveProgress(progress);

    console.log(
      `Batch ${batchNumber}: inserted=${inserted.length}, skipped=${currentBatchSize - inserted.length}, progress=${progress.insertedCount}/${count}`,
    );
  }

  return {
    insertedCount: progress.insertedCount,
    skippedCount: progress.skippedCount,
  };
}

async function generateNewGrammar({
  cefrLevel,
  count,
  startOrderIndex,
  aiClient,
  excludedTitles,
  excludedSlugs,
}: {
  cefrLevel: CefrLevel;
  count: number;
  startOrderIndex: number;
  aiClient: ReturnType<typeof getAIClient>;
  excludedTitles: Set<string>;
  excludedSlugs: Set<string>;
}) {
  const generated = await generateGrammar({
    cefrLevel,
    count,
    startOrderIndex,
    aiClient,
    excludedTitles,
  });
  const seen = new Set<string>();
  const newItems: SeedGrammar[] = [];

  for (const item of generated) {
    const key = normalizeTitle(item.title);
    const slug = createUniqueSlug({
      title: item.title,
      cefrLevel,
      excludedSlugs,
    });
    if (seen.has(key) || excludedTitles.has(key)) {
      continue;
    }

    seen.add(key);
    excludedTitles.add(key);
    excludedSlugs.add(slug);
    newItems.push({
      ...item,
      slug,
      order_index: startOrderIndex + newItems.length,
    });
  }

  return newItems;
}

async function generateGrammar({
  cefrLevel,
  count,
  startOrderIndex,
  aiClient,
  excludedTitles,
}: {
  cefrLevel: CefrLevel;
  count: number;
  startOrderIndex: number;
  aiClient: ReturnType<typeof getAIClient>;
  excludedTitles: Set<string>;
}) {
  const exclusions = Array.from(excludedTitles).slice(-EXCLUSION_PROMPT_LIMIT);
  const requestBody = {
    model: aiClient.model,
    max_tokens: getMaxTokens(count),
    messages: [
      {
        role: "system",
        content:
          "You create English grammar study seed data for Korean learners. Return JSON only. Do not include markdown, comments, prose, or explanations.",
      },
      {
        role: "user",
        content: [
          `Generate exactly ${count} grammar study items for CEFR ${cefrLevel}.`,
          `Only include grammar points appropriate for CEFR ${cefrLevel}.`,
          exclusions.length > 0
            ? `Avoid these existing titles: ${exclusions.join(", ")}.`
            : "",
          "title should be concise English grammar topic text.",
          "description must be a natural Korean explanation.",
          `example must be a natural English sentence at CEFR ${cefrLevel} difficulty.`,
          "example_meaning must be a natural Korean translation.",
          `cefr_level must be ${cefrLevel}.`,
          `order_index values should start from ${startOrderIndex}.`,
          "Return JSON only.",
        ].join(" "),
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "grammar_seed_data",
        strict: true,
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            grammar: {
              type: "array",
              minItems: count,
              maxItems: count,
              items: {
                type: "object",
                additionalProperties: false,
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  example: { type: "string" },
                  example_meaning: { type: "string" },
                  cefr_level: { type: "string", enum: [cefrLevel] },
                  order_index: { type: "integer" },
                },
                required: [
                  "title",
                  "description",
                  "example",
                  "example_meaning",
                  "cefr_level",
                  "order_index",
                ],
              },
            },
          },
          required: ["grammar"],
        },
      },
    },
    ...(aiClient.usesOpenRouter
      ? {
          provider: {
            require_parameters: true,
          },
        }
      : {}),
  };

  const response = await fetch(aiClient.endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${aiClient.apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://localhost",
      "X-Title": "english-study seed grammar",
    },
    body: JSON.stringify(requestBody),
  });

  const responseBody = (await response.json()) as
    | ChatCompletionResponse
    | ChatCompletionErrorResponse;
  if (!response.ok) {
    const message =
      "error" in responseBody && responseBody.error?.message
        ? responseBody.error.message
        : response.statusText;
    throw new Error(`${aiClient.providerName} request failed: ${message}`);
  }

  const parsed = parseAIJson(responseBody as ChatCompletionResponse);
  if (!Array.isArray(parsed.grammar)) {
    throw new Error(`${aiClient.providerName} response did not include grammar.`);
  }

  if (parsed.grammar.length !== count) {
    throw new Error(
      `${aiClient.providerName} returned ${parsed.grammar.length} grammar items, but ${count} were requested.`,
    );
  }

  return parsed.grammar.map((item) => normalizeSeedGrammar(item, cefrLevel));
}

async function insertGrammar(
  supabase: GrammarSupabaseClient,
  items: SeedGrammar[],
) {
  const { data, error } = await supabase.from("grammar").insert(items).select("id");

  if (error) {
    throw new Error(`Failed to insert grammar: ${error.message}`);
  }

  return data ?? [];
}

async function fetchExistingTitleSet(
  supabase: GrammarSupabaseClient,
  cefrLevel: CefrLevel,
) {
  const titles = new Set<string>();
  const pageSize = 1000;
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from("grammar")
      .select("title")
      .eq("cefr_level", cefrLevel)
      .range(from, from + pageSize - 1);

    if (error) {
      throw new Error(`Failed to fetch existing grammar: ${error.message}`);
    }

    for (const row of data ?? []) {
      titles.add(normalizeTitle(row.title));
    }

    if (!data || data.length < pageSize) {
      break;
    }

    from += pageSize;
  }

  return titles;
}

async function fetchExistingSlugSet(supabase: GrammarSupabaseClient) {
  const slugs = new Set<string>();
  const pageSize = 1000;
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from("grammar")
      .select("slug")
      .range(from, from + pageSize - 1);

    if (error) {
      throw new Error(`Failed to fetch existing grammar slugs: ${error.message}`);
    }

    for (const row of data ?? []) {
      slugs.add(String(row.slug));
    }

    if (!data || data.length < pageSize) {
      break;
    }

    from += pageSize;
  }

  return slugs;
}

async function fetchNextOrderIndex(
  supabase: GrammarSupabaseClient,
  cefrLevel: CefrLevel,
) {
  const { data, error } = await supabase
    .from("grammar")
    .select("order_index")
    .eq("cefr_level", cefrLevel)
    .order("order_index", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch grammar order index: ${error.message}`);
  }

  return data ? data.order_index + 1 : 1;
}

async function withRetries<T>(
  operation: () => Promise<T>,
  maxRetries: number,
  label: string,
) {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt === maxRetries) {
        break;
      }

      const delayMs = Math.min(15_000, 1_000 * 2 ** (attempt - 1));
      console.warn(
        `${label} failed on attempt ${attempt}/${maxRetries}: ${getErrorMessage(error)}. Retrying in ${delayMs}ms...`,
      );
      await sleep(delayMs);
    }
  }

  throw new Error(`${label} failed: ${getErrorMessage(lastError)}`);
}

function getMaxTokens(count: number) {
  return Math.min(10_000, Math.max(1_000, count * 220 + 600));
}

function parseAIJson(body: ChatCompletionResponse) {
  const outputText = body.choices?.[0]?.message?.content;
  if (!outputText) {
    throw new Error("AI response did not include output text.");
  }

  return JSON.parse(outputText) as { grammar?: unknown[] };
}

function normalizeSeedGrammar(item: unknown, cefrLevel: CefrLevel): SeedGrammar {
  if (!item || typeof item !== "object") {
    throw new Error("AI returned an invalid grammar item.");
  }

  const record = item as Record<string, unknown>;
  return {
    title: requiredString(record.title, "title"),
    slug: "",
    description: requiredString(record.description, "description"),
    example: requiredString(record.example, "example"),
    example_meaning: requiredString(record.example_meaning, "example_meaning"),
    cefr_level: cefrLevel,
    order_index: requiredInteger(record.order_index, "order_index"),
  };
}

function requiredString(value: unknown, fieldName: string) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`AI returned an invalid ${fieldName}.`);
  }

  return value.trim();
}

function requiredInteger(value: unknown, fieldName: string) {
  if (typeof value !== "number" || !Number.isInteger(value)) {
    throw new Error(`AI returned an invalid ${fieldName}.`);
  }

  return value;
}

function loadOrCreateProgress({
  cefrLevel,
  count,
  batchSize,
  nextOrderIndex,
}: {
  cefrLevel: CefrLevel;
  count: number;
  batchSize: number;
  nextOrderIndex: number;
}) {
  const progressPath = getProgressPath(cefrLevel, count);
  if (existsSync(progressPath)) {
    const progress = JSON.parse(readFileSync(progressPath, "utf8")) as SeedProgress;
    if (
      progress.cefrLevel === cefrLevel &&
      progress.targetCount === count &&
      progress.batchSize === batchSize
    ) {
      return progress;
    }
  }

  const now = new Date().toISOString();
  return {
    cefrLevel,
    targetCount: count,
    insertedCount: 0,
    skippedCount: 0,
    batchSize,
    nextOrderIndex,
    startedAt: now,
    updatedAt: now,
  };
}

function saveProgress(progress: SeedProgress) {
  mkdirSync(PROGRESS_DIR, { recursive: true });
  writeFileSync(
    getProgressPath(progress.cefrLevel, progress.targetCount),
    `${JSON.stringify(progress, null, 2)}\n`,
  );
}

function clearProgress(cefrLevel: CefrLevel, count: number) {
  const progressPath = getProgressPath(cefrLevel, count);
  if (existsSync(progressPath)) {
    rmSync(progressPath);
  }
}

function getProgressPath(cefrLevel: CefrLevel, count: number) {
  return resolve(PROGRESS_DIR, `grammar-${cefrLevel}-${count}.json`);
}

function normalizeTitle(title: string) {
  return title.trim().toLocaleLowerCase("en-US");
}

function createUniqueSlug({
  title,
  cefrLevel,
  excludedSlugs,
}: {
  title: string;
  cefrLevel: CefrLevel;
  excludedSlugs: Set<string>;
}) {
  const baseSlug = `${cefrLevel.toLocaleLowerCase("en-US")}-${slugify(title)}`;
  let slug = baseSlug;
  let index = 2;

  while (excludedSlugs.has(slug)) {
    slug = `${baseSlug}-${index}`;
    index += 1;
  }

  return slug;
}

function slugify(value: string) {
  const slug = value
    .trim()
    .toLocaleLowerCase("en-US")
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "grammar";
}

function sleep(ms: number) {
  return new Promise((resolveSleep) => {
    setTimeout(resolveSleep, ms);
  });
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}
