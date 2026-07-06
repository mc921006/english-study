import type { ConversationFeedback } from "@/types/conversation";
import styles from "./Conversation.module.scss";

type ConversationFeedbackCardProps = Readonly<{
  feedback: ConversationFeedback;
}>;

export function ConversationFeedbackCard({
  feedback,
}: ConversationFeedbackCardProps) {
  return (
    <article className={styles.feedbackCard}>
      <div className={styles.feedbackHeader}>
        <span className={styles.kicker}>Feedback</span>
        <h3>AI 영어 선생님 피드백</h3>
      </div>

      <div className={styles.feedbackGrid}>
        <div className={styles.feedbackSection}>
          <span>잘한 점</span>
          <p>{feedback.goodPoint}</p>
        </div>
        <div className={styles.feedbackSection}>
          <span>문법 교정</span>
          <p>{feedback.grammarCorrection}</p>
        </div>
        {feedback.vocabularyCorrection ? (
          <div className={styles.feedbackSection}>
            <span>표현 교정</span>
            <p>{feedback.vocabularyCorrection}</p>
          </div>
        ) : null}
      </div>

      <div className={styles.expressionBox}>
        <span>Corrected sentence</span>
        <p className={styles.expressionAfter}>{feedback.correctedSentence}</p>
        <span>Better expression</span>
        <p className={styles.expressionAfter}>{feedback.betterExpression}</p>
      </div>

      <div className={styles.feedbackSection}>
        <span>왜 이렇게 말하나요?</span>
        <p>{feedback.koreanExplanation}</p>
      </div>

      <div className={styles.feedbackSection}>
        <span>다음 답변 팁</span>
        <p>{feedback.nextTip}</p>
      </div>
    </article>
  );
}
