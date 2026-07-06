"use client";

import type { KeyboardEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Word } from "@/types/word";
import styles from "./WordStudy.module.scss";

type StudyCardProps = {
  currentIndex: number;
  totalWords: number;
  word: Word;
  onPrevious: () => void;
  onNext: () => void;
};

export function StudyCard({
  currentIndex,
  totalWords,
  word,
  onPrevious,
  onNext,
}: StudyCardProps) {
  const resetFrameRef = useRef<number | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isCardResetting, setIsCardResetting] = useState(false);
  const isLastWord = currentIndex === totalWords - 1;
  const partOfSpeech = getPartOfSpeechDisplay(word.part_of_speech);

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
    };
  }, []);

  const moveToPrevious = () => {
    resetCardToFront();
    requestAnimationFrame(onPrevious);
  };

  const moveToNext = () => {
    resetCardToFront();
    requestAnimationFrame(onNext);
  };

  const flipCard = () => {
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

  const cardClassName = [
    isFlipped ? styles.cardFlipped : styles.card,
    isCardResetting ? styles.cardResetting : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={styles.viewer} aria-label="Word card viewer">
      <div
        className={styles.cardButton}
        onClick={flipCard}
        onKeyDown={handleCardKeyDown}
        aria-label="Flip word card"
        aria-pressed={isFlipped}
        role="button"
        tabIndex={0}
      >
        <span className={cardClassName}>
          <span className={styles.cardFaceFront}>
            <span
              className={`${styles.partOfSpeechBadge} ${partOfSpeech.className}`}
            >
              {partOfSpeech.label}
            </span>
            <button
              className={styles.audioButton}
              type="button"
              aria-label={`${word.word} pronunciation`}
              onClick={(event) => event.stopPropagation()}
              onKeyDown={(event) => event.stopPropagation()}
            >
              🔊
            </button>
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
            <span className={styles.exampleMeaning}>
              {word.example_meaning}
            </span>
          </span>
        </span>
      </div>

      <div className={styles.navigation}>
        <button
          className={styles.navButton}
          type="button"
          onClick={moveToPrevious}
          disabled={currentIndex === 0}
        >
          Previous
        </button>
        <button className={styles.navButton} type="button" onClick={moveToNext}>
          {isLastWord ? "Complete" : "Next"}
        </button>
      </div>
    </section>
  );
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
