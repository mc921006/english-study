import { WordStudy } from "@/features/words/components/WordStudy";
import styles from "./page.module.scss";

export const metadata = {
  title: "Words",
};

export default function WordsPage() {
  return (
    <section className={styles.wordsPage}>
      <div className={styles.header}>
        <p className={styles.kicker}>Wordbook</p>
        <h1 className={styles.title}>Words</h1>
        <p className={styles.description}>
          Choose a CEFR level and daily word count, then flip each card to study
          the meaning and example sentence.
        </p>
      </div>

      <WordStudy />
    </section>
  );
}
