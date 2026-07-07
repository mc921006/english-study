import type { WordQuizResult } from "../hooks/useWordQuiz";
import styles from "./WordStudy.module.scss";

type QuizResultsProps = {
  errorMessage: string | null;
  isLoading: boolean;
  result: WordQuizResult;
  onRetryQuiz: () => void;
  onStartNewStudy: () => void;
};

export function QuizResults({
  errorMessage,
  isLoading,
  result,
  onRetryQuiz,
  onStartNewStudy,
}: QuizResultsProps) {
  return (
    <section className={styles.quizResults} aria-label="Quiz results">
      <div className={styles.quizResultsHeader}>
        <span className={styles.kicker}>Quiz Results</span>
        <h2>퀴즈 결과</h2>
      </div>

      <dl className={styles.resultStats}>
        <div>
          <dt>총 문제 수</dt>
          <dd>{result.totalQuestions}</dd>
        </div>
        <div>
          <dt>정답 수</dt>
          <dd>{result.correctCount}</dd>
        </div>
        <div>
          <dt>오답 수</dt>
          <dd>{result.incorrectCount}</dd>
        </div>
        <div>
          <dt>정답률</dt>
          <dd>{result.accuracyRate}%</dd>
        </div>
      </dl>

      {errorMessage ? <p className={styles.error}>{errorMessage}</p> : null}

      <div className={styles.resultActions}>
        <button
          className={styles.navButton}
          type="button"
          onClick={onRetryQuiz}
          disabled={isLoading}
        >
          {isLoading ? "Creating..." : "Retry Quiz"}
        </button>
        <button
          className={styles.primaryButton}
          type="button"
          onClick={onStartNewStudy}
          disabled={isLoading}
        >
          Start New Study
        </button>
      </div>
    </section>
  );
}
