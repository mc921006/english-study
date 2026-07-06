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

const DEFAULT_OPENROUTER_MODEL = "openai/gpt-4.1-mini";
const DEFAULT_OPENAI_MODEL = "gpt-4.1-mini";

type JsonSchemaFormat = {
  name: string;
  schema: Record<string, unknown>;
  strict?: boolean;
};

export async function generateJsonWithAI({
  messages,
  responseFormat,
  maxTokens = 1200,
}: {
  messages: Array<{
    role: "system" | "user";
    content: string;
  }>;
  responseFormat: JsonSchemaFormat;
  maxTokens?: number;
}) {
  const aiClient = getAIClient();
  const response = await fetch(aiClient.endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${aiClient.apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://localhost",
      "X-Title": "english-study grammar tools",
    },
    body: JSON.stringify({
      model: aiClient.model,
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
    }),
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

  const outputText = (body as ChatCompletionResponse).choices?.[0]?.message
    ?.content;

  if (!outputText) {
    throw new Error(`${aiClient.providerName} response did not include text.`);
  }

  return JSON.parse(outputText) as unknown;
}

function getAIClient() {
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

  const openRouterKey = process.env.OPENROUTER_API_KEY;
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
