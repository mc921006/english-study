import type { KanaCard, KanaSet } from "../data/kanaData";
import { KanaPronunciation } from "./KanaPronunciation";
import { KanaWritingPractice } from "./KanaWritingPractice";
import styles from "./Kana.module.scss";

type KanaDetailProps = Readonly<{
  card: KanaCard;
  kanaSet: KanaSet;
  onBack: () => void;
}>;

export function KanaDetail({ card, kanaSet, onBack }: KanaDetailProps) {
  return (
    <div className={styles.detail}>
      <div className={styles.detailTopBar}>
        <button className={styles.backButton} type="button" onClick={onBack}>
          Back to {kanaSet.englishLabel}
        </button>
      </div>

      <div className={styles.detailGrid}>
        <section className={styles.detailHero} aria-label={`${card.kana} detail`}>
          <span className={styles.detailKana}>{card.kana}</span>
          <span className={styles.detailRomanization}>{card.romanization}</span>
          <KanaPronunciation card={card} />
        </section>

        <section className={styles.examplePanel} aria-label="Example word">
          <span className={styles.kicker}>Example</span>
          <p className={styles.exampleWord}>{card.exampleWord}</p>
          <p className={styles.exampleReading}>{card.exampleReading}</p>
          <p className={styles.exampleMeaning}>{card.exampleMeaning}</p>
        </section>
      </div>

      <KanaWritingPractice kana={card.kana} />
    </div>
  );
}
