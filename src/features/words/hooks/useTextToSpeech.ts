"use client";

import { useCallback } from "react";
import { useTextToSpeech as useSharedTextToSpeech } from "@/lib/useTextToSpeech";
import type { WordLanguage } from "@/types/word";

const speechLanguageByWordLanguage: Record<WordLanguage, string> = {
  en: "en-US",
  vi: "vi-VN",
  ja: "ja-JP",
};

export function useTextToSpeech() {
  const { isSpeechSupported, speakText: speakSharedText, stopSpeech } =
    useSharedTextToSpeech();

  const speakText = useCallback(
    (text: string, language: WordLanguage, speechLanguage?: string) => {
      speakSharedText(text, speechLanguage ?? speechLanguageByWordLanguage[language]);
    },
    [speakSharedText],
  );

  return {
    isSpeechSupported,
    speakText,
    stopSpeech,
  };
}
