import type {
  ConversationQuestion,
  ConversationTurn,
} from "@/types/conversation";
import { ConversationFeedbackCard } from "./ConversationFeedbackCard";
import styles from "./Conversation.module.scss";

type ConversationThreadProps = Readonly<{
  currentQuestion: ConversationQuestion | null;
  isLoadingQuestion?: boolean;
  turns: ConversationTurn[];
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
  isLoadingQuestion = false,
  turns,
}: ConversationThreadProps) {
  return (
    <div className={styles.thread} aria-live="polite">
      {turns.map((turn, index) => (
        <div className={styles.turn} key={turn.id}>
          <ChatMessage speaker="AI" text={turn.question.text} />
          <ChatMessage speaker="You" text={turn.answer} variant="user" />
          <ConversationFeedbackCard
            feedback={turn.feedback}
            turnNumber={index + 1}
          />
        </div>
      ))}

      {isLoadingQuestion ? (
        <ChatMessage speaker="AI" text="Generating a question..." />
      ) : currentQuestion ? (
        <ChatMessage speaker="AI" text={currentQuestion.text} />
      ) : null}
    </div>
  );
}
