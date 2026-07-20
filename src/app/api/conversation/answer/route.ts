import { NextResponse } from "next/server";
import type { ConversationFeedback } from "@/types/conversation";
import { generateJsonWithAI } from "@/lib/server/ai";

type TopicPayload = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
};

type QuestionPayload = {
  text: string;
  turnIndex: number;
};

type ConversationAnswerRequest = {
  topic?: unknown;
  question?: unknown;
  answer?: unknown;
  previousQuestions?: unknown;
};

const PREVIOUS_QUESTION_LIMIT = 12;
const DEFAULT_CONVERSATION_FEEDBACK_MODEL = "tencent/hy3:free";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ConversationAnswerRequest;
    const topic = requiredTopic(body.topic);
    const question = requiredQuestion(body.question);
    const answer = requiredAnswer(body.answer);
    const previousQuestions = optionalStringArray(
      body.previousQuestions,
      "previousQuestions",
    );
    const result = await generateJsonWithAI({
      requireOpenRouter: true,
      model:
        process.env.OPENROUTER_CONVERSATION_FEEDBACK_MODEL ??
        DEFAULT_CONVERSATION_FEEDBACK_MODEL,
      maxTokens: 1800,
      messages: [
        {
          role: "system",
          content: [
            "You are an AI English teacher for Korean learners.",
            "Analyze the learner's actual English answer.",
            "Explain grammar and vocabulary issues in short, easy Korean.",
            "All feedback fields except correctedSentence, betterExpression, and nextQuestion must be written in Korean.",
            "Return JSON only and follow the schema exactly.",
          ].join(" "),
        },
        {
          role: "user",
          content: [
            "Evaluate the user's answer for text-based English conversation practice.",
            "Base every field on the user's actual answer.",
            "Write goodPoint in Korean.",
            "Write grammarCorrection in Korean and explain exactly what is wrong and why.",
            "Write vocabularyCorrection in Korean when it is not null.",
            "vocabularyCorrection must be one Korean string or null. Never return an array for vocabularyCorrection.",
            "If the answer has an unnatural word choice, noun form, preposition, or collocation, explain it in vocabularyCorrection instead of returning null.",
            "For example, if the learner writes 'play game', explain that 'play games' is more natural.",
            "Write koreanExplanation in Korean.",
            "Write nextTip in Korean.",
            "If there is no vocabulary issue, set vocabularyCorrection to null.",
            "correctedSentence must be a direct correction of the user's sentence.",
            "correctedSentence must fix both grammar and vocabulary mistakes instead of preserving unnatural word choices.",
            "betterExpression must be a more natural English version that the learner can reuse.",
            "nextQuestion must naturally continue the same topic using the previous question and user answer.",
            "nextQuestion must sound like something a native speaker friend might ask in a casual chat.",
            "nextQuestion must be one English question and must not repeat the current question.",
            "Aim for 15 words or fewer in nextQuestion.",
            "Use natural contractions in nextQuestion when they fit, like what's, you're, it's, don't, or I'm.",
            "Make nextQuestion easy to answer with one or two simple sentences.",
            "nextQuestionTranslation must be a natural Korean translation of nextQuestion.",
            "Use simple A2-B1 English for nextQuestion when no CEFR level is provided.",
            "nextQuestion must not repeat, closely paraphrase, or ask for almost the same answer as any previousQuestions item.",
            "If previousQuestions is not empty, choose a clearly different everyday angle and wording.",
            "Vary nextQuestion openings naturally across options like Are you, Did you, Do you, Have you, What's, What did, Where do, Who do, When do, or How's.",
            "Prefer concrete everyday moments: today, lately, after work, at home, weekends, meals, plans, small events, moods, habits, or simple preferences.",
            "For Daily Life, prefer small real-life angles like being busy, getting home, dinner, errands, chores, relaxing, weekends, sleep, coffee, commute, or something fun today.",
            "Avoid exam or interview questions.",
            "Avoid textbook-style, abstract, essay-like, pros-and-cons, compare-and-contrast, or describe-in-detail questions.",
            "Do not ask the learner to analyze deeply, list advantages and disadvantages, compare life stages, or describe their whole routine in detail.",
            "Avoid nextQuestion patterns like: How has your daily routine changed compared to when you were a student?",
            "Avoid nextQuestion patterns like: What are the advantages and disadvantages of your daily routine?",
            "Avoid nextQuestion patterns like: Describe your daily life in detail.",
            "Prefer nextQuestion patterns like: Are you busy these days?",
            "Prefer nextQuestion patterns like: What did you do after work today?",
            "Prefer nextQuestion patterns like: What do you usually do when you get home?",
            "Prefer nextQuestion patterns like: Did anything fun happen today?",
            "Prefer nextQuestion patterns like: What's your favorite part of the weekend?",
            "Prefer a natural conversation flow from the learner's answer, but move to a new casual angle instead of a reworded follow-up.",
            "Keep Korean explanations short and beginner-friendly.",
            `Topic id: ${topic.id}`,
            `Topic title: ${topic.title}`,
            `Topic Korean label: ${topic.subtitle}`,
            `Topic description: ${topic.description}`,
            `Current question: ${question.text}`,
            `Turn index: ${question.turnIndex}`,
            `User answer: ${answer}`,
            `previousQuestions:\n${formatPreviousQuestions(previousQuestions)}`,
          ].join("\n"),
        },
      ],
      responseFormat: {
        name: "conversation_feedback",
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            goodPoint: { type: "string" },
            grammarCorrection: { type: "string" },
            vocabularyCorrection: {
              type: ["string", "null"],
              description:
                "One Korean string explaining vocabulary issues, or null when there is no vocabulary issue. Never an array.",
            },
            correctedSentence: { type: "string" },
            betterExpression: { type: "string" },
            koreanExplanation: { type: "string" },
            nextTip: { type: "string" },
            nextQuestion: {
              type: "string",
              description:
                "One short, casual, friend-like English question, ideally 15 words or fewer.",
            },
            nextQuestionTranslation: { type: "string" },
          },
          required: [
            "goodPoint",
            "grammarCorrection",
            "vocabularyCorrection",
            "correctedSentence",
            "betterExpression",
            "koreanExplanation",
            "nextTip",
            "nextQuestion",
            "nextQuestionTranslation",
          ],
        },
      },
    });

    const feedback = normalizeConversationFeedback(result);

    if (!feedback) {
      throw new Error("AI response had an invalid shape.");
    }

    return NextResponse.json({
      feedback: {
        ...feedback,
        nextQuestion: cleanGeneratedText(feedback.nextQuestion, "nextQuestion"),
        nextQuestionTranslation: cleanGeneratedText(
          feedback.nextQuestionTranslation,
          "nextQuestionTranslation",
        ),
      },
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

function requiredQuestion(value: unknown): QuestionPayload {
  if (!value || typeof value !== "object") {
    throw new Error("question is required.");
  }

  const turnIndex = (value as { turnIndex?: unknown }).turnIndex;

  if (typeof turnIndex !== "number" || !Number.isFinite(turnIndex)) {
    throw new Error("question.turnIndex is required.");
  }

  return {
    text: requiredString((value as { text?: unknown }).text, "question.text"),
    turnIndex,
  };
}

function requiredAnswer(value: unknown) {
  const answer = requiredString(value, "answer");

  if (!/[A-Za-z]/.test(answer)) {
    throw new Error("영어 알파벳이 포함된 문장으로 답변해주세요.");
  }

  if (answer.split(/\s+/).length < 2) {
    throw new Error("두 단어 이상으로 조금 더 자세히 답변해주세요.");
  }

  return answer;
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

function normalizeConversationFeedback(
  value: unknown,
): ConversationFeedback | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const feedback = value as Partial<
    Record<keyof ConversationFeedback, unknown>
  >;
  const goodPoint = normalizeRequiredString(feedback.goodPoint);
  const grammarCorrection = normalizeRequiredString(feedback.grammarCorrection);
  const vocabularyCorrection = normalizeVocabularyCorrection(
    feedback.vocabularyCorrection,
  );
  const correctedSentence = normalizeRequiredString(feedback.correctedSentence);
  const betterExpression = normalizeRequiredString(feedback.betterExpression);
  const koreanExplanation = normalizeRequiredString(feedback.koreanExplanation);
  const nextTip = normalizeRequiredString(feedback.nextTip);
  const nextQuestion = normalizeRequiredString(feedback.nextQuestion);
  const nextQuestionTranslation = normalizeRequiredString(
    feedback.nextQuestionTranslation,
  );

  if (
    !goodPoint ||
    !grammarCorrection ||
    vocabularyCorrection === undefined ||
    !correctedSentence ||
    !betterExpression ||
    !koreanExplanation ||
    !nextTip ||
    !nextQuestion ||
    !nextQuestionTranslation
  ) {
    return null;
  }

  return {
    goodPoint,
    grammarCorrection,
    vocabularyCorrection,
    correctedSentence,
    betterExpression,
    koreanExplanation,
    nextTip,
    nextQuestion,
    nextQuestionTranslation,
  };
}

function normalizeRequiredString(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const text = value.trim();

  return text.length > 0 ? text : null;
}

function normalizeVocabularyCorrection(value: unknown) {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value === "string") {
    const text = value.trim();

    return text.length > 0 ? text : null;
  }

  if (Array.isArray(value) && value.every((item) => typeof item === "string")) {
    const text = value
      .map((item) => item.trim())
      .filter(Boolean)
      .join(" ");

    return text.length > 0 ? text : null;
  }

  return undefined;
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
    throw new Error(`AI response included invalid JSON fragments in ${fieldName}.`);
  }

  return text;
}
