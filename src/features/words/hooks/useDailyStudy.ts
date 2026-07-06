"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getWords } from "@/services/words";
import type { CefrLevel } from "@/types/word";
import {
  type DailyStudy,
  type DailyStudyCount,
  getTodayKey,
  loadDailyStudy,
  saveDailyStudy,
} from "../storage/dailyStudyStorage";

type StudyStatus = "checking" | "setup" | "loading" | "active" | "completed";

export function useDailyStudy() {
  const [study, setStudy] = useState<DailyStudy | null>(null);
  const [status, setStatus] = useState<StudyStatus>("checking");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      const savedStudy = loadDailyStudy();

      if (!savedStudy) {
        setStatus("setup");
        return;
      }

      setStudy(savedStudy);
      setStatus(
        savedStudy.currentIndex >= savedStudy.words.length
          ? "completed"
          : "active",
      );
    }, 0);

    return () => {
      window.clearTimeout(timerId);
    };
  }, []);

  const startStudy = useCallback(
    async (cefrLevel: CefrLevel, dailyCount: DailyStudyCount) => {
      setStatus("loading");
      setErrorMessage(null);

      try {
        const words = await getWords({
          cefrLevel,
          limit: dailyCount,
        });
        const nextStudy: DailyStudy = {
          date: getTodayKey(),
          cefrLevel,
          dailyCount,
          words,
          currentIndex: 0,
        };

        saveDailyStudy(nextStudy);
        setStudy(nextStudy);
        setStatus(words.length > 0 ? "active" : "setup");

        if (words.length === 0) {
          setErrorMessage("No words found for this CEFR level.");
        }
      } catch (error) {
        setStatus("setup");
        setErrorMessage(
          error instanceof Error ? error.message : "Failed to start study.",
        );
      }
    },
    [],
  );

  const startNewStudy = useCallback(async () => {
    if (!study) {
      setStatus("setup");
      return;
    }

    await startStudy(study.cefrLevel, study.dailyCount);
  }, [startStudy, study]);

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
    if (!study) {
      return;
    }

    updateCurrentIndex(study.currentIndex - 1);
  }, [study, updateCurrentIndex]);

  const moveToNext = useCallback(() => {
    if (!study) {
      return;
    }

    updateCurrentIndex(study.currentIndex + 1);
  }, [study, updateCurrentIndex]);

  const currentWord = study?.words[study.currentIndex] ?? null;
  const totalWords = study?.words.length ?? 0;
  const displayIndex = study
    ? Math.min(study.currentIndex + 1, study.words.length)
    : 0;
  const progressPercent = totalWords > 0 ? (displayIndex / totalWords) * 100 : 0;

  return useMemo(
    () => ({
      status,
      study,
      currentWord,
      displayIndex,
      totalWords,
      progressPercent,
      errorMessage,
      startStudy,
      startNewStudy,
      moveToPrevious,
      moveToNext,
    }),
    [
      status,
      study,
      currentWord,
      displayIndex,
      totalWords,
      progressPercent,
      errorMessage,
      startStudy,
      startNewStudy,
      moveToPrevious,
      moveToNext,
    ],
  );
}
