"use client";

import { useStudyLanguage } from "@/features/language/context/LanguageProvider";
import { DailyStudyProgress } from "./DailyStudyProgress";
import { DailyStudySetup } from "./DailyStudySetup";
import { QuizResults } from "./QuizResults";
import { StudyCard } from "./StudyCard";
import { StudyCompletion } from "./StudyCompletion";
import { WordQuiz } from "./WordQuiz";
import { useDailyStudy } from "../hooks/useDailyStudy";
import { useWordQuiz } from "../hooks/useWordQuiz";
import styles from "./WordStudy.module.scss";

export function WordStudy() {
  const { language } = useStudyLanguage();
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
  } = useDailyStudy({ language: language.wordLanguage });
  const quiz = useWordQuiz(study?.words ?? [], language.wordLanguage);

  const startQuiz = async () => {
    const isQuizReady = await quiz.startQuiz();

    if (isQuizReady) {
      showQuiz();
    }
  };

  const retryQuiz = async () => {
    const isQuizReady = await quiz.retryQuiz();

    if (isQuizReady) {
      showQuiz();
    }
  };

  if (status === "setup" || !study) {
    return (
      <DailyStudySetup
        errorMessage={errorMessage}
        isLoading={status === "loading"}
        wordLanguage={language.wordLanguage}
        onStart={startStudy}
      />
    );
  }

  if (status === "completed") {
    return (
      <StudyCompletion
        errorMessage={quiz.errorMessage}
        isLoading={quiz.isLoading}
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
        question={quiz.currentQuestion}
        totalQuestions={quiz.questions.length}
        onComplete={showQuizResults}
        onNextQuestion={quiz.moveToNextQuestion}
        onSelectAnswer={quiz.selectAnswer}
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
        cefrLevel={study.cefrLevel}
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
