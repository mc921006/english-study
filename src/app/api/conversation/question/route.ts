import { NextResponse } from "next/server";
import { generateJsonWithAI } from "@/lib/server/ai";

type TopicPayload = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
};

type ConversationQuestionRequest = {
  topic?: unknown;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ConversationQuestionRequest;
    const topic = requiredTopic(body.topic);
    const variationSeed = crypto.randomUUID();
    const result = await generateJsonWithAI({
      requireOpenRouter: true,
      maxTokens: 300,
      messages: [
        {
          role: "system",
          content: [
            "You are an English conversation teacher for Korean learners.",
            "Create one natural English conversation question.",
            "Return JSON only.",
          ].join(" "),
        },
        {
          role: "user",
          content: [
            "Generate a fresh first question for text-based English conversation practice.",
            "The learner only selected a topic, not a CEFR level.",
            "Use simple, natural English suitable for a broad range of learners.",
            "Do not reuse a fixed starter question.",
            "Write exactly one question.",
            "The question must match the selected topic.",
            `Variation seed: ${variationSeed}`,
            `Topic id: ${topic.id}`,
            `Topic title: ${topic.title}`,
            `Topic Korean label: ${topic.subtitle}`,
            `Topic description: ${topic.description}`,
          ].join("\n"),
        },
      ],
      responseFormat: {
        name: "conversation_question",
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            question: { type: "string" },
          },
          required: ["question"],
        },
      },
    });

    if (!isConversationQuestionResponse(result)) {
      throw new Error("AI response had an invalid shape.");
    }

    return NextResponse.json({ question: result.question.trim() });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Request failed." },
      { status: 400 },
    );
  }
}

function requiredTopic(value: unknown): TopicPayload {
  if (!value || typeof value !== "object") {
    throw new Error("topic is required.");
  }

  return {
    id: requiredString((value as { id?: unknown }).id, "topic.id"),
    title: requiredString((value as { title?: unknown }).title, "topic.title"),
    subtitle: requiredString(
      (value as { subtitle?: unknown }).subtitle,
      "topic.subtitle",
    ),
    description: requiredString(
      (value as { description?: unknown }).description,
      "topic.description",
    ),
  };
}

function requiredString(value: unknown, fieldName: string) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${fieldName} is required.`);
  }

  return value.trim();
}

function isConversationQuestionResponse(value: unknown): value is {
  question: string;
} {
  return (
    Boolean(value) &&
    typeof value === "object" &&
    typeof (value as { question?: unknown }).question === "string"
  );
}
