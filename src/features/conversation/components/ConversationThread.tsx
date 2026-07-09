"use client";

import { useEffect, useRef, useState } from "react";
import type {
  ConversationQuestion,
  ConversationTurn,
} from "@/types/conversation";
import { useTextToSpeech } from "@/lib/useTextToSpeech";
import { translateConversationQuestion } from "../services/conversationApi";
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
  translationError?: string | null;
  translationText?: string | null;
  isTranslationLoading?: boolean;
  isTranslationVisible?: boolean;
  variant?: "ai" | "user";
}>;

function ChatMessage({
  speaker,
  text,
  isSpeechDisabled = false,
  isTranslationLoading = false,
  isTranslationVisible = false,
  onSpeak,
  onToggleTranslation,
  showSpeechUnsupported = false,
  translationError = null,
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
            disabled={isTranslationLoading}
            aria-expanded={isTranslationVisible}
          >
            {isTranslationVisible ? "번역 숨기기" : "번역 보기"}
          </button>
          {isTranslationLoading ? (
            <p className={styles.translationStatus}>
              번역을 불러오는 중입니다.
            </p>
          ) : null}
          {translationError ? (
            <p className={styles.translationError}>{translationError}</p>
          ) : null}
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

type TranslationState = {
  error: string | null;
  isLoading: boolean;
  isVisible: boolean;
  questionKey: string | null;
  text: string | null;
};

const initialTranslationState: TranslationState = {
  error: null,
  isLoading: false,
  isVisible: false,
  questionKey: null,
  text: null,
};

function getQuestionKey(question: ConversationQuestion) {
  return `${question.id}:${question.text}`;
}

export function ConversationThread({
  currentQuestion,
  hasPendingNextQuestion = false,
  isLoadingQuestion = false,
  latestTurn,
  onNextQuestion,
}: ConversationThreadProps) {
  const { isSpeechSupported, speakText, stopSpeech } = useTextToSpeech();
  const [translationState, setTranslationState] = useState<TranslationState>(
    initialTranslationState,
  );
  const latestTranslationRequestId = useRef(0);
  const currentQuestionKey = currentQuestion
    ? getQuestionKey(currentQuestion)
    : null;

  useEffect(() => {
    return stopSpeech;
  }, [currentQuestionKey, stopSpeech]);

  useEffect(() => {
    latestTranslationRequestId.current += 1;
    setTranslationState((state) =>
      state.questionKey === currentQuestionKey
        ? state
        : {
            ...initialTranslationState,
            questionKey: currentQuestionKey,
          },
    );
  }, [currentQuestionKey]);

  function speakCurrentQuestion() {
    if (!currentQuestion) {
      return;
    }

    speakText(currentQuestion.text, "en-US");
  }

  async function toggleQuestionTranslation() {
    if (!currentQuestion || !currentQuestionKey) {
      return;
    }

    if (
      translationState.questionKey === currentQuestionKey &&
      translationState.isVisible
    ) {
      setTranslationState((state) => ({
        ...state,
        isVisible: false,
      }));
      return;
    }

    if (
      translationState.questionKey === currentQuestionKey &&
      translationState.text
    ) {
      setTranslationState((state) => ({
        ...state,
        error: null,
        isVisible: true,
      }));
      return;
    }

    const requestId = latestTranslationRequestId.current + 1;
    latestTranslationRequestId.current = requestId;
    const questionText = currentQuestion.text;

    setTranslationState({
      error: null,
      isLoading: true,
      isVisible: true,
      questionKey: currentQuestionKey,
      text: null,
    });

    try {
      const translation = await translateConversationQuestion(questionText);

      if (latestTranslationRequestId.current !== requestId) {
        return;
      }

      setTranslationState((state) => {
        if (state.questionKey !== currentQuestionKey) {
          return state;
        }

        return {
          error: null,
          isLoading: false,
          isVisible: true,
          questionKey: currentQuestionKey,
          text: translation,
        };
      });
    } catch (error) {
      if (latestTranslationRequestId.current !== requestId) {
        return;
      }

      setTranslationState((state) => {
        if (state.questionKey !== currentQuestionKey) {
          return state;
        }

        return {
          ...state,
          error:
            error instanceof Error
              ? error.message
              : "번역을 불러오지 못했습니다.",
          isLoading: false,
          isVisible: true,
        };
      });
    }
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
          isTranslationLoading={translationState.isLoading}
          isTranslationVisible={translationState.isVisible}
          onSpeak={speakCurrentQuestion}
          onToggleTranslation={toggleQuestionTranslation}
          showSpeechUnsupported={isSpeechSupported === false}
          translationError={translationState.error}
          translationText={translationState.text}
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
