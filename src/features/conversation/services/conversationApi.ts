import type {
  ConversationQuestion,
  ConversationTopic,
  SubmitConversationAnswerRequest,
  SubmitConversationAnswerResult,
} from "@/types/conversation";

function createQuestion(
  topic: ConversationTopic,
  text: string,
  translation: string,
  turnIndex: number,
): ConversationQuestion {
  return {
    id: `${topic.id}-${turnIndex + 1}`,
    topicId: topic.id,
    text,
    translation,
    turnIndex,
  };
}

export async function getConversationQuestion(
  topic: ConversationTopic,
  previousQuestions: string[] = [],
): Promise<ConversationQuestion> {
  const response = await fetch("/api/conversation/question", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic, previousQuestions }),
  });
  const result = (await response.json()) as {
    question?: string;
    translation?: string;
    error?: string;
  };

  if (!response.ok || !result.question || !result.translation) {
    throw new Error(result.error ?? "질문을 생성하지 못했습니다.");
  }

  return createQuestion(topic, result.question, result.translation, 0);
}

export async function submitAnswer({
  topic,
  question,
  answer,
  previousQuestions = [],
}: SubmitConversationAnswerRequest): Promise<SubmitConversationAnswerResult> {
  const response = await fetch("/api/conversation/answer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      topic,
      question,
      answer,
      previousQuestions,
    }),
  });
  const result = (await response.json()) as
    | { feedback?: SubmitConversationAnswerResult["feedback"] }
    | { error?: string };

  if (!response.ok || !("feedback" in result) || !result.feedback) {
    throw new Error(
      "error" in result && result.error
        ? result.error
        : "답변을 확인하지 못했습니다.",
    );
  }

  return {
    feedback: result.feedback,
    nextQuestion: createQuestion(
      topic,
      result.feedback.nextQuestion,
      result.feedback.nextQuestionTranslation,
      question.turnIndex + 1,
    ),
  };
}
