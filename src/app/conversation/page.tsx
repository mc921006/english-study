import { ConversationPractice } from "@/features/conversation/components/ConversationPractice";
import styles from "../words/page.module.scss";

export const metadata = {
  title: "Conversation",
};

export default function ConversationPage() {
  return (
    <section className={styles.wordsPage}>
      <div className={styles.header}>
        <p className={styles.kicker}>Conversation</p>
        <h1 className={styles.title}>Text Conversation</h1>
        <p className={styles.description}>
          Choose a topic, answer in English, and review short Korean feedback
          before moving to the next question.
        </p>
      </div>

      <ConversationPractice />
    </section>
  );
}
