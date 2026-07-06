export type ConversationTopic = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  starterQuestion: string;
};

export type ConversationQuestion = {
  id: string;
  topicId: string;
  text: string;
  turnIndex: number;
};

export type ConversationCorrection = {
  before: string;
  after: string;
  noteKo: string;
};

export type ConversationFeedback = {
  summaryKo: string;
  tipKo: string;
  correction?: ConversationCorrection;
};

export type SubmitConversationAnswerRequest = {
  topic: ConversationTopic;
  question: ConversationQuestion;
  answer: string;
};

export type SubmitConversationAnswerResult = {
  feedback: ConversationFeedback;
  nextQuestion: ConversationQuestion;
};

export type ConversationTurn = {
  id: string;
  question: ConversationQuestion;
  answer: string;
  feedback: ConversationFeedback;
};
