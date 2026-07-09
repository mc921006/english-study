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

const RECENT_QUESTION_LIMIT = 12;

function normalizeQuestionText(text: string) {
  return text.trim().replace(/\s+/g, " ");
}

export function ConversationPractice() {
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] =
    useState<ConversationQuestion | null>(null);
  const [latestTurn, setLatestTurn] = useState<ConversationTurn | null>(null);
  const [pendingNextQuestion, setPendingNextQuestion] =
    useState<ConversationQuestion | null>(null);
  const [recentQuestionsByTopic, setRecentQuestionsByTopic] = useState<
    Record<string, string[]>
  >({});
  const [isQuestionLoading, setIsQuestionLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const latestQuestionRequestId = useRef(0);
  const latestAnswerRequestId = useRef(0);

  const selectedTopic = selectedTopicId ? findTopic(selectedTopicId) : undefined;

  function getRecentQuestions(topicId: string) {
    return recentQuestionsByTopic[topicId] ?? [];
  }

  function rememberQuestion(topicId: string, text: string) {
    const normalizedQuestion = normalizeQuestionText(text);

    if (!normalizedQuestion) {
      return;
    }

    setRecentQuestionsByTopic((questionsByTopic) => {
      const topicQuestions = questionsByTopic[topicId] ?? [];
      const dedupedQuestions = topicQuestions.filter(
        (question) =>
          question.toLowerCase() !== normalizedQuestion.toLowerCase(),
      );

      return {
        ...questionsByTopic,
        [topicId]: [...dedupedQuestions, normalizedQuestion].slice(
          -RECENT_QUESTION_LIMIT,
        ),
      };
    });
  }

  async function loadFirstQuestion(topic: ConversationTopic) {
    const requestId = latestQuestionRequestId.current + 1;
    latestQuestionRequestId.current = requestId;
    const previousQuestions = getRecentQuestions(topic.id);

    setCurrentQuestion(null);
    setLatestTurn(null);
    setPendingNextQuestion(null);
    setErrorMessage(null);
    setIsQuestionLoading(true);

    try {
      const question = await getConversationQuestion(topic, previousQuestions);

      if (latestQuestionRequestId.current !== requestId) {
        return;
      }

      setCurrentQuestion(question);
      rememberQuestion(topic.id, question.text);
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
    latestAnswerRequestId.current += 1;
    void loadFirstQuestion(nextTopic);
  }

  function restartConversation() {
    if (!selectedTopic) {
      return;
    }

    latestAnswerRequestId.current += 1;
    void loadFirstQuestion(selectedTopic);
  }

  async function submitUserAnswer(answer: string) {
    if (!selectedTopic || !currentQuestion || pendingNextQuestion) {
      return false;
    }

    const requestId = latestAnswerRequestId.current + 1;
    latestAnswerRequestId.current = requestId;
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const result = await submitAnswer({
        topic: selectedTopic,
        question: currentQuestion,
        answer,
        previousQuestions: getRecentQuestions(selectedTopic.id),
      });

      if (latestAnswerRequestId.current !== requestId) {
        return false;
      }

      const nextTurn: ConversationTurn = {
        id: `${currentQuestion.id}-answer`,
        question: currentQuestion,
        answer,
        feedback: result.feedback,
      };

      setLatestTurn(nextTurn);
      setPendingNextQuestion(result.nextQuestion);
      rememberQuestion(selectedTopic.id, result.nextQuestion.text);
      return true;
    } catch (error) {
      if (latestAnswerRequestId.current !== requestId) {
        return false;
      }

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "답변을 확인하지 못했습니다.",
      );
      return false;
    } finally {
      if (latestAnswerRequestId.current === requestId) {
        setIsSubmitting(false);
      }
    }
  }

  function moveToNextQuestion() {
    if (!pendingNextQuestion) {
      return;
    }

    setCurrentQuestion(pendingNextQuestion);
    setLatestTurn(null);
    setPendingNextQuestion(null);
    setErrorMessage(null);
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
              hasPendingNextQuestion={Boolean(pendingNextQuestion)}
              isLoadingQuestion={isQuestionLoading}
              latestTurn={latestTurn}
              onNextQuestion={moveToNextQuestion}
            />
            {!pendingNextQuestion ? (
              <ConversationComposer
                disabled={!currentQuestion || isQuestionLoading}
                isSubmitting={isSubmitting}
                onSubmit={submitUserAnswer}
              />
            ) : null}
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
