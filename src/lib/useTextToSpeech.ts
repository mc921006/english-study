"use client";

import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";
import {
  isSpeechSynthesisSupported,
  speakWithSpeechSynthesis,
  stopSpeechSynthesis,
} from "./textToSpeech";

export function useTextToSpeech() {
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const isSpeechSupported = useSyncExternalStore(
    subscribeToSpeechSupport,
    getSpeechSupportSnapshot,
    getSpeechSupportServerSnapshot,
  );

  const stopSpeech = useCallback(() => {
    activeUtteranceRef.current = null;
    stopSpeechSynthesis();
  }, []);

  const clearActiveUtterance = useCallback(
    (utterance: SpeechSynthesisUtterance) => {
      if (activeUtteranceRef.current !== utterance) {
        return;
      }

      activeUtteranceRef.current = null;
    },
    [],
  );

  const speakText = useCallback(
    (text: string, speechLanguage: string) => {
      activeUtteranceRef.current = null;

      const utterance = speakWithSpeechSynthesis({
        text,
        language: speechLanguage,
        onEnd: clearActiveUtterance,
        onError: clearActiveUtterance,
      });

      activeUtteranceRef.current = utterance;
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

function subscribeToSpeechSupport() {
  return () => {};
}

function getSpeechSupportSnapshot() {
  return isSpeechSynthesisSupported();
}

function getSpeechSupportServerSnapshot() {
  return null;
}
