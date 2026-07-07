"use client";

import { useEffect } from "react";
import type {
  WordQuizAnswer,
  WordQuizOption,
  WordQuizQuestion,
} from "../hooks/useWordQuiz";
import { useTextToSpeech } from "../hooks/useTextToSpeech";
import styles from "./WordStudy.module.scss";

type WordQuizProps = {
  answer: WordQuizAnswer | null;
  currentIndex: number;
  question: WordQuizQuestion;
  totalQuestions: number;
  onComplete: () => void;
  onNextQuestion: () => void;
  onSelectAnswer: (option: WordQuizOption) => void;
};

export function WordQuiz({
  answer,
  currentIndex,
  question,
  totalQuestions,
  onComplete,
  onNextQuestion,
  onSelectAnswer,
}: WordQuizProps) {
  const { speakText, stopSpeech } = useTextToSpeech();
  const questionNumber = currentIndex + 1;
  const isLastQuestion = questionNumber >= totalQuestions;
  const progressPercent =
    totalQuestions > 0 ? (questionNumber / totalQuestions) * 100 : 0;

  useEffect(() => {
    return stopSpeech;
  }, [stopSpeech, question.word.language, question.word.word]);

  const handleNextClick = () => {
    if (!answer) {
      return;
    }

    if (isLastQuestion) {
      onComplete();
      return;
    }

    onNextQuestion();
  };

  return (
    <section className={styles.quiz} aria-label="Word quiz">
      <header className={styles.quizHeader}>
        <div className={styles.quizTitle}>
          <span className={styles.kicker}>Quiz</span>
          <h2>{question.word.word}</h2>
          <span className={styles.pronunciation}>
            {`[ ${question.word.pronunciation} ]`}
          </span>
        </div>

        <div className={styles.quizHeaderActions}>
          <button
            className={styles.quizAudioButton}
            type="button"
            aria-label={`${question.word.word} pronunciation`}
            onClick={() => speakText(question.word.word, question.word.language)}
          >
            🔊
          </button>
          <div className={styles.studyCount}>
            {questionNumber} / {totalQuestions}
          </div>
        </div>

        <div
          className={styles.progressBar}
          aria-label="Quiz progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progressPercent)}
          role="progressbar"
        >
          <span style={{ width: `${progressPercent}%` }} />
        </div>
      </header>

      <div className={styles.quizBody}>
        <div className={styles.answerGrid}>
          {question.options.map((option) => {
            const isSelected = answer?.selectedOptionId === option.id;
            const isCorrectOption = option.id === question.correctOptionId;
            const optionClassName = [
              styles.answerOption,
              answer && isCorrectOption ? styles.answerOptionCorrect : "",
              answer && isSelected && !isCorrectOption
                ? styles.answerOptionIncorrect
                : "",
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <button
                className={optionClassName}
                key={option.id}
                type="button"
                onClick={() => onSelectAnswer(option)}
                disabled={Boolean(answer)}
              >
                {option.meaning}
              </button>
            );
          })}
        </div>

        {answer ? (
          <div className={styles.answerFeedback} aria-live="polite">
            <strong>{answer.isCorrect ? "정답입니다" : "오답입니다"}</strong>
            <span>{`정답: ${answer.correctMeaning}`}</span>
          </div>
        ) : null}

        <button
          className={styles.primaryButton}
          type="button"
          onClick={handleNextClick}
          disabled={!answer}
        >
          {isLastQuestion ? "결과 보기" : "다음 문제"}
        </button>
      </div>
    </section>
  );
}
