import styles from "./WordStudy.module.scss";

type StudyCompletionProps = {
  isLoading: boolean;
  onStartNewStudy: () => void;
};

export function StudyCompletion({
  isLoading,
  onStartNewStudy,
}: StudyCompletionProps) {
  return (
    <section className={styles.completed} aria-label="Study completed">
      <h2>Today&apos;s Study Completed!</h2>
      <button
        className={styles.primaryButton}
        type="button"
        onClick={onStartNewStudy}
        disabled={isLoading}
      >
        {isLoading ? "Creating..." : "Start New Study"}
      </button>
    </section>
  );
}
