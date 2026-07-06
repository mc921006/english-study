export type CefrLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export type Word = {
  word: string;
  meaning: string;
  example: string;
  example_meaning: string;
  pronunciation: string;
  part_of_speech: string;
  cefr_level: CefrLevel;
};
