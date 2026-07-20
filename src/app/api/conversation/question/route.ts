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
            "You create casual English questions for Korean learners.",
            "The question must sound like a native-speaker friend chatting, not an exam, interview, or textbook prompt.",
            "Create one short, easy question and its Korean translation.",
            "Return JSON only.",
          ].join(" "),
        },
        {
          role: "user",
          content: [
            "Generate one fresh casual question for text-based English conversation practice.",
            "The learner only selected a topic, not a CEFR level.",
            "Use simple A2-B1 English suitable for beginner to intermediate learners.",
            "Write exactly one question in question.",
            "The question must sound like something a native speaker might ask a friend.",
            "Use a friendly, relaxed, everyday tone.",
            "Aim for 15 words or fewer.",
            "Use natural contractions when they fit, like what's, you're, it's, don't, or I'm.",
            "Make it easy to answer with one or two simple sentences.",
            "Write a natural Korean translation of that exact English question in translation.",
            "The question must stay clearly related to the selected topic.",
            "Do not repeat, closely paraphrase, or ask for almost the same answer as any previousQuestions item.",
            "If previousQuestions is not empty, choose a clearly different everyday angle and wording.",
            "Vary question openings naturally across options like Are you, Did you, Do you, Have you, What's, What did, Where do, Who do, When do, or How's.",
            "Prefer concrete everyday moments: today, lately, after work, at home, weekends, meals, plans, small events, moods, habits, or simple preferences.",
            "For Daily Life, prefer small real-life angles like being busy, getting home, dinner, errands, chores, relaxing, weekends, sleep, coffee, commute, or something fun today.",
            "Avoid exam or interview questions.",
            "Avoid textbook-style, abstract, essay-like, pros-and-cons, compare-and-contrast, or describe-in-detail questions.",
            "Do not ask the learner to analyze deeply, list advantages and disadvantages, compare life stages, or describe their whole routine in detail.",
            "Avoid questions like: How has your daily routine changed compared to when you were a student?",
            "Avoid questions like: What are the advantages and disadvantages of your daily routine?",
            "Avoid questions like: Describe your daily life in detail.",
            "Prefer questions like: Are you busy these days?",
            "Prefer questions like: What did you do after work today?",
            "Prefer questions like: What do you usually do when you get home?",
            "Prefer questions like: Did anything fun happen today?",
            "Prefer questions like: What's your favorite part of the weekend?",
            "When previousQuestions exist, consider a natural conversation flow from the latest question, but ask a new casual angle instead of a reworded follow-up.",
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
            question: {
              type: "string",
              description:
                "One short, casual, friend-like English question, ideally 15 words or fewer.",
            },
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
