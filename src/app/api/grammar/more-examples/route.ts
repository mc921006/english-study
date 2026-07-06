import { NextResponse } from "next/server";
import { generateJsonWithAI } from "@/lib/server/ai";

type MoreExamplesRequest = {
  title?: unknown;
  description?: unknown;
  cefr_level?: unknown;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as MoreExamplesRequest;
    const title = requiredString(body.title, "title");
    const description = requiredString(body.description, "description");
    const cefrLevel = requiredString(body.cefr_level, "cefr_level");
    const result = await generateJsonWithAI({
      maxTokens: 1200,
      messages: [
        {
          role: "system",
          content:
            "You create English grammar examples for Korean learners. Return JSON only.",
        },
        {
          role: "user",
          content: [
            `Create exactly 3 English example sentences for CEFR ${cefrLevel}.`,
            "Each example must match the grammar point and be appropriate for the CEFR level.",
            "Add natural Korean translations.",
            `Grammar title: ${title}`,
            `Description: ${description}`,
          ].join("\n"),
        },
      ],
      responseFormat: {
        name: "grammar_more_examples",
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            examples: {
              type: "array",
              minItems: 3,
              maxItems: 3,
              items: {
                type: "object",
                additionalProperties: false,
                properties: {
                  example: { type: "string" },
                  example_meaning: { type: "string" },
                },
                required: ["example", "example_meaning"],
              },
            },
          },
          required: ["examples"],
        },
      },
    });

    if (!isMoreExamplesResponse(result)) {
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

function isMoreExamplesResponse(value: unknown): value is {
  examples: Array<{ example: string; example_meaning: string }>;
} {
  if (!value || typeof value !== "object") {
    return false;
  }

  const examples = (value as { examples?: unknown }).examples;

  return (
    Array.isArray(examples) &&
    examples.length === 3 &&
    examples.every(
      (item) =>
        item &&
        typeof item === "object" &&
        typeof (item as { example?: unknown }).example === "string" &&
        typeof (item as { example_meaning?: unknown }).example_meaning ===
          "string",
    )
  );
}
