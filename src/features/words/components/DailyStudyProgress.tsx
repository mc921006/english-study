import type { CefrLevel } from "@/types/word";
import styles from "./WordStudy.module.scss";

type DailyStudyProgressProps = {
  cefrLevel: CefrLevel;
  current: number;
  total: number;
  progressPercent: number;
};

export function DailyStudyProgress({
  cefrLevel,
  current,
  total,
  progressPercent,
}: DailyStudyProgressProps) {
  return (
    <header className={styles.studyHeader}>
      <div>
        <span className={styles.kicker}>{cefrLevel}</span>
        <h2>Today&apos;s Study</h2>
      </div>
      <div className={styles.studyCount}>
        {current} / {total}
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
