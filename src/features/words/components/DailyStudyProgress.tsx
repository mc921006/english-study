import type { CefrLevel } from "@/types/word";
import styles from "./WordStudy.module.scss";

type DailyStudyProgressProps = {
  cefrLevel: CefrLevel;
  current: number;
  total: number;
  progressPercent: number;
  onChangeStudy: () => void;
};

export function DailyStudyProgress({
  cefrLevel,
  current,
  total,
  progressPercent,
  onChangeStudy,
}: DailyStudyProgressProps) {
  return (
    <header className={styles.studyHeader}>
      <div>
        <span className={styles.kicker}>{cefrLevel}</span>
        <h2>Today&apos;s Study</h2>
      </div>
      <div className={styles.studyHeaderActions}>
        <div className={styles.studyCount}>
          {current} / {total}
        </div>
        <button
          className={styles.ghostButton}
          type="button"
          onClick={onChangeStudy}
        >
          Change Study
        </button>
      </div>
      <div
        className={styles.progressBar}
        aria-label="Study progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progressPercent)}
        role="progressbar"
      >
        <span style={{ width: `${progressPercent}%` }} />
      </div>
    </header>
  );
}
