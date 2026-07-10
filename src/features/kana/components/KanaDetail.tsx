import type { KanaCard, KanaSet } from "../data/kanaData";
import { KanaPronunciation } from "./KanaPronunciation";
import { KanaWritingPractice } from "./KanaWritingPractice";
import styles from "./Kana.module.scss";

type KanaDetailProps = Readonly<{
  card: KanaCard;
  currentIndex: number;
  kanaSet: KanaSet;
  totalCards: number;
  onBack: () => void;
  onNext: () => void;
  onPrevious: () => void;
}>;

export function KanaDetail({
  card,
  currentIndex,
  kanaSet,
  totalCards,
  onBack,
  onNext,
  onPrevious,
}: KanaDetailProps) {
  const isFirstCard = currentIndex <= 0;
  const isLastCard = currentIndex >= totalCards - 1;

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

      <KanaWritingPractice key={card.kana} kana={card.kana} />

      <div className={styles.detailNavigation}>
        <button
          className={styles.navButton}
          type="button"
          onClick={onPrevious}
          disabled={isFirstCard}
        >
          Previous
        </button>
        <button
          className={styles.navButton}
          type="button"
          onClick={onNext}
          disabled={isLastCard}
        >
          Next
        </button>
      </div>
    </div>
  );
}
