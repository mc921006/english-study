import type { KanaCard, KanaSetId } from "../data/kanaData";
import styles from "./Kana.module.scss";

type KanaCardGridProps = Readonly<{
  cards: KanaCard[];
  kanaSetId: KanaSetId;
  onSelectCard: (card: KanaCard) => void;
}>;

export function KanaCardGrid({
  cards,
  kanaSetId,
  onSelectCard,
}: KanaCardGridProps) {
  return (
    <div className={styles.cardGrid}>
      {cards.map((card) => (
        <button
          className={styles.card}
          key={`${kanaSetId}-${card.kana}`}
          type="button"
          onClick={() => onSelectCard(card)}
        >
          <span className={styles.kana}>{card.kana}</span>
          <span className={styles.romanization}>{card.romanization}</span>
        </button>
      ))}
    </div>
  );
}
