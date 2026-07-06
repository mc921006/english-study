import type { ConversationFeedback } from "@/types/conversation";
import styles from "./Conversation.module.scss";

type ConversationFeedbackCardProps = Readonly<{
  feedback: ConversationFeedback;
  turnNumber: number;
}>;

export function ConversationFeedbackCard({
  feedback,
  turnNumber,
}: ConversationFeedbackCardProps) {
  return (
    <article className={styles.feedbackCard}>
      <div className={styles.feedbackHeader}>
        <span className={styles.kicker}>Feedback</span>
        <h3>{turnNumber}번째 답변 평가</h3>
      </div>

      <div className={styles.feedbackSection}>
        <span>짧은 피드백</span>
        <p>{feedback.summaryKo}</p>
      </div>

      <div className={styles.feedbackSection}>
        <span>다음 답변 팁</span>
        <p>{feedback.tipKo}</p>
      </div>

      {feedback.correction ? (
        <div className={styles.expressionBox}>
          <span>교정 문장</span>
          <p className={styles.expressionBefore}>
            {feedback.correction.before}
          </p>
          <p className={styles.expressionAfter}>
            {feedback.correction.after}
          </p>
          <p className={styles.expressionNote}>
            {feedback.correction.noteKo}
          </p>
        </div>
      ) : null}
    </article>
  );
}
