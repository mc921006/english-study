type SpeakWithSpeechSynthesisOptions = {
  text: string;
  language: string;
  onEnd?: (utterance: SpeechSynthesisUtterance) => void;
  onError?: (utterance: SpeechSynthesisUtterance) => void;
};

export function getSpeechSynthesis() {
  if (
    typeof window === "undefined" ||
    !("speechSynthesis" in window) ||
    typeof SpeechSynthesisUtterance === "undefined"
  ) {
    return null;
  }

  return window.speechSynthesis;
}

export function isSpeechSynthesisSupported() {
  return getSpeechSynthesis() !== null;
}

export function stopSpeechSynthesis() {
  getSpeechSynthesis()?.cancel();
}

export function speakWithSpeechSynthesis({
  text,
  language,
  onEnd,
  onError,
}: SpeakWithSpeechSynthesisOptions) {
  const trimmedText = text.trim();
  const speechSynthesis = getSpeechSynthesis();

  if (!trimmedText || !speechSynthesis) {
    return null;
  }

  speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(trimmedText);
  utterance.lang = language;
  utterance.onend = () => {
    onEnd?.(utterance);
  };
  utterance.onerror = () => {
    onError?.(utterance);
  };

  speechSynthesis.speak(utterance);

  return utterance;
}
