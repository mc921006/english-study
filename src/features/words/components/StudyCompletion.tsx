import {
  SelectCardGrid,
  type SelectCardGridItem,
} from "@/components/ui/select-card-grid/SelectCardGrid";
import type { WordQuizMode } from "../hooks/useWordQuiz";
import styles from "./WordStudy.module.scss";

const quizModeItems: Array<SelectCardGridItem<WordQuizMode>> = [
  {
    value: "meaning",
    title: "뜻 맞추기",
  },
  {
    value: "listening",
    title: "듣고 맞추기",
  },
];

type StudyCompletionProps = {
  errorMessage: string | null;
  isLoading: boolean;
  quizMode: WordQuizMode;
  onQuizModeChange: (mode: WordQuizMode) => void;
  onStartQuiz: () => void;
};

export function StudyCompletion({
  errorMessage,
  isLoading,
  quizMode,
  onQuizModeChange,
  onStartQuiz,
}: StudyCompletionProps) {
  return (
    <section className={styles.completed} aria-label="Study completed">
      <h2>Today&apos;s Study Completed!</h2>
      <div className={styles.completedOptions}>
        <span className={styles.controlLabel}>퀴즈 타입</span>
        <SelectCardGrid
          ariaLabel="Quiz type"
          items={quizModeItems}
          selectedValue={quizMode}
          variant="compact"
          onSelect={onQuizModeChange}
        />
      </div>
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
