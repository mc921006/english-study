import type { KanaCard } from "../data/kanaData";
import styles from "./Kana.module.scss";

type KanaPronunciationProps = Readonly<{
  card: KanaCard;
  onPlay?: (card: KanaCard) => void;
}>;

export function KanaPronunciation({ card, onPlay }: KanaPronunciationProps) {
  return (
    <div className={styles.pronunciationPanel}>
      <button
        className={styles.audioButton}
        type="button"
        aria-label={`${card.kana} pronunciation`}
        disabled={!onPlay}
        onClick={() => onPlay?.(card)}
      >
        <span aria-hidden="true">🔊</span>
        <span>발음 듣기</span>
      </button>
    </div>
  );
}
