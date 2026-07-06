import { GrammarList } from "@/features/grammar/components/GrammarList";
import styles from "../words/page.module.scss";

export const metadata = {
  title: "Grammar",
};

export default function GrammarPage() {
  return (
    <section className={styles.wordsPage}>
      <div className={styles.header}>
        <p className={styles.kicker}>Grammar</p>
        <h1 className={styles.title}>Grammar Study</h1>
        <p className={styles.description}>
          Choose a CEFR level and study grammar patterns with clear examples and
          Korean explanations.
        </p>
      </div>

      <GrammarList />
    </section>
  );
}
