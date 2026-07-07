"use client";

import { useCallback, useEffect, useRef } from "react";
import type { WordLanguage } from "@/types/word";

const speechLanguageByWordLanguage: Record<WordLanguage, string> = {
  en: "en-US",
  vi: "vi-VN",
};

export function useTextToSpeech() {
  const activeSpeechKeyRef = useRef<string | null>(null);
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const stopSpeech = useCallback(() => {
    activeSpeechKeyRef.current = null;
    activeUtteranceRef.current = null;
    getSpeechSynthesis()?.cancel();
  }, []);

  const clearActiveUtterance = useCallback(
    (utterance: SpeechSynthesisUtterance) => {
      if (activeUtteranceRef.current !== utterance) {
        return;
      }

      activeSpeechKeyRef.current = null;
      activeUtteranceRef.current = null;
    },
    [],
  );

  const speakText = useCallback((text: string, language: WordLanguage) => {
    const trimmedText = text.trim();
    const speechSynthesis = getSpeechSynthesis();

    if (!trimmedText || !speechSynthesis) {
      return;
    }

    const speechKey = `${language}:${trimmedText}`;

    if (
      activeSpeechKeyRef.current === speechKey &&
      activeUtteranceRef.current !== null
    ) {
      return;
    }

    if (
      activeSpeechKeyRef.current !== null ||
      speechSynthesis.speaking ||
      speechSynthesis.pending
    ) {
      speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(trimmedText);
    utterance.lang = speechLanguageByWordLanguage[language];
    utterance.onend = () => {
      clearActiveUtterance(utterance);
    };
    utterance.onerror = () => {
      clearActiveUtterance(utterance);
    };

    activeSpeechKeyRef.current = speechKey;
    activeUtteranceRef.current = utterance;
    speechSynthesis.speak(utterance);
  }, [clearActiveUtterance]);

  useEffect(() => {
    return stopSpeech;
  }, [stopSpeech]);

  return {
    speakText,
    stopSpeech,
  };
}

function getSpeechSynthesis() {
  if (
    typeof window === "undefined" ||
    !("speechSynthesis" in window) ||
    typeof SpeechSynthesisUtterance === "undefined"
  ) {
    return null;
  }

  return window.speechSynthesis;
}
