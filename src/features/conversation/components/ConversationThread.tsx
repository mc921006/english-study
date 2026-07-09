"use client";

import { useEffect, useState } from "react";
import type {
  ConversationQuestion,
  ConversationTurn,
} from "@/types/conversation";
import { useTextToSpeech } from "@/lib/useTextToSpeech";
import { ConversationFeedbackCard } from "./ConversationFeedbackCard";
import styles from "./Conversation.module.scss";

type ConversationThreadProps = Readonly<{
  currentQuestion: ConversationQuestion | null;
  hasPendingNextQuestion?: boolean;
  isLoadingQuestion?: boolean;
  latestTurn: ConversationTurn | null;
  onNextQuestion: () => void;
}>;

type ChatMessageProps = Readonly<{
  speaker: string;
  text: string;
  isSpeechDisabled?: boolean;
  onSpeak?: () => void;
  onToggleTranslation?: () => void;
  showSpeechUnsupported?: boolean;
  translationText?: string | null;
  isTranslationVisible?: boolean;
  variant?: "ai" | "user";
}>;

function ChatMessage({
  speaker,
  text,
  isSpeechDisabled = false,
  isTranslationVisible = false,
  onSpeak,
  onToggleTranslation,
  showSpeechUnsupported = false,
  translationText = null,
  variant = "ai",
}: ChatMessageProps) {
  return (
    <div className={variant === "user" ? styles.userMessage : styles.aiMessage}>
      <div className={styles.messageHeader}>
        <span className={styles.messageSpeaker}>{speaker}</span>
      </div>
      <div className={styles.messageContent}>
        <p>{text}</p>
        {onSpeak ? (
          <button
            className={styles.messageAudioButton}
            type="button"
            aria-label="영어 질문 듣기"
            title="듣기"
            onClick={onSpeak}
            disabled={isSpeechDisabled}
          >
            🔊
          </button>
        ) : null}
      </div>
      {onToggleTranslation ? (
        <div className={styles.translationPanel}>
          <button
            className={styles.translationToggle}
            type="button"
            onClick={onToggleTranslation}
            aria-expanded={isTranslationVisible}
          >
            {isTranslationVisible ? "번역 숨기기" : "번역 보기"}
          </button>
          {isTranslationVisible && translationText ? (
            <p className={styles.translationText}>{translationText}</p>
          ) : null}
        </div>
      ) : null}
      {showSpeechUnsupported ? (
        <p className={styles.ttsUnsupported}>
          이 브라우저는 음성 재생을 지원하지 않습니다.
        </p>
      ) : null}
    </div>
  );
}

function getQuestionKey(question: ConversationQuestion) {
  return `${question.id}:${question.text}`;
}

type TranslationVisibilityState = {
  questionKey: string | null;
  isVisible: boolean;
};

export function ConversationThread({
  currentQuestion,
  hasPendingNextQuestion = false,
  isLoadingQuestion = false,
  latestTurn,
  onNextQuestion,
}: ConversationThreadProps) {
  const { isSpeechSupported, speakText, stopSpeech } = useTextToSpeech();
  const [translationVisibility, setTranslationVisibility] =
    useState<TranslationVisibilityState>({
      questionKey: null,
      isVisible: false,
    });
  const currentQuestionKey = currentQuestion
    ? getQuestionKey(currentQuestion)
    : null;
  const isTranslationVisible =
    translationVisibility.questionKey === currentQuestionKey &&
    translationVisibility.isVisible;

  useEffect(() => {
    return stopSpeech;
  }, [currentQuestionKey, stopSpeech]);

  function speakCurrentQuestion() {
    if (!currentQuestion) {
      return;
    }

    speakText(currentQuestion.text, "en-US");
  }

  function toggleQuestionTranslation() {
    if (!currentQuestionKey) {
      return;
    }

    setTranslationVisibility((state) => ({
      questionKey: currentQuestionKey,
      isVisible:
        state.questionKey === currentQuestionKey ? !state.isVisible : true,
    }));
  }

  return (
    <div className={styles.thread} aria-live="polite">
      {isLoadingQuestion ? (
        <ChatMessage speaker="Emma" text="Generating a question..." />
      ) : currentQuestion ? (
        <ChatMessage
          speaker="Emma"
          text={currentQuestion.text}
          isSpeechDisabled={isSpeechSupported === false}
          isTranslationVisible={isTranslationVisible}
          onSpeak={speakCurrentQuestion}
          onToggleTranslation={toggleQuestionTranslation}
          showSpeechUnsupported={isSpeechSupported === false}
          translationText={currentQuestion.translation}
        />
      ) : null}

      {latestTurn ? (
        <div className={styles.turn}>
          <ChatMessage speaker="You" text={latestTurn.answer} variant="user" />
          <ConversationFeedbackCard feedback={latestTurn.feedback} />
          {hasPendingNextQuestion ? (
            <button
              className={styles.primaryButton}
              type="button"
              onClick={onNextQuestion}
            >
              Next question
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
