"use client";

import {
  type ChangeEvent,
  type KeyboardEvent,
  useEffect,
  useState,
} from "react";
import type {
  WordQuizAnswer,
  WordQuizMode,
  WordQuizOption,
  WordQuizQuestion,
} from "../hooks/useWordQuiz";
import { useTextToSpeech } from "../hooks/useTextToSpeech";
import styles from "./WordStudy.module.scss";

type WordQuizProps = {
  answer: WordQuizAnswer | null;
  currentIndex: number;
  mode: WordQuizMode;
  selectedOptionId: string | null;
  question: WordQuizQuestion;
  totalQuestions: number;
  onCheckAnswer: () => void;
  onCheckListeningAnswer: (typedAnswer: string) => void;
  onComplete: () => void;
  onNextQuestion: () => void;
  onSelectOption: (option: WordQuizOption) => void;
};

export function WordQuiz({
  answer,
  currentIndex,
  mode,
  selectedOptionId,
  question,
  totalQuestions,
  onCheckAnswer,
  onCheckListeningAnswer,
  onComplete,
  onNextQuestion,
  onSelectOption,
}: WordQuizProps) {
  const { isSpeechSupported, speakText, stopSpeech } = useTextToSpeech();
  const [listeningInput, setListeningInput] = useState({
    questionId: question.id,
    value: "",
  });
  const questionNumber = currentIndex + 1;
  const isLastQuestion = questionNumber >= totalQuestions;
  const progressPercent =
    totalQuestions > 0 ? (questionNumber / totalQuestions) * 100 : 0;
  const isListeningQuiz = mode === "listening";
  const listeningAnswer =
    listeningInput.questionId === question.id ? listeningInput.value : "";

  useEffect(() => {
    return stopSpeech;
  }, [stopSpeech, question.word.language, question.word.word]);

  const handleNextClick = () => {
    if (!answer) {
      if (isListeningQuiz) {
        onCheckListeningAnswer(listeningAnswer);
      } else {
        onCheckAnswer();
      }

      return;
    }

    if (isLastQuestion) {
      onComplete();
      return;
    }

    onNextQuestion();
  };

  const speakCurrentWord = () => {
    speakText(
      question.word.word,
      question.word.language,
      isListeningQuiz ? "en-US" : undefined,
    );
  };

  const changeListeningAnswer = (event: ChangeEvent<HTMLInputElement>) => {
    setListeningInput({
      questionId: question.id,
      value: event.target.value,
    });
  };

  const handleListeningInputKeyDown = (
    event: KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key !== "Enter" || answer || !listeningAnswer.trim()) {
      return;
    }

    event.preventDefault();
    onCheckListeningAnswer(listeningAnswer);
  };

  const isAnswerChecked = Boolean(answer);
  const isActionDisabled = isAnswerChecked
    ? false
    : isListeningQuiz
      ? !listeningAnswer.trim()
      : !selectedOptionId;

  return (
    <section className={styles.quiz} aria-label="Word quiz">
      <header className={styles.quizHeader}>
        <div className={styles.quizTitle}>
          <span className={styles.kicker}>
            {isListeningQuiz ? "Listening Quiz" : "Quiz"}
          </span>
          {isListeningQuiz ? (
            <h2>듣고 맞추기</h2>
          ) : (
            <>
              <h2>{question.word.word}</h2>
              <span className={styles.pronunciation}>
                {`[ ${question.word.pronunciation} ]`}
              </span>
            </>
          )}
        </div>

        <div className={styles.quizHeaderActions}>
          {isListeningQuiz ? null : (
            <button
              className={styles.quizAudioButton}
              type="button"
              aria-label={`${question.word.word} pronunciation`}
              onClick={speakCurrentWord}
            >
              🔊
            </button>
          )}
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
        {isListeningQuiz ? (
          <div className={styles.listeningPrompt}>
            <button
              className={styles.listeningAudioButton}
              type="button"
              onClick={speakCurrentWord}
              disabled={isSpeechSupported === false}
            >
              <span aria-hidden="true">🔊</span>
              <span>듣기</span>
            </button>
            {isSpeechSupported === false ? (
              <p className={styles.ttsUnsupported}>
                이 브라우저는 음성 재생을 지원하지 않습니다.
              </p>
            ) : null}
            <label
              className={styles.listeningInputGroup}
              htmlFor={`listening-answer-${currentIndex}`}
            >
              <span className={styles.controlLabel}>들은 단어 입력</span>
              <input
                className={styles.listeningInput}
                id={`listening-answer-${currentIndex}`}
                type="text"
                value={listeningAnswer}
                onChange={changeListeningAnswer}
                onKeyDown={handleListeningInputKeyDown}
                disabled={isAnswerChecked}
                autoComplete="off"
                spellCheck={false}
              />
            </label>
            {answer ? (
              <p
                className={
                  answer.isCorrect
                    ? styles.listeningFeedbackCorrect
                    : styles.listeningFeedbackIncorrect
                }
              >
                {answer.isCorrect ? (
                  "정답입니다."
                ) : (
                  <>
                    <span>오답입니다.</span>{" "}
                    <span className={styles.listeningCorrectAnswer}>
                      정답 : {answer.correctWord ?? question.word.word}
                    </span>
                  </>
                )}
              </p>
            ) : null}
          </div>
        ) : (
          <div className={styles.answerGrid}>
            {question.options.map((option) => {
              const isSelected = selectedOptionId === option.id;
              const isCorrectOption = option.id === question.correctOptionId;
              const isSelectedIncorrect =
                answer?.selectedOptionId === option.id && !isCorrectOption;
              const optionClassName = [
                styles.answerOption,
                isSelected && !isAnswerChecked
                  ? styles.answerOptionSelected
                  : "",
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
        )}

        <div className={styles.quizActionBar}>
          <button
            className={styles.primaryButton}
            type="button"
            onClick={handleNextClick}
            disabled={isActionDisabled}
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
