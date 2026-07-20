type ChatCompletionResponse = {
  choices?: Array<{
    finish_reason?: string | null;
    message?: {
      content?: string | null;
    };
  }>;
};

type ChatCompletionErrorResponse = {
  error?: {
    message?: string;
  };
};

const DEFAULT_OPENROUTER_MODEL = "google/gemma-4-26b-a4b-it:free";
const DEFAULT_OPENAI_MODEL = "gpt-4.1-mini";
const OPENROUTER_EMPTY_RESPONSE_RETRIES = 2;

type JsonSchemaFormat = {
  name: string;
  schema: Record<string, unknown>;
  strict?: boolean;
};

export async function generateJsonWithAI({
  messages,
  responseFormat,
  model,
  maxTokens = 1200,
  requireOpenAI = false,
  requireOpenRouter = false,
}: {
  messages: Array<{
    role: "system" | "user";
    content: string;
  }>;
  responseFormat: JsonSchemaFormat;
  model?: string;
  maxTokens?: number;
  requireOpenAI?: boolean;
  requireOpenRouter?: boolean;
}) {
  const aiClient = getAIClient({ requireOpenAI, requireOpenRouter });
  const requestedModel = model ?? aiClient.model;
  const requestBody = {
    model: requestedModel,
    max_tokens: maxTokens,
    messages,
    response_format: {
      type: "json_schema",
      json_schema: {
        name: responseFormat.name,
        strict: responseFormat.strict ?? true,
        schema: responseFormat.schema,
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
  const maxAttempts = aiClient.usesOpenRouter
    ? OPENROUTER_EMPTY_RESPONSE_RETRIES + 1
    : 1;
  let lastFinishReason: string | null | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const response = await fetch(aiClient.endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${aiClient.apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://localhost",
        "X-Title": "english-study ai tools",
      },
      body: JSON.stringify(requestBody),
    });

    const body = (await response.json()) as
      | ChatCompletionResponse
      | ChatCompletionErrorResponse;

    if (!response.ok) {
      const message =
        "error" in body && body.error?.message
          ? body.error.message
          : response.statusText;
      throw new Error(`${aiClient.providerName} request failed: ${message}`);
    }

    const firstChoice = (body as ChatCompletionResponse).choices?.[0];
    lastFinishReason = firstChoice?.finish_reason;
    const outputText = firstChoice?.message?.content;

    if (typeof outputText === "string" && outputText.trim().length > 0) {
      return parseJsonOutput(outputText);
    }

    logEmptyAIResponse({
      aiClient,
      requestedModel,
      attempt,
      maxAttempts,
      response,
      body,
    });
  }

  throw new Error(
    `${aiClient.providerName} response did not include text.${getFinishReasonMessage(
      lastFinishReason,
    )}`,
  );
}

function parseJsonOutput(outputText: string) {
  const text = outputText.trim();

  try {
    return JSON.parse(text) as unknown;
  } catch (originalError) {
    const unfencedText = stripJsonCodeFence(text);

    if (unfencedText !== text) {
      return JSON.parse(unfencedText) as unknown;
    }

    const embeddedJson = extractFirstJsonObject(text);

    if (embeddedJson) {
      return JSON.parse(embeddedJson) as unknown;
    }

    throw originalError;
  }
}

function stripJsonCodeFence(text: string) {
  const match = text.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);

  return match ? match[1].trim() : text;
}

function extractFirstJsonObject(text: string) {
  let startIndex = -1;
  let depth = 0;
  let isInsideString = false;
  let isEscaped = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];

    if (startIndex === -1) {
      if (character === "{") {
        startIndex = index;
        depth = 1;
      }

      continue;
    }

    if (isInsideString) {
      if (isEscaped) {
        isEscaped = false;
      } else if (character === "\\") {
        isEscaped = true;
      } else if (character === '"') {
        isInsideString = false;
      }

      continue;
    }

    if (character === '"') {
      isInsideString = true;
    } else if (character === "{") {
      depth += 1;
    } else if (character === "}") {
      depth -= 1;

      if (depth === 0) {
        return text.slice(startIndex, index + 1);
      }
    }
  }

  return null;
}

function getFinishReasonMessage(finishReason: string | null | undefined) {
  return finishReason ? ` Finish reason: ${finishReason}.` : "";
}

function logEmptyAIResponse({
  aiClient,
  requestedModel,
  attempt,
  maxAttempts,
  response,
  body,
}: {
  aiClient: ReturnType<typeof getAIClient>;
  requestedModel: string;
  attempt: number;
  maxAttempts: number;
  response: Response;
  body: ChatCompletionResponse | ChatCompletionErrorResponse;
}) {
  if (!aiClient.usesOpenRouter) {
    return;
  }

  console.warn(`${aiClient.providerName} response did not include text.`, {
    attempt,
    maxAttempts,
    requestedModel,
    status: response.status,
    statusText: response.statusText,
    body,
  });
}

function getAIClient({
  requireOpenAI,
  requireOpenRouter,
}: {
  requireOpenAI: boolean;
  requireOpenRouter: boolean;
}) {
  const openRouterKey = process.env.OPENROUTER_API_KEY;

  if (requireOpenRouter) {
    if (!openRouterKey) {
      throw new Error("OPENROUTER_API_KEY is required.");
    }

    return {
      apiKey: openRouterKey,
      endpoint: "https://openrouter.ai/api/v1/chat/completions",
      model: process.env.OPENROUTER_MODEL ?? DEFAULT_OPENROUTER_MODEL,
      providerName: "OpenRouter",
      usesOpenRouter: true,
    };
  }

  const openAIKey = process.env.OPENAI_API_KEY;
  if (openAIKey) {
    return {
      apiKey: openAIKey,
      endpoint: "https://api.openai.com/v1/chat/completions",
      model: process.env.OPENAI_MODEL ?? DEFAULT_OPENAI_MODEL,
      providerName: "OpenAI",
      usesOpenRouter: false,
    };
  }

  if (requireOpenAI) {
    throw new Error("OPENAI_API_KEY is required.");
  }

  if (openRouterKey) {
    return {
      apiKey: openRouterKey,
      endpoint: "https://openrouter.ai/api/v1/chat/completions",
      model: process.env.OPENROUTER_MODEL ?? DEFAULT_OPENROUTER_MODEL,
      providerName: "OpenRouter",
      usesOpenRouter: true,
    };
  }

  throw new Error("OPENAI_API_KEY or OPENROUTER_API_KEY is required.");
}
