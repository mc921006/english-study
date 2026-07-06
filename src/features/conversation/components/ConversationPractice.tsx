"use client";

import { useRef, useState } from "react";
import type {
  ConversationQuestion,
  ConversationTopic,
  ConversationTurn,
} from "@/types/conversation";
import { conversationTopics } from "../data/conversationDummyData";
import {
  getConversationQuestion,
  submitAnswer,
} from "../services/conversationApi";
import { ConversationComposer } from "./ConversationComposer";
import { ConversationThread } from "./ConversationThread";
import { TopicSelector } from "./TopicSelector";
import styles from "./Conversation.module.scss";

function findTopic(topicId: string): ConversationTopic | undefined {
  return conversationTopics.find((topic) => topic.id === topicId);
}

export function ConversationPractice() {
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] =
    useState<ConversationQuestion | null>(null);
  const [turns, setTurns] = useState<ConversationTurn[]>([]);
  const [isQuestionLoading, setIsQuestionLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const latestQuestionRequestId = useRef(0);

  const selectedTopic = selectedTopicId ? findTopic(selectedTopicId) : undefined;

  async function loadFirstQuestion(topic: ConversationTopic) {
    const requestId = latestQuestionRequestId.current + 1;
    latestQuestionRequestId.current = requestId;

    setCurrentQuestion(null);
    setErrorMessage(null);
    setIsQuestionLoading(true);

    try {
      const question = await getConversationQuestion(topic);

      if (latestQuestionRequestId.current !== requestId) {
        return;
      }

      setCurrentQuestion(question);
    } catch (error) {
      if (latestQuestionRequestId.current !== requestId) {
        return;
      }

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "질문을 생성하지 못했습니다.",
      );
    } finally {
      if (latestQuestionRequestId.current === requestId) {
        setIsQuestionLoading(false);
      }
    }
  }

  function startTopic(topicId: string) {
    const nextTopic = findTopic(topicId);

    if (!nextTopic) {
      return;
    }

    setSelectedTopicId(nextTopic.id);
    setTurns([]);
    void loadFirstQuestion(nextTopic);
  }

  function restartConversation() {
    if (!selectedTopic) {
      return;
    }

    setTurns([]);
    void loadFirstQuestion(selectedTopic);
  }

  async function submitUserAnswer(answer: string) {
    if (!selectedTopic || !currentQuestion) {
      return false;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const result = await submitAnswer({
        topic: selectedTopic,
        question: currentQuestion,
        answer,
      });
      const nextTurn: ConversationTurn = {
        id: `${selectedTopic.id}-${turns.length + 1}`,
        question: currentQuestion,
        answer,
        feedback: result.feedback,
      };

      setTurns((currentTurns) => [...currentTurns, nextTurn]);
      setCurrentQuestion(result.nextQuestion);
      return true;
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "답변을 확인하지 못했습니다.",
      );
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={styles.workspace}>
      <TopicSelector
        selectedTopicId={selectedTopicId}
        topics={conversationTopics}
        onSelectTopic={startTopic}
      />

      <section className={styles.practicePanel} aria-label="Conversation area">
        {selectedTopic ? (
          <>
            <div className={styles.practiceHeader}>
              <div>
                <span className={styles.kicker}>Current topic</span>
                <h2>{selectedTopic.title}</h2>
                <p>{selectedTopic.description}</p>
              </div>
              <button
                className={styles.secondaryButton}
                disabled={isQuestionLoading || isSubmitting}
                type="button"
                onClick={restartConversation}
              >
                Restart
              </button>
            </div>

            {errorMessage ? <p className={styles.error}>{errorMessage}</p> : null}

            <ConversationThread
              currentQuestion={currentQuestion}
              isLoadingQuestion={isQuestionLoading}
              turns={turns}
            />
            <ConversationComposer
              disabled={!currentQuestion || isQuestionLoading}
              isSubmitting={isSubmitting}
              onSubmit={submitUserAnswer}
            />
          </>
        ) : (
          <div className={styles.emptyPanel}>
            <span className={styles.kicker}>Conversation</span>
            <h2>Select a topic to start</h2>
            <p>
              The first AI question will appear here after you choose a topic.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
