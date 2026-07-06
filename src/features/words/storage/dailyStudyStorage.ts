import type { CefrLevel, Word } from "@/types/word";

export type DailyStudyCount = 5 | 10 | 15 | 20 | "all";

export type DailyStudy = {
  date: string;
  cefrLevel: CefrLevel;
  dailyCount: DailyStudyCount;
  words: Word[];
  currentIndex: number;
};

const STORAGE_KEY = "english-study:daily-study";

export function getTodayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function loadDailyStudy(today = getTodayKey()): DailyStudy | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawStudy = window.localStorage.getItem(STORAGE_KEY);
  if (!rawStudy) {
    return null;
  }

  try {
    const study = JSON.parse(rawStudy) as DailyStudy;

    if (study.date !== today || !isValidStudy(study)) {
      clearDailyStudy();
      return null;
    }

    return study;
  } catch {
    clearDailyStudy();
    return null;
  }
}

export function saveDailyStudy(study: DailyStudy) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(study));
}

export function clearDailyStudy() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
}

function isValidStudy(study: DailyStudy) {
  return (
    typeof study.date === "string" &&
    typeof study.cefrLevel === "string" &&
    Array.isArray(study.words) &&
    Number.isInteger(study.currentIndex) &&
    study.currentIndex >= 0
  );
}
