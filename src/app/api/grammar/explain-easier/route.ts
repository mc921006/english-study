import { NextResponse } from "next/server";
import { generateJsonWithAI } from "@/lib/server/ai";

type ExplainEasierRequest = {
  title?: unknown;
  description?: unknown;
  example?: unknown;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ExplainEasierRequest;
    const title = requiredString(body.title, "title");
    const description = requiredString(body.description, "description");
    const example = requiredString(body.example, "example");
    const result = await generateJsonWithAI({
      maxTokens: 900,
      messages: [
        {
          role: "system",
          content:
            "You explain English grammar to Korean learners. Return JSON only.",
        },
        {
          role: "user",
          content: [
            "초등학생도 이해할 수 있는 아주 쉬운 한국어로 설명하세요.",
            "짧고 친절하게, 핵심만 설명하세요.",
            `Grammar title: ${title}`,
            `Description: ${description}`,
            `Example: ${example}`,
          ].join("\n"),
        },
      ],
      responseFormat: {
        name: "grammar_explain_easier",
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            explanation: { type: "string" },
          },
          required: ["explanation"],
        },
      },
    });

    if (!isExplainEasierResponse(result)) {
      throw new Error("AI response had an invalid shape.");
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Request failed." },
      { status: 400 },
    );
  }
}

function requiredString(value: unknown, fieldName: string) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${fieldName} is required.`);
  }

  return value.trim();
}

function isExplainEasierResponse(value: unknown): value is { explanation: string } {
  return (
    Boolean(value) &&
    typeof value === "object" &&
    typeof (value as { explanation?: unknown }).explanation === "string"
  );
}
