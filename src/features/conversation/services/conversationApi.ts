import type {
  ConversationFeedback,
  ConversationQuestion,
  ConversationTopic,
  SubmitConversationAnswerRequest,
  SubmitConversationAnswerResult,
} from "@/types/conversation";
import { getMockAnswerEvaluation } from "../data/conversationDummyData";

const MOCK_DELAY_MS = 180;

function waitForMockResponse() {
  return new Promise((resolve) => {
    window.setTimeout(resolve, MOCK_DELAY_MS);
  });
}

function createQuestion(
  topic: ConversationTopic,
  text: string,
  turnIndex: number,
): ConversationQuestion {
  return {
    id: `${topic.id}-${turnIndex + 1}`,
    topicId: topic.id,
    text,
    turnIndex,
  };
}

function validateAnswer(answer: string) {
  const normalizedAnswer = answer.trim();

  if (!normalizedAnswer) {
    throw new Error("영어 답변을 입력해주세요.");
  }

  if (!/[A-Za-z]/.test(normalizedAnswer)) {
    throw new Error("영어 알파벳이 포함된 문장으로 답변해주세요.");
  }

  if (normalizedAnswer.split(/\s+/).length < 2) {
    throw new Error("두 단어 이상으로 조금 더 자세히 답변해주세요.");
  }
}

export async function getConversationQuestion(
  topic: ConversationTopic,
): Promise<ConversationQuestion> {
  await waitForMockResponse();

  return createQuestion(topic, topic.starterQuestion, 0);
}

export async function submitAnswer({
  topic,
  question,
  answer,
}: SubmitConversationAnswerRequest): Promise<SubmitConversationAnswerResult> {
  await waitForMockResponse();
  validateAnswer(answer);

  const mockEvaluation = getMockAnswerEvaluation(topic.id, question.turnIndex);
  const feedback: ConversationFeedback = {
    summaryKo: mockEvaluation.summaryKo,
    tipKo: mockEvaluation.tipKo,
    correction: mockEvaluation.correction,
  };

  return {
    feedback,
    nextQuestion: createQuestion(
      topic,
      mockEvaluation.nextQuestion,
      question.turnIndex + 1,
    ),
  };
}
