import styles from "./WordStudy.module.scss";

type StudyCompletionProps = {
  errorMessage: string | null;
  isLoading: boolean;
  onStartQuiz: () => void;
};

export function StudyCompletion({
  errorMessage,
  isLoading,
  onStartQuiz,
}: StudyCompletionProps) {
  return (
    <section className={styles.completed} aria-label="Study completed">
      <h2>Today&apos;s Study Completed!</h2>
      {errorMessage ? <p className={styles.error}>{errorMessage}</p> : null}
      <button
        className={styles.primaryButton}
        type="button"
        onClick={onStartQuiz}
        disabled={isLoading}
      >
        {isLoading ? "Creating..." : "Start Quiz"}
      </button>
    </section>
  );
}
