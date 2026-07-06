import {
  defaultWordLanguage,
  getDefaultWordStudyLevel,
  isWordStudyLevel,
  type Word,
  type WordLanguage,
  type WordStudyLevel,
} from "@/types/word";

export type DailyStudyCount = 5 | 10 | 15 | 20 | "all";

export type DailyStudy = {
  date: string;
  language: WordLanguage;
  cefrLevel: WordStudyLevel;
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
    const study = withDefaultLanguage(JSON.parse(rawStudy));

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
    isWordLanguage(study.language) &&
    isWordStudyLevel(study.cefrLevel) &&
    Array.isArray(study.words) &&
    Number.isInteger(study.currentIndex) &&
    study.currentIndex >= 0
  );
}

export function getDefaultDailyStudyLanguage() {
  return defaultWordLanguage;
}

function withDefaultLanguage(value: unknown): DailyStudy {
  if (!value || typeof value !== "object") {
    return {
      date: "",
      language: defaultWordLanguage,
      cefrLevel: getDefaultWordStudyLevel(defaultWordLanguage),
      dailyCount: 5,
      words: [],
      currentIndex: 0,
    };
  }

  const study = value as Partial<DailyStudy>;

  return {
    ...study,
    language: isWordLanguage(study.language)
      ? study.language
      : defaultWordLanguage,
  } as DailyStudy;
}

function isWordLanguage(value: unknown): value is WordLanguage {
  return value === "en" || value === "vi";
}
