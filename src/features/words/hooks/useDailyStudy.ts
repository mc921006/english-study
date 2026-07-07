"use client";

import { useCallback, useMemo, useState } from "react";
import { getWords } from "@/services/words";
import type { WordLanguage, WordStudyLevel } from "@/types/word";
import {
  type DailyStudy,
  type DailyStudyCount,
  getTodayKey,
  saveDailyStudy,
} from "../storage/dailyStudyStorage";

type StudyStatus =
  | "setup"
  | "loading"
  | "active"
  | "completed"
  | "quiz"
  | "quizResults";

type UseDailyStudyParams = {
  language: WordLanguage;
};

export function useDailyStudy({ language }: UseDailyStudyParams) {
  const [study, setStudy] = useState<DailyStudy | null>(null);
  const [status, setStatus] = useState<StudyStatus>("setup");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const visibleStudy = study?.language === language ? study : null;
  const visibleStatus = study?.language === language ? status : "setup";

  const startStudy = useCallback(
    async (cefrLevel: WordStudyLevel, dailyCount: DailyStudyCount) => {
      setStatus("loading");
      setErrorMessage(null);

      try {
        const words = await getWords({
          cefrLevel,
          language,
          limit: dailyCount,
        });
        const nextStudy: DailyStudy = {
          date: getTodayKey(),
          language,
          cefrLevel,
          dailyCount,
          words,
          currentIndex: 0,
        };

        saveDailyStudy(nextStudy);
        setStudy(nextStudy);
        setStatus(words.length > 0 ? "active" : "setup");

        if (words.length === 0) {
          setErrorMessage(getEmptyWordsMessage(language));
        }
      } catch (error) {
        setStatus("setup");
        setErrorMessage(
          error instanceof Error ? error.message : "Failed to start study.",
        );
      }
    },
    [language],
  );

  const startNewStudy = useCallback(async () => {
    if (!visibleStudy) {
      setStatus("setup");
      return;
    }

    await startStudy(visibleStudy.cefrLevel, visibleStudy.dailyCount);
  }, [startStudy, visibleStudy]);

  const returnToSetup = useCallback(() => {
    setStatus("setup");
    setErrorMessage(null);
  }, []);

  const startQuiz = useCallback(() => {
    if (!visibleStudy || visibleStudy.words.length === 0) {
      setStatus("setup");
      return;
    }

    setStatus("quiz");
  }, [visibleStudy]);

  const showQuizResults = useCallback(() => {
    if (!visibleStudy) {
      setStatus("setup");
      return;
    }

    setStatus("quizResults");
  }, [visibleStudy]);

  const updateCurrentIndex = useCallback((nextIndex: number) => {
    setStudy((currentStudy) => {
      if (!currentStudy) {
        return currentStudy;
      }

      const boundedIndex = Math.max(
        0,
        Math.min(nextIndex, currentStudy.words.length),
      );
      const nextStudy = {
        ...currentStudy,
        currentIndex: boundedIndex,
      };

      saveDailyStudy(nextStudy);
      setStatus(
        boundedIndex >= currentStudy.words.length ? "completed" : "active",
      );

      return nextStudy;
    });
  }, []);

  const moveToPrevious = useCallback(() => {
    if (!visibleStudy) {
      return;
    }

    updateCurrentIndex(visibleStudy.currentIndex - 1);
  }, [visibleStudy, updateCurrentIndex]);

  const moveToNext = useCallback(() => {
    if (!visibleStudy) {
      return;
    }

    updateCurrentIndex(visibleStudy.currentIndex + 1);
  }, [visibleStudy, updateCurrentIndex]);

  const currentWord = visibleStudy?.words[visibleStudy.currentIndex] ?? null;
  const totalWords = visibleStudy?.words.length ?? 0;
  const displayIndex = visibleStudy
    ? Math.min(visibleStudy.currentIndex + 1, visibleStudy.words.length)
    : 0;
  const progressPercent = totalWords > 0 ? (displayIndex / totalWords) * 100 : 0;

  return useMemo(
    () => ({
      status: visibleStatus,
      study: visibleStudy,
      currentWord,
      displayIndex,
      totalWords,
      progressPercent,
      errorMessage,
      startStudy,
      startNewStudy,
      returnToSetup,
      startQuiz,
      showQuizResults,
      moveToPrevious,
      moveToNext,
    }),
    [
      visibleStatus,
      visibleStudy,
      currentWord,
      displayIndex,
      totalWords,
      progressPercent,
      errorMessage,
      startStudy,
      startNewStudy,
      returnToSetup,
      startQuiz,
      showQuizResults,
      moveToPrevious,
      moveToNext,
    ],
  );
}

function getEmptyWordsMessage(language: WordLanguage) {
  if (language === "vi") {
    return "베트남어 단어 데이터가 아직 없습니다.";
  }

  return "No words found for this CEFR level.";
}
