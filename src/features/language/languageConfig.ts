import type { WordLanguage } from "@/types/word";

export type StudyLanguageId = "english" | "vietnamese" | "japanese";

export type StudyFeatureId = "words" | "grammar" | "conversation" | "kana";

export type StudyLanguage = {
  id: StudyLanguageId;
  label: string;
  englishLabel: string;
  studyTitle: string;
  mark: string;
  flag: string;
  wordLanguage?: WordLanguage;
  description: string;
  availableFeatures: StudyFeatureId[];
};

export const studyLanguages: StudyLanguage[] = [
  {
    id: "english",
    label: "영어",
    englishLabel: "English",
    studyTitle: "English",
    mark: "EN",
    flag: "🇺🇸",
    wordLanguage: "en",
    description: "단어, 문법, 회화를 모두 학습합니다.",
    availableFeatures: ["words", "grammar", "conversation"],
  },
  {
    id: "vietnamese",
    label: "베트남어",
    englishLabel: "Vietnamese",
    studyTitle: "Vietnamese",
    mark: "VI",
    flag: "🇻🇳",
    wordLanguage: "vi",
    description: "현재는 단어 학습만 지원합니다.",
    availableFeatures: ["words"],
  },
  {
    id: "japanese",
    label: "일본어",
    englishLabel: "Japanese",
    studyTitle: "Japanese",
    mark: "JP",
    flag: "🇯🇵",
    wordLanguage: "ja",
    description: "히라가나/카타카나와 N5 단어를 학습합니다.",
    availableFeatures: ["kana", "words"],
  },
];

export const studyFeatures: Array<{
  id: StudyFeatureId;
  href: string;
  label: string;
  actionLabel: string;
}> = [
  {
    id: "words",
    href: "/words",
    label: "Words",
    actionLabel: "Open words",
  },
  {
    id: "grammar",
    href: "/grammar",
    label: "Grammar",
    actionLabel: "Open grammar",
  },
  {
    id: "conversation",
    href: "/conversation",
    label: "Conversation",
    actionLabel: "Open conversation",
  },
  {
    id: "kana",
    href: "/kana",
    label: "Kana",
    actionLabel: "Open kana",
  },
];

export const defaultStudyLanguageId: StudyLanguageId = "english";

export function getStudyLanguage(languageId: StudyLanguageId) {
  return (
    studyLanguages.find((language) => language.id === languageId) ??
    studyLanguages[0]
  );
}

export function isStudyLanguageId(value: string): value is StudyLanguageId {
  return studyLanguages.some((language) => language.id === value);
}

export function getAvailableStudyFeatures(languageId: StudyLanguageId) {
  const language = getStudyLanguage(languageId);

  return language.availableFeatures
    .map((featureId) =>
      studyFeatures.find((feature) => feature.id === featureId),
    )
    .filter((feature): feature is (typeof studyFeatures)[number] =>
      Boolean(feature),
    );
}
