import { HomeStudyActions } from "@/features/language/components/HomeStudyActions";
import { LanguageSelector } from "@/features/language/components/LanguageSelector";
import { APP_NAME } from "@/lib/appBranding";
import styles from "./page.module.scss";

export default function HomePage() {
  return (
    <section className={styles.hero}>
      <div>
        <p className={styles.kicker}>{APP_NAME}</p>
        <h1 className={styles.title}>Build a steady language learning routine.</h1>
        <p className={styles.description}>
          Study English, Vietnamese, and Japanese from one place with focused
          tools that can grow as more languages are added.
        </p>
      </div>

      <LanguageSelector />
      <HomeStudyActions />
    </section>
  );
}
