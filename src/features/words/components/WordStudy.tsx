"use client";

import { useState } from "react";
import { getWords } from "@/services/words";
import type { WordLevel } from "@/types/word";
import styles from "./WordStudy.module.scss";

const levelOptions: WordLevel[] = ["Beginner", "Intermediate", "Advanced"];
const dailyCountOptions = [5, 10, 15, 20];

export function WordStudy() {
  const [level, setLevel] = useState<WordLevel>("Beginner");
  const [dailyCount, setDailyCount] = useState(5);
  const [words, setWords] = useState(() =>
    getWords({ level: "Beginner", limit: 5 }),
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const currentWord = words[currentIndex];

  const changeLevel = (nextLevel: WordLevel) => {
    setLevel(nextLevel);
    resetDeck(nextLevel, dailyCount);
  };

  const changeDailyCount = (nextCount: number) => {
    setDailyCount(nextCount);
    resetDeck(level, nextCount);
  };

  const resetDeck = (nextLevel = level, nextCount = dailyCount) => {
    setWords(getWords({ level: nextLevel, limit: nextCount }));
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const moveToPrevious = () => {
    setCurrentIndex((index) => Math.max(index - 1, 0));
    setIsFlipped(false);
  };

  const moveToNext = () => {
    setCurrentIndex((index) => Math.min(index + 1, words.length - 1));
    setIsFlipped(false);
  };

  if (!currentWord) {
    return (
      <div className={styles.empty}>
        <p>No words found for this option.</p>
      </div>
    );
  }

  return (
    <div className={styles.study}>
      <section className={styles.controls} aria-label="Study settings">
        <div className={styles.controlGroup}>
          <span className={styles.controlLabel}>Level</span>
          <div className={styles.segmentedControl}>
            {levelOptions.map((option) => (
              <button
                key={option}
                className={option === level ? styles.segmentActive : styles.segment}
                type="button"
                onClick={() => changeLevel(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.controlGroup}>
          <span className={styles.controlLabel}>Daily words</span>
          <div className={styles.segmentedControl}>
            {dailyCountOptions.map((option) => (
              <button
                key={option}
                className={
                  option === dailyCount ? styles.segmentActive : styles.segment
                }
                type="button"
                onClick={() => changeDailyCount(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <button
          className={styles.refreshButton}
          type="button"
          onClick={() => resetDeck()}
        >
          Randomize
        </button>
      </section>

      <section className={styles.viewer} aria-label="Word card viewer">
        <div className={styles.progress}>
          <span>
            {currentIndex + 1} / {words.length}
          </span>
          <span>{level}</span>
        </div>

        <button
          className={styles.cardButton}
          type="button"
          onClick={() => setIsFlipped((value) => !value)}
          aria-label="Flip word card"
          aria-pressed={isFlipped}
        >
          <span className={isFlipped ? styles.cardFlipped : styles.card}>
            <span className={styles.cardFaceFront}>
              <span className={styles.word}>{currentWord.word}</span>
            </span>
            <span className={styles.cardFaceBack}>
              <span className={styles.meaning}>{currentWord.meaning}</span>
              <span className={styles.example}>{currentWord.example}</span>
            </span>
          </span>
        </button>

        <div className={styles.navigation}>
          <button
            className={styles.navButton}
            type="button"
            onClick={moveToPrevious}
            disabled={currentIndex === 0}
          >
            Previous
          </button>
          <button
            className={styles.navButton}
            type="button"
            onClick={moveToNext}
            disabled={currentIndex === words.length - 1}
          >
            Next
          </button>
        </div>
      </section>
    </div>
  );
}
