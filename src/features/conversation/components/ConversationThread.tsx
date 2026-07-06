import type {
  ConversationQuestion,
  ConversationTurn,
} from "@/types/conversation";
import { ConversationFeedbackCard } from "./ConversationFeedbackCard";
import styles from "./Conversation.module.scss";

type ConversationThreadProps = Readonly<{
  currentQuestion: ConversationQuestion | null;
  hasPendingNextQuestion?: boolean;
  isLoadingQuestion?: boolean;
  latestTurn: ConversationTurn | null;
  onNextQuestion: () => void;
}>;

type ChatMessageProps = Readonly<{
  speaker: "AI" | "You";
  text: string;
  variant?: "ai" | "user";
}>;

function ChatMessage({ speaker, text, variant = "ai" }: ChatMessageProps) {
  return (
    <div className={variant === "user" ? styles.userMessage : styles.aiMessage}>
      <span>{speaker}</span>
      <p>{text}</p>
    </div>
  );
}

export function ConversationThread({
  currentQuestion,
  hasPendingNextQuestion = false,
  isLoadingQuestion = false,
  latestTurn,
  onNextQuestion,
}: ConversationThreadProps) {
  return (
    <div className={styles.thread} aria-live="polite">
      {isLoadingQuestion ? (
        <ChatMessage speaker="AI" text="Generating a question..." />
      ) : currentQuestion ? (
        <ChatMessage speaker="AI" text={currentQuestion.text} />
      ) : null}

      {latestTurn ? (
        <div className={styles.turn}>
          <ChatMessage speaker="You" text={latestTurn.answer} variant="user" />
          <ConversationFeedbackCard feedback={latestTurn.feedback} />
          {hasPendingNextQuestion ? (
            <button
              className={styles.primaryButton}
              type="button"
              onClick={onNextQuestion}
            >
              Next question
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
