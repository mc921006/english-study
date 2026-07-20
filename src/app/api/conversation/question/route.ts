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
  previousQuestions?: unknown;
};

const PREVIOUS_QUESTION_LIMIT = 12;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ConversationQuestionRequest;
    const topic = requiredTopic(body.topic);
    const previousQuestions = optionalStringArray(
      body.previousQuestions,
      "previousQuestions",
    );
    const variationSeed = crypto.randomUUID();
    const result = await generateJsonWithAI({
      requireOpenRouter: true,
      maxTokens: 500,
      messages: [
        {
          role: "system",
          content: [
            "You are an English conversation teacher for Korean learners.",
            "Create one natural English conversation question and its Korean translation.",
            "Return JSON only.",
          ].join(" "),
        },
        {
          role: "user",
          content: [
            "Generate a fresh question for text-based English conversation practice.",
            "The learner only selected a topic, not a CEFR level.",
            "Use simple A2-B1 English suitable for beginner to intermediate learners.",
            "Write exactly one natural real-world English conversation question in question.",
            "Write a natural Korean translation of that exact English question in translation.",
            "The question must stay clearly related to the selected topic.",
            "Do not repeat, closely paraphrase, or ask for almost the same answer as any previousQuestions item.",
            "If previousQuestions is not empty, choose a meaning, wording, opening pattern, and question type that are clearly different from the recent items.",
            "Vary question openings across options like: What, When, Where, Who, Which, Why, How, Do you, Have you, If...",
            "Vary question types across: daily routine, personal experience, habit, opinion, preference, memory, future plan, reason, comparison, problem solving, and imagination.",
            "Within the same topic, choose a concrete sub-angle instead of staying broad.",
            "For Daily Life, possible sub-angles include daily schedule, habits, recent experience, favorite time of day, something to improve, childhood comparison, future plan, weekday/weekend differences, morning/evening routine, and stress relief.",
            "Avoid overused generic patterns like: What is your favorite...?, Do you like...?, What do you usually...?",
            "When previousQuestions exist, consider a natural conversation flow from the latest question, but ask a new angle instead of a reworded follow-up.",
            `Variation seed: ${variationSeed}`,
            `Topic id: ${topic.id}`,
            `Topic title: ${topic.title}`,
            `Topic Korean label: ${topic.subtitle}`,
            `Topic description: ${topic.description}`,
            `previousQuestions:\n${formatPreviousQuestions(previousQuestions)}`,
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
            translation: { type: "string" },
          },
          required: ["question", "translation"],
        },
      },
    });

    if (!isConversationQuestionResponse(result)) {
      throw new Error("AI response had an invalid shape.");
    }

    return NextResponse.json({
      question: cleanGeneratedText(result.question, "question"),
      translation: cleanGeneratedText(result.translation, "translation"),
    });
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

function optionalStringArray(value: unknown, fieldName: string) {
  if (value === undefined) {
    return [];
  }

  if (!Array.isArray(value)) {
    throw new Error(`${fieldName} must be a string array.`);
  }

  return value
    .map((item, index) => requiredString(item, `${fieldName}[${index}]`))
    .slice(-PREVIOUS_QUESTION_LIMIT);
}

function formatPreviousQuestions(questions: string[]) {
  if (questions.length === 0) {
    return "None";
  }

  return questions
    .map((question, index) => `${index + 1}. ${question}`)
    .join("\n");
}

function isConversationQuestionResponse(value: unknown): value is {
  question: string;
  translation: string;
} {
  return (
    Boolean(value) &&
    typeof value === "object" &&
    typeof (value as { question?: unknown }).question === "string" &&
    typeof (value as { translation?: unknown }).translation === "string"
  );
}

function cleanGeneratedText(value: string, fieldName: string) {
  const text = value.trim();

  if (
    /[{}]/.test(text) ||
    /JSON_/i.test(text) ||
    /"?(?:question|translation|nextQuestion|nextQuestionTranslation)"?\s*:/i.test(
      text,
    )
  ) {
    throw new Error(
      `AI response included invalid JSON fragments in ${fieldName}.`,
    );
  }

  return text;
}
