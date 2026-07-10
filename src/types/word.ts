export const cefrLevels = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;

export type CefrLevel = (typeof cefrLevels)[number];

export const jlptLevels = ["N5", "N4", "N3", "N2", "N1"] as const;

export type JlptLevel = (typeof jlptLevels)[number];

export const commonWordLevel = "common";

export type CommonWordLevel = typeof commonWordLevel;

export type WordStudyLevel = CefrLevel | CommonWordLevel | JlptLevel;

export type WordLanguage = "en" | "vi" | "ja";

export const defaultWordLanguage: WordLanguage = "en";

export const defaultWordStudyLevelByLanguage: Record<
  WordLanguage,
  WordStudyLevel
> = {
  en: "A1",
  vi: commonWordLevel,
  ja: "N5",
};

export function getDefaultWordStudyLevel(language: WordLanguage) {
  return defaultWordStudyLevelByLanguage[language];
}

export function isCefrLevel(value: unknown): value is CefrLevel {
  return (
    typeof value === "string" &&
    cefrLevels.includes(value as CefrLevel)
  );
}

export function isJlptLevel(value: unknown): value is JlptLevel {
  return (
    typeof value === "string" &&
    jlptLevels.includes(value as JlptLevel)
  );
}

export function isWordStudyLevel(value: unknown): value is WordStudyLevel {
  return isCefrLevel(value) || isJlptLevel(value) || value === commonWordLevel;
}

export type Word = {
  word: string;
  meaning: string;
  example: string;
  example_meaning: string;
  pronunciation: string;
  part_of_speech: string;
  level: WordStudyLevel;
  language: WordLanguage;
};
