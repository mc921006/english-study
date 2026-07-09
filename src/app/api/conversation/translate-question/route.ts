import { NextResponse } from "next/server";
import { generateJsonWithAI } from "@/lib/server/ai";

type TranslateQuestionRequest = {
  question?: unknown;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as TranslateQuestionRequest;
    const question = requiredString(body.question, "question");
    const result = await generateJsonWithAI({
      requireOpenRouter: true,
      maxTokens: 400,
      messages: [
        {
          role: "system",
          content: [
            "You translate English conversation practice questions into Korean.",
            "Return JSON only and follow the schema exactly.",
          ].join(" "),
        },
        {
          role: "user",
          content: [
            "Translate this English question into natural Korean for a Korean English learner.",
            "Keep the meaning accurate and conversational.",
            "Return only the Korean translation in the translation field.",
            `Question: ${question}`,
          ].join("\n"),
        },
      ],
      responseFormat: {
        name: "conversation_question_translation",
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            translation: { type: "string" },
          },
          required: ["translation"],
        },
      },
    });

    if (!isTranslationResponse(result)) {
      throw new Error("AI response had an invalid shape.");
    }

    return NextResponse.json({ translation: result.translation.trim() });
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

function isTranslationResponse(value: unknown): value is {
  translation: string;
} {
  return (
    Boolean(value) &&
    typeof value === "object" &&
    typeof (value as { translation?: unknown }).translation === "string"
  );
}
