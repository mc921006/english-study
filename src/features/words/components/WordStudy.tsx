"use client";

import { useStudyLanguage } from "@/features/language/context/LanguageProvider";
import { DailyStudyProgress } from "./DailyStudyProgress";
import { DailyStudySetup } from "./DailyStudySetup";
import { StudyCard } from "./StudyCard";
import { StudyCompletion } from "./StudyCompletion";
import { useDailyStudy } from "../hooks/useDailyStudy";
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
    moveToPrevious,
    moveToNext,
  } = useDailyStudy({ language: language.wordLanguage });

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
      <StudyCompletion isLoading={false} onStartNewStudy={startNewStudy} />
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
