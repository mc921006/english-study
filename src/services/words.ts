import { mockWords } from "@/data/mockWords";
import type { Word, WordLevel } from "@/types/word";

export type GetWordsParams = {
  level: WordLevel;
  limit: number;
};

export function getWords({ level, limit }: GetWordsParams): Word[] {
  const wordsByLevel = mockWords.filter((word) => word.level === level);

  return shuffleWords(wordsByLevel).slice(0, limit);
}

function shuffleWords(words: Word[]): Word[] {
  return [...words].sort(() => Math.random() - 0.5);
}
