import { HomeStudyActions } from "@/features/language/components/HomeStudyActions";
import { LanguageSelector } from "@/features/language/components/LanguageSelector";
import styles from "./page.module.scss";

export default function HomePage() {
  return (
    <section className={styles.hero}>
      <div>
        <p className={styles.kicker}>English Study</p>
        <h1 className={styles.title}>Build a steady English study routine.</h1>
        <p className={styles.description}>
          Start with a focused wordbook structure, then expand into grammar and
          conversation practice.
        </p>
      </div>

      <LanguageSelector />
      <HomeStudyActions />
    </section>
  );
}
