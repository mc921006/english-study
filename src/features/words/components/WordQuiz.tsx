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
  selectedOptionId: string | null;
  question: WordQuizQuestion;
  totalQuestions: number;
  onCheckAnswer: () => void;
  onComplete: () => void;
  onNextQuestion: () => void;
  onSelectOption: (option: WordQuizOption) => void;
};

export function WordQuiz({
  answer,
  currentIndex,
  selectedOptionId,
  question,
  totalQuestions,
  onCheckAnswer,
  onComplete,
  onNextQuestion,
  onSelectOption,
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
      onCheckAnswer();
      return;
    }

    if (isLastQuestion) {
      onComplete();
      return;
    }

    onNextQuestion();
  };
  const isAnswerChecked = Boolean(answer);

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
            const isSelected = selectedOptionId === option.id;
            const isCorrectOption = option.id === question.correctOptionId;
            const isSelectedIncorrect =
              answer?.selectedOptionId === option.id && !isCorrectOption;
            const optionClassName = [
              styles.answerOption,
              isSelected && !isAnswerChecked ? styles.answerOptionSelected : "",
              isAnswerChecked && isCorrectOption
                ? styles.answerOptionCorrect
                : "",
              isAnswerChecked && isSelectedIncorrect
                ? styles.answerOptionIncorrect
                : "",
            ]
              .filter(Boolean)
              .join(" ");
            const statusLabel = getOptionStatusLabel({
              answer,
              isCorrectOption,
              optionId: option.id,
            });

            return (
              <button
                className={optionClassName}
                key={option.id}
                type="button"
                onClick={() => onSelectOption(option)}
                disabled={isAnswerChecked}
                aria-pressed={isSelected}
              >
                <span>{option.meaning}</span>
                {statusLabel ? (
                  <span className={styles.answerOptionStatus}>
                    {statusLabel}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        <div className={styles.quizActionBar}>
          <button
            className={styles.primaryButton}
            type="button"
            onClick={handleNextClick}
            disabled={!selectedOptionId}
          >
            {isAnswerChecked ? "Next Question" : "Check Answer"}
          </button>
        </div>
      </div>
    </section>
  );
}

type OptionStatusLabelParams = {
  answer: WordQuizAnswer | null;
  isCorrectOption: boolean;
  optionId: string;
};

function getOptionStatusLabel({
  answer,
  isCorrectOption,
  optionId,
}: OptionStatusLabelParams) {
  if (!answer) {
    return null;
  }

  if (isCorrectOption) {
    return "✓";
  }

  if (answer.selectedOptionId === optionId) {
    return "×";
  }

  return null;
}
