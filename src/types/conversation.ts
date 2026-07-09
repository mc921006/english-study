export type ConversationTopic = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
};

export type ConversationQuestion = {
  id: string;
  topicId: string;
  text: string;
  turnIndex: number;
};

export type ConversationFeedback = {
  goodPoint: string;
  grammarCorrection: string;
  vocabularyCorrection: string | null;
  correctedSentence: string;
  betterExpression: string;
  koreanExplanation: string;
  nextTip: string;
  nextQuestion: string;
};

export type SubmitConversationAnswerRequest = {
  topic: ConversationTopic;
  question: ConversationQuestion;
  answer: string;
  previousQuestions?: string[];
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
