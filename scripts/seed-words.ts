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

type SeedWord = {
  word: string;
  meaning: string;
  example: string;
  example_meaning: string;
  pronunciation: string;
  part_of_speech: string;
  cefr_level: CefrLevel;
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
  startedAt: string;
  updatedAt: string;
};

type SeedDatabase = {
  public: {
    Tables: {
      words: {
        Row: SeedWord;
        Insert: SeedWord;
        Update: Partial<SeedWord>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

type WordsSupabaseClient = SupabaseClient<SeedDatabase>;

const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
const DEFAULT_MODEL = "openai/gpt-4.1-mini";
const OPENAI_DEFAULT_MODEL = "gpt-4.1-mini";
const DEFAULT_BATCH_SIZE = 50;
const DEFAULT_MAX_RETRIES = 3;
const EXCLUSION_PROMPT_LIMIT = 250;
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

  const supabase: WordsSupabaseClient = createClient<SeedDatabase>(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: { persistSession: false },
    },
  );

  const existingWordSet = await fetchExistingWordSet(supabase, cefrLevel);
  const progress = loadOrCreateProgress({ cefrLevel, count, batchSize });

  console.log(
    [
      `Seeding ${count} ${cefrLevel} words with ${aiClient.model}`,
      `batch=${batchSize}`,
      `retries=${maxRetries}`,
      `existing=${existingWordSet.size}`,
      `resuming_inserted=${progress.insertedCount}`,
    ].join(" | "),
  );

  const result = await seedWordsInBatches({
    supabase,
    cefrLevel,
    count,
    batchSize,
    maxRetries,
    aiClient,
    excludedWords: existingWordSet,
    progress,
  });

  clearProgress(cefrLevel, count);

  console.log(
    `Done. Inserted ${result.insertedCount} words. Skipped ${result.skippedCount} duplicates.`,
  );
}

function parseArgs(args: string[]) {
  const [cefrLevelArg, countArg] = args;

  if (!isCefrLevel(cefrLevelArg)) {
    throw new Error(
      `Usage: pnpm seed:words <${CEFR_LEVELS.join("|")}> <count>\nExample: pnpm seed:words A1 100`,
    );
  }

  const count = Number(countArg);
  if (!Number.isInteger(count) || count < 1) {
    throw new Error("count must be a positive integer.");
  }

  const batchSize = parsePositiveIntEnv("SEED_WORDS_BATCH_SIZE", DEFAULT_BATCH_SIZE);
  const maxRetries = parsePositiveIntEnv("SEED_WORDS_MAX_RETRIES", DEFAULT_MAX_RETRIES);

  return { cefrLevel: cefrLevelArg, count, batchSize, maxRetries };
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
    if (!match) {
      continue;
    }

    const [, key, rawValue] = match;
    if (process.env[key] !== undefined) {
      continue;
    }

    process.env[key] = stripEnvValue(rawValue);
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

async function generateWords({
  cefrLevel,
  count,
  aiClient,
  excludedWords,
}: {
  cefrLevel: CefrLevel;
  count: number;
  aiClient: ReturnType<typeof getAIClient>;
  excludedWords: Iterable<string>;
}) {
  const exclusions = Array.from(excludedWords).slice(-EXCLUSION_PROMPT_LIMIT);
  const requestBody = {
    model: aiClient.model,
    max_tokens: getMaxTokens(count),
    messages: [
      {
        role: "system",
        content:
          "You create high-quality English vocabulary seed data for Korean learners. Return JSON only. Do not include markdown, comments, prose, or explanations.",
      },
      {
        role: "user",
        content: [
          `Generate exactly ${count} unique English vocabulary words for CEFR ${cefrLevel}.`,
          `Only include words appropriate for CEFR ${cefrLevel}.`,
          exclusions.length > 0
            ? `Avoid these already-used words when possible: ${exclusions.join(", ")}.`
            : "",
          "Use words that are frequently used in real English learning.",
          "meaning must be natural Korean.",
          `example must be a natural English sentence at CEFR ${cefrLevel} difficulty.`,
          "example_meaning must be a natural Korean translation of the example.",
          "part_of_speech must be included.",
          "pronunciation must be IPA.",
          `Every item must use cefr_level "${cefrLevel}".`,
          "Return JSON only.",
        ].join(" "),
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "word_seed_data",
        strict: true,
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            words: {
              type: "array",
              minItems: count,
              maxItems: count,
              items: {
                type: "object",
                additionalProperties: false,
                properties: {
                  word: { type: "string" },
                  meaning: { type: "string" },
                  example: { type: "string" },
                  example_meaning: { type: "string" },
                  pronunciation: { type: "string" },
                  part_of_speech: { type: "string" },
                  cefr_level: { type: "string", enum: [cefrLevel] },
                },
                required: [
                  "word",
                  "meaning",
                  "example",
                  "example_meaning",
                  "pronunciation",
                  "part_of_speech",
                  "cefr_level",
                ],
              },
            },
          },
          required: ["words"],
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
      "X-Title": "english-study seed words",
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

  const chatCompletionResponse = responseBody as ChatCompletionResponse;
  const parsed = parseAIJson(chatCompletionResponse);
  if (!Array.isArray(parsed.words)) {
    throw new Error(
      `${aiClient.providerName} response did not include a words array.`,
    );
  }

  if (parsed.words.length !== count) {
    throw new Error(
      `${aiClient.providerName} returned ${parsed.words.length} words, but ${count} were requested.`,
    );
  }

  return parsed.words.map((word) => normalizeSeedWord(word, cefrLevel));
}

async function generateNewWords({
  cefrLevel,
  count,
  aiClient,
  excludedWords,
}: {
  cefrLevel: CefrLevel;
  count: number;
  aiClient: ReturnType<typeof getAIClient>;
  excludedWords: Set<string>;
}) {
  const wordsToInsert: SeedWord[] = [];
  let attempts = 0;

  while (wordsToInsert.length < count && attempts < 5) {
    attempts += 1;
    const remainingCount = count - wordsToInsert.length;
    const generatedWords = await generateWords({
      cefrLevel,
      count: remainingCount,
      aiClient,
      excludedWords,
    });
    const uniqueGeneratedWords = dedupeWords(generatedWords, cefrLevel);
    const newWords = uniqueGeneratedWords.filter(({ word }) => {
      const normalizedWord = normalizeWord(word);
      if (excludedWords.has(normalizedWord)) {
        return false;
      }

      excludedWords.add(normalizedWord);
      return true;
    });

    wordsToInsert.push(...newWords);

    if (newWords.length === 0) {
      break;
    }
  }

  return wordsToInsert;
}

async function seedWordsInBatches({
  supabase,
  cefrLevel,
  count,
  batchSize,
  maxRetries,
  aiClient,
  excludedWords,
  progress,
}: {
  supabase: WordsSupabaseClient;
  cefrLevel: CefrLevel;
  count: number;
  batchSize: number;
  maxRetries: number;
  aiClient: ReturnType<typeof getAIClient>;
  excludedWords: Set<string>;
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

    const wordsToInsert = await withRetries(
      () =>
        generateNewWords({
          cefrLevel,
          count: currentBatchSize,
          aiClient,
          excludedWords,
        }),
      maxRetries,
      `generate ${cefrLevel} batch ${batchNumber}`,
    );

    if (wordsToInsert.length === 0) {
      progress.skippedCount += currentBatchSize;
      saveProgress(progress);
      console.log(
        `Batch ${batchNumber}: no new words generated. Progress saved; rerun to continue.`,
      );
      break;
    }

    const insertedWords = await withRetries(
      () => insertWords(supabase, wordsToInsert),
      maxRetries,
      `insert ${cefrLevel} batch ${batchNumber}`,
    );

    progress.insertedCount += insertedWords.length;
    progress.skippedCount += currentBatchSize - insertedWords.length;
    progress.updatedAt = new Date().toISOString();
    saveProgress(progress);

    console.log(
      `Batch ${batchNumber}: inserted=${insertedWords.length}, skipped=${currentBatchSize - insertedWords.length}, progress=${progress.insertedCount}/${count}`,
    );
  }

  return {
    insertedCount: progress.insertedCount,
    skippedCount: progress.skippedCount,
  };
}

async function insertWords(
  supabase: WordsSupabaseClient,
  words: SeedWord[],
) {
  const { data, error } = await supabase.from("words").insert(words).select("word");

  if (error) {
    throw new Error(`Failed to insert words: ${error.message}`);
  }

  return data ?? [];
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

async function fetchExistingWordSet(
  supabase: WordsSupabaseClient,
  cefrLevel: CefrLevel,
) {
  const words = new Set<string>();
  const pageSize = 1000;
  let from = 0;

  while (true) {
    const to = from + pageSize - 1;
    const { data, error } = await supabase
      .from("words")
      .select("word")
      .eq("cefr_level", cefrLevel)
      .range(from, to);

    if (error) {
      throw new Error(`Failed to fetch existing words: ${error.message}`);
    }

    for (const row of data ?? []) {
      words.add(normalizeWord(String(row.word)));
    }

    if (!data || data.length < pageSize) {
      break;
    }

    from += pageSize;
  }

  return words;
}

function loadOrCreateProgress({
  cefrLevel,
  count,
  batchSize,
}: {
  cefrLevel: CefrLevel;
  count: number;
  batchSize: number;
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
  return resolve(PROGRESS_DIR, `${cefrLevel}-${count}.json`);
}

function sleep(ms: number) {
  return new Promise((resolveSleep) => {
    setTimeout(resolveSleep, ms);
  });
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function getMaxTokens(count: number) {
  return Math.min(12_000, Math.max(1_000, count * 180 + 500));
}

function parseAIJson(body: ChatCompletionResponse) {
  const outputText = body.choices?.[0]?.message?.content;

  if (!outputText) {
    throw new Error("AI response did not include output text.");
  }

  return JSON.parse(outputText) as { words?: unknown[] };
}

function normalizeSeedWord(word: unknown, cefrLevel: CefrLevel): SeedWord {
  if (!word || typeof word !== "object") {
    throw new Error("AI returned an invalid word item.");
  }

  const item = word as Record<string, unknown>;
  const normalized = {
    word: requiredString(item.word, "word"),
    meaning: requiredString(item.meaning, "meaning"),
    example: requiredString(item.example, "example"),
    example_meaning: requiredString(item.example_meaning, "example_meaning"),
    pronunciation: requiredString(item.pronunciation, "pronunciation"),
    part_of_speech: requiredString(item.part_of_speech, "part_of_speech"),
    cefr_level: cefrLevel,
  };

  return normalized;
}

function requiredString(value: unknown, fieldName: string) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`AI returned an invalid ${fieldName}.`);
  }

  return value.trim();
}

function dedupeWords(words: SeedWord[], cefrLevel: CefrLevel) {
  const seen = new Set<string>();

  return words.filter((word) => {
    if (word.cefr_level !== cefrLevel) {
      return false;
    }

    const key = normalizeWord(word.word);
    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function normalizeWord(word: string) {
  return word.trim().toLocaleLowerCase("en-US");
}
