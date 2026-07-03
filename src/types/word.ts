export type WordLevel = "Beginner" | "Intermediate" | "Advanced";

export type Word = {
  word: string;
  meaning: string;
  level: WordLevel;
  example: string;
};
