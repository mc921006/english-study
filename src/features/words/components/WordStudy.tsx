"use client";

import { useState } from "react";
import { useStudyLanguage } from "@/features/language/context/LanguageProvider";
import type { WordLanguage } from "@/types/word";
import { DailyStudyProgress } from "./DailyStudyProgress";
import { DailyStudySetup } from "./DailyStudySetup";
import { QuizResults } from "./QuizResults";
import { StudyCard } from "./StudyCard";
import { StudyCompletion } from "./StudyCompletion";
import { WordQuiz } from "./WordQuiz";
import { useDailyStudy } from "../hooks/useDailyStudy";
import { type WordQuizMode, useWordQuiz } from "../hooks/useWordQuiz";
import styles from "./WordStudy.module.scss";

export function WordStudy() {
  const { language } = useStudyLanguage();

  if (!language.wordLanguage) {
    return (
      <div className={styles.empty}>
        <p>Word study is not available for {language.englishLabel} yet.</p>
      </div>
    );
  }

  return <WordStudyContent wordLanguage={language.wordLanguage} />;
}

type WordStudyContentProps = Readonly<{
  wordLanguage: WordLanguage;
}>;

function WordStudyContent({ wordLanguage }: WordStudyContentProps) {
  const [quizMode, setQuizMode] = useState<WordQuizMode>("meaning");
  const {
    status,
    study,
    currentWord,
    displayIndex,
    totalWords,
    progressPercent,
    errorMessage,
    startStudy,
    startNewStudy,
    returnToSetup,
    startQuiz: showQuiz,
    showQuizResults,
    moveToPrevious,
    moveToNext,
  } = useDailyStudy({ language: wordLanguage });
  const quiz = useWordQuiz(study?.words ?? [], wordLanguage);

  const startQuiz = async () => {
    const isQuizReady = await quiz.startQuiz(quizMode);

    if (isQuizReady) {
      showQuiz();
    }
  };

  const retryQuiz = async () => {
    const isQuizReady = await quiz.retryQuiz(quizMode);

    if (isQuizReady) {
      showQuiz();
    }
  };

  if (status === "setup" || !study) {
    return (
      <DailyStudySetup
        errorMessage={errorMessage}
        isLoading={status === "loading"}
        wordLanguage={wordLanguage}
        onStart={startStudy}
      />
    );
  }

  if (status === "completed") {
    return (
      <StudyCompletion
        errorMessage={quiz.errorMessage}
        isLoading={quiz.isLoading}
        quizMode={quizMode}
        onQuizModeChange={setQuizMode}
        onStartQuiz={startQuiz}
      />
    );
  }

  if (status === "quiz") {
    if (!quiz.currentQuestion) {
      return (
        <div className={styles.empty}>
          <p>Creating quiz...</p>
        </div>
      );
    }

    return (
      <WordQuiz
        answer={quiz.currentAnswer}
        currentIndex={quiz.currentIndex}
        mode={quizMode}
        selectedOptionId={quiz.currentSelectedOptionId}
        question={quiz.currentQuestion}
        totalQuestions={quiz.questions.length}
        onCheckAnswer={quiz.checkAnswer}
        onCheckListeningAnswer={quiz.checkListeningAnswer}
        onComplete={showQuizResults}
        onNextQuestion={quiz.moveToNextQuestion}
        onSelectOption={quiz.selectOption}
      />
    );
  }

  if (status === "quizResults") {
    return (
      <QuizResults
        errorMessage={quiz.errorMessage}
        isLoading={quiz.isLoading}
        result={quiz.result}
        onRetryQuiz={retryQuiz}
        onStartNewStudy={startNewStudy}
      />
    );
  }

  if (status === "loading" || !currentWord) {
    return (
      <div className={styles.empty}>
        <p>Creating today&apos;s study...</p>
      </div>
    );
  }

  return (
    <div className={styles.study}>
      <DailyStudyProgress
        level={study.level}
        current={displayIndex}
        total={totalWords}
        progressPercent={progressPercent}
        onChangeStudy={returnToSetup}
      />
      <StudyCard
        currentIndex={study.currentIndex}
        totalWords={totalWords}
        word={currentWord}
        onPrevious={moveToPrevious}
        onNext={moveToNext}
      />
    </div>
  );
}
