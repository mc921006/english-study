"use client";

import type { KeyboardEvent, MouseEvent, PointerEvent, TouchEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Word } from "@/types/word";
import { useTextToSpeech } from "../hooks/useTextToSpeech";
import styles from "./WordStudy.module.scss";

const cardSlideDurationMs = 300;

type StudyCardProps = {
  currentIndex: number;
  totalWords: number;
  word: Word;
  onPrevious: () => void;
  onNext: () => void;
};

type SlideDirection = "next" | "previous";
type SlidePhase = "ready" | "running";

type CardTransition = {
  direction: SlideDirection;
  outgoingWord: Word;
  phase: SlidePhase;
};

function stopPronunciationEventPropagation(
  event:
    | KeyboardEvent<HTMLButtonElement>
    | MouseEvent<HTMLButtonElement>
    | PointerEvent<HTMLButtonElement>
    | TouchEvent<HTMLButtonElement>,
) {
  event.stopPropagation();
}

export function StudyCard({
  currentIndex,
  totalWords,
  word,
  onPrevious,
  onNext,
}: StudyCardProps) {
  const resetFrameRef = useRef<number | null>(null);
  const slideFrameRef = useRef<number | null>(null);
  const slideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isCardResetting, setIsCardResetting] = useState(false);
  const [cardTransition, setCardTransition] =
    useState<CardTransition | null>(null);
  const { speakText, stopSpeech } = useTextToSpeech();
  const isLastWord = currentIndex === totalWords - 1;
  const isTransitioning = cardTransition !== null;

  const clearSlideTimers = useCallback(() => {
    if (slideFrameRef.current !== null) {
      cancelAnimationFrame(slideFrameRef.current);
      slideFrameRef.current = null;
    }

    if (slideTimeoutRef.current !== null) {
      clearTimeout(slideTimeoutRef.current);
      slideTimeoutRef.current = null;
    }
  }, []);

  const resetCardToFront = useCallback(() => {
    if (resetFrameRef.current !== null) {
      cancelAnimationFrame(resetFrameRef.current);
    }

    setIsCardResetting(true);
    setIsFlipped(false);

    resetFrameRef.current = requestAnimationFrame(() => {
      resetFrameRef.current = requestAnimationFrame(() => {
        setIsCardResetting(false);
        resetFrameRef.current = null;
      });
    });
  }, []);

  useEffect(() => {
    return () => {
      if (resetFrameRef.current !== null) {
        cancelAnimationFrame(resetFrameRef.current);
      }

      clearSlideTimers();
    };
  }, [clearSlideTimers]);

  useEffect(() => {
    return stopSpeech;
  }, [stopSpeech, word.language, word.word]);

  const startSlideTransition = (
    direction: SlideDirection,
    navigate: () => void,
  ) => {
    if (cardTransition) {
      return;
    }

    clearSlideTimers();
    resetCardToFront();
    stopSpeech();
    setCardTransition({
      direction,
      outgoingWord: word,
      phase: "ready",
    });
    navigate();

    slideFrameRef.current = requestAnimationFrame(() => {
      slideFrameRef.current = null;
      setCardTransition((currentTransition) => {
        if (!currentTransition) {
          return currentTransition;
        }

        return {
          ...currentTransition,
          phase: "running",
        };
      });
    });

    slideTimeoutRef.current = setTimeout(() => {
      slideTimeoutRef.current = null;
      setCardTransition(null);
    }, cardSlideDurationMs + 40);
  };

  const moveToPrevious = () => {
    if (currentIndex === 0) {
      return;
    }

    startSlideTransition("previous", onPrevious);
  };

  const moveToNext = () => {
    if (isLastWord) {
      resetCardToFront();
      requestAnimationFrame(onNext);
      return;
    }

    startSlideTransition("next", onNext);
  };

  const flipCard = () => {
    if (isTransitioning) {
      return;
    }

    setIsFlipped((value) => !value);
  };

  const handleCardKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) {
      return;
    }

    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    flipCard();
  };

  const handlePronunciationClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();

    if (isTransitioning) {
      return;
    }

    speakText(word.word, word.language);
  };

  const currentMotionClassName = getCardMotionClassName(
    cardTransition,
    "current",
  );
  const outgoingMotionClassName = getCardMotionClassName(
    cardTransition,
    "outgoing",
  );

  return (
    <section className={styles.viewer} aria-label="Word card viewer">
      <div
        className={styles.cardButton}
        onClick={flipCard}
        onKeyDown={handleCardKeyDown}
        aria-label="Flip word card"
        aria-pressed={isFlipped}
        aria-disabled={isTransitioning}
        role="button"
        tabIndex={0}
      >
        <span className={currentMotionClassName}>
          {renderCard({
            isFlipped,
            isInteractive: true,
            isResetting: isCardResetting,
            onPronunciationClick: handlePronunciationClick,
            word,
          })}
        </span>
        {cardTransition ? (
          <span className={outgoingMotionClassName} aria-hidden="true">
            {renderCard({
              isFlipped: false,
              isInteractive: false,
              isResetting: false,
              word: cardTransition.outgoingWord,
            })}
          </span>
        ) : null}
      </div>

      <div className={styles.navigation}>
        <button
          className={styles.navButton}
          type="button"
          onClick={moveToPrevious}
          disabled={currentIndex === 0 || isTransitioning}
        >
          Previous
        </button>
        <button
          className={styles.navButton}
          type="button"
          onClick={moveToNext}
          disabled={isTransitioning}
        >
          {isLastWord ? "Complete" : "Next"}
        </button>
      </div>
    </section>
  );
}

type RenderCardParams = {
  isFlipped: boolean;
  isInteractive: boolean;
  isResetting: boolean;
  onPronunciationClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  word: Word;
};

function renderCard({
  isFlipped,
  isInteractive,
  isResetting,
  onPronunciationClick,
  word,
}: RenderCardParams) {
  const partOfSpeech = getPartOfSpeechDisplay(word.part_of_speech);
  const cardClassName = [
    isFlipped ? styles.cardFlipped : styles.card,
    isResetting ? styles.cardResetting : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={cardClassName}>
      <span className={styles.cardFaceFront}>
        <span
          className={`${styles.partOfSpeechBadge} ${partOfSpeech.className}`}
        >
          {partOfSpeech.label}
        </span>
        {isInteractive ? (
          <button
            className={styles.audioButton}
            type="button"
            aria-label={`${word.word} pronunciation`}
            onClick={onPronunciationClick}
            onKeyDown={stopPronunciationEventPropagation}
            onMouseDown={stopPronunciationEventPropagation}
            onPointerDown={stopPronunciationEventPropagation}
            onTouchStart={stopPronunciationEventPropagation}
          >
            🔊
          </button>
        ) : (
          <span className={styles.audioButton}>🔊</span>
        )}
        <span className={styles.frontContent}>
          <span className={styles.word}>{word.word}</span>
          <span className={styles.pronunciation}>
            {`[ ${word.pronunciation} ]`}
          </span>
        </span>
      </span>
      <span className={styles.cardFaceBack}>
        <span className={styles.meaning}>{word.meaning}</span>
        <span className={styles.example}>
          {highlightWordInExample(word.example, word.word)}
        </span>
        <span className={styles.exampleMeaning}>{word.example_meaning}</span>
      </span>
    </span>
  );
}

function getCardMotionClassName(
  transition: CardTransition | null,
  layer: "current" | "outgoing",
) {
  const classNames = [
    styles.cardMotion,
    layer === "current" ? styles.cardMotionCurrent : styles.cardMotionOutgoing,
  ];

  if (transition?.phase === "ready" && layer === "current") {
    classNames.push(styles.cardMotionReady);
    classNames.push(
      transition.direction === "next"
        ? styles.cardEnterFromRight
        : styles.cardEnterFromLeft,
    );
  }

  if (transition?.phase === "running" && layer === "outgoing") {
    classNames.push(
      transition.direction === "next"
        ? styles.cardExitToLeft
        : styles.cardExitToRight,
    );
  }

  return classNames.filter(Boolean).join(" ");
}

function getPartOfSpeechDisplay(partOfSpeech: string) {
  const normalizedPartOfSpeech = partOfSpeech.trim().toLocaleLowerCase("en-US");
  const label =
    partOfSpeechLabels[normalizedPartOfSpeech] ?? partOfSpeech.trim();
  const className =
    partOfSpeechClassNames[normalizedPartOfSpeech] ?? styles.posDefault;

  return { label, className };
}

const partOfSpeechLabels: Record<string, string> = {
  noun: "명사",
  pronoun: "대명사",
  verb: "동사",
  adjective: "형용사",
  adverb: "부사",
  preposition: "전치사",
  conjunction: "접속사",
  interjection: "감탄사",
  article: "관사",
  determiner: "한정사",
  "auxiliary verb": "조동사",
  "modal verb": "법조동사",
  "phrasal verb": "구동사",
};

const partOfSpeechClassNames: Record<string, string> = {
  noun: styles.posNoun,
  pronoun: styles.posPronoun,
  verb: styles.posVerb,
  adjective: styles.posAdjective,
  adverb: styles.posAdverb,
  preposition: styles.posPreposition,
  conjunction: styles.posConjunction,
  interjection: styles.posInterjection,
  article: styles.posArticle,
  determiner: styles.posDeterminer,
  "auxiliary verb": styles.posAuxiliaryVerb,
  "modal verb": styles.posModalVerb,
  "phrasal verb": styles.posPhrasalVerb,
};

function highlightWordInExample(example: string, word: string) {
  const escapedWord = escapeRegExp(word.trim());

  if (!escapedWord) {
    return example;
  }

  const wordPattern = new RegExp(`\\b(${escapedWord})\\b`, "gi");
  const parts = example.split(wordPattern);

  return parts.map((part, index) => {
    if (part.toLocaleLowerCase("en-US") !== word.toLocaleLowerCase("en-US")) {
      return part;
    }

    return (
      <span className={styles.exampleWord} key={`${part}-${index}`}>
        {part}
      </span>
    );
  });
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
