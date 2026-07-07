"use client";

import { useCallback, useMemo, useState } from "react";
import { getWordMeaningsByLanguage } from "@/services/words";
import type { Word, WordLanguage } from "@/types/word";

export type WordQuizOption = {
  id: string;
  meaning: string;
};

export type WordQuizQuestion = {
  id: string;
  word: Word;
  options: WordQuizOption[];
  correctOptionId: string;
  correctMeaning: string;
};

export type WordQuizAnswer = {
  selectedOptionId: string;
  selectedMeaning: string;
  correctMeaning: string;
  isCorrect: boolean;
};

export type WordQuizResult = {
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  accuracyRate: number;
};

export function useWordQuiz(words: Word[], language: WordLanguage) {
  const [questions, setQuestions] = useState<WordQuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Array<WordQuizAnswer | undefined>>(
    [],
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const startQuiz = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const candidateMeanings = await getWordMeaningsByLanguage(language);

      setQuestions(createQuizQuestions(words, candidateMeanings));
      setCurrentIndex(0);
      setAnswers([]);

      return true;
    } catch (error) {
      setQuestions([]);
      setCurrentIndex(0);
      setAnswers([]);
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to create quiz.",
      );

      return false;
    } finally {
      setIsLoading(false);
    }
  }, [language, words]);

  const selectAnswer = useCallback(
    (option: WordQuizOption) => {
      const question = questions[currentIndex];

      if (!question) {
        return;
      }

      setAnswers((currentAnswers) => {
        if (currentAnswers[currentIndex]) {
          return currentAnswers;
        }

        const nextAnswers = [...currentAnswers];
        nextAnswers[currentIndex] = {
          selectedOptionId: option.id,
          selectedMeaning: option.meaning,
          correctMeaning: question.correctMeaning,
          isCorrect: option.id === question.correctOptionId,
        };

        return nextAnswers;
      });
    },
    [currentIndex, questions],
  );

  const moveToNextQuestion = useCallback(() => {
    setCurrentIndex((index) => Math.min(index + 1, questions.length - 1));
  }, [questions.length]);

  const result = useMemo<WordQuizResult>(() => {
    const correctCount = answers.reduce(
      (count, answer) => count + (answer?.isCorrect ? 1 : 0),
      0,
    );
    const totalQuestions = questions.length;
    const incorrectCount = Math.max(0, totalQuestions - correctCount);
    const accuracyRate =
      totalQuestions > 0
        ? Math.round((correctCount / totalQuestions) * 100)
        : 0;

    return {
      totalQuestions,
      correctCount,
      incorrectCount,
      accuracyRate,
    };
  }, [answers, questions.length]);

  return useMemo(
    () => ({
      questions,
      currentQuestion: questions[currentIndex] ?? null,
      currentIndex,
      currentAnswer: answers[currentIndex] ?? null,
      result,
      isLoading,
      errorMessage,
      startQuiz,
      retryQuiz: startQuiz,
      selectAnswer,
      moveToNextQuestion,
    }),
    [
      questions,
      currentIndex,
      answers,
      result,
      isLoading,
      errorMessage,
      startQuiz,
      selectAnswer,
      moveToNextQuestion,
    ],
  );
}

function createQuizQuestions(words: Word[], candidateMeanings: string[]) {
  return shuffle(words).map((word, wordIndex) => {
    const correctOption: WordQuizOption = {
      id: `${wordIndex}-correct`,
      meaning: word.meaning,
    };
    const options = createMeaningOptions(
      correctOption,
      candidateMeanings,
      wordIndex,
    );

    return {
      id: `${wordIndex}-${word.word}`,
      word,
      options,
      correctOptionId: correctOption.id,
      correctMeaning: word.meaning,
    };
  });
}

function createMeaningOptions(
  correctOption: WordQuizOption,
  meanings: string[],
  wordIndex: number,
) {
  const correctMeaningKey = normalizeMeaning(correctOption.meaning);
  const distractors = getUniqueMeanings(meanings).filter(
    (meaning) => normalizeMeaning(meaning) !== correctMeaningKey,
  );

  if (distractors.length < 3) {
    throw new Error(
      "퀴즈 보기를 생성하려면 같은 언어의 다른 뜻이 최소 3개 필요합니다.",
    );
  }

  const options: WordQuizOption[] = [
    correctOption,
    ...shuffle(distractors)
      .slice(0, 3)
      .map((meaning, optionIndex) => ({
        id: `${wordIndex}-distractor-${optionIndex}`,
        meaning,
      })),
  ];

  return shuffle(options);
}

function getUniqueMeanings(meanings: string[]) {
  const seenMeanings = new Set<string>();
  const uniqueMeanings: string[] = [];

  for (const meaning of meanings) {
    const meaningKey = normalizeMeaning(meaning);

    if (!meaningKey || seenMeanings.has(meaningKey)) {
      continue;
    }

    seenMeanings.add(meaningKey);
    uniqueMeanings.push(meaning);
  }

  return uniqueMeanings;
}

function normalizeMeaning(meaning: string) {
  return meaning.trim().toLocaleLowerCase("ko-KR");
}

function shuffle<T>(items: T[]) {
  const shuffledItems = [...items];

  for (let index = shuffledItems.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffledItems[index], shuffledItems[randomIndex]] = [
      shuffledItems[randomIndex],
      shuffledItems[index],
    ];
  }

  return shuffledItems;
}
