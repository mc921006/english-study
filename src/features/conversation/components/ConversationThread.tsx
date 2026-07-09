"use client";

import { useEffect } from "react";
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
  speaker: "AI" | "You";
  text: string;
  isSpeechDisabled?: boolean;
  onSpeak?: () => void;
  showSpeechUnsupported?: boolean;
  variant?: "ai" | "user";
}>;

function ChatMessage({
  speaker,
  text,
  isSpeechDisabled = false,
  onSpeak,
  showSpeechUnsupported = false,
  variant = "ai",
}: ChatMessageProps) {
  return (
    <div className={variant === "user" ? styles.userMessage : styles.aiMessage}>
      <span>{speaker}</span>
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
      {showSpeechUnsupported ? (
        <p className={styles.ttsUnsupported}>
          이 브라우저는 음성 재생을 지원하지 않습니다.
        </p>
      ) : null}
    </div>
  );
}

export function ConversationThread({
  currentQuestion,
  hasPendingNextQuestion = false,
  isLoadingQuestion = false,
  latestTurn,
  onNextQuestion,
}: ConversationThreadProps) {
  const { isSpeechSupported, speakText, stopSpeech } = useTextToSpeech();

  useEffect(() => {
    return stopSpeech;
  }, [currentQuestion?.id, stopSpeech]);

  function speakCurrentQuestion() {
    if (!currentQuestion) {
      return;
    }

    speakText(currentQuestion.text, "en-US");
  }

  return (
    <div className={styles.thread} aria-live="polite">
      {isLoadingQuestion ? (
        <ChatMessage speaker="AI" text="Generating a question..." />
      ) : currentQuestion ? (
        <ChatMessage
          speaker="AI"
          text={currentQuestion.text}
          isSpeechDisabled={isSpeechSupported === false}
          onSpeak={speakCurrentQuestion}
          showSpeechUnsupported={isSpeechSupported === false}
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
