"use client";

import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";
import type { WordLanguage } from "@/types/word";

const speechLanguageByWordLanguage: Record<WordLanguage, string> = {
  en: "en-US",
  vi: "vi-VN",
};

export function useTextToSpeech() {
  const activeSpeechKeyRef = useRef<string | null>(null);
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const isSpeechSupported = useSyncExternalStore(
    subscribeToSpeechSupport,
    getSpeechSupportSnapshot,
    getSpeechSupportServerSnapshot,
  );

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

  const speakText = useCallback(
    (text: string, language: WordLanguage, speechLanguage?: string) => {
      const trimmedText = text.trim();
      const speechSynthesis = getSpeechSynthesis();

      if (!trimmedText || !speechSynthesis) {
        return;
      }

      const speechKey = `${language}:${trimmedText}`;

      activeSpeechKeyRef.current = null;
      activeUtteranceRef.current = null;
      speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(trimmedText);
      utterance.lang = speechLanguage ?? speechLanguageByWordLanguage[language];
      utterance.onend = () => {
        clearActiveUtterance(utterance);
      };
      utterance.onerror = () => {
        clearActiveUtterance(utterance);
      };

      activeSpeechKeyRef.current = speechKey;
      activeUtteranceRef.current = utterance;
      speechSynthesis.speak(utterance);
    },
    [clearActiveUtterance],
  );

  useEffect(() => {
    return stopSpeech;
  }, [stopSpeech]);

  return {
    isSpeechSupported,
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

function subscribeToSpeechSupport() {
  return () => {};
}

function getSpeechSupportSnapshot() {
  return getSpeechSynthesis() !== null;
}

function getSpeechSupportServerSnapshot() {
  return null;
}
