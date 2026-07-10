import { KanaStudy } from "@/features/kana/components/KanaStudy";
import styles from "../words/page.module.scss";

export const metadata = {
  title: "Kana",
};

export default function KanaPage() {
  return (
    <section className={styles.wordsPage}>
      <div className={styles.header}>
        <p className={styles.kicker}>Japanese Kana</p>
        <h1 className={styles.title}>Kana Study</h1>
        <p className={styles.description}>
          Start Japanese study with hiragana and katakana cards before moving
          into words later.
        </p>
      </div>

      <KanaStudy />
    </section>
  );
}
