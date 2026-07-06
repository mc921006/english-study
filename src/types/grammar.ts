import type { CefrLevel } from "./word";

export type Grammar = {
  id: string;
  title: string;
  slug: string;
  description: string;
  example: string;
  example_meaning: string;
  cefr_level: CefrLevel;
  order_index: number;
  created_at: string;
};

export type GrammarSeed = Omit<Grammar, "id" | "created_at">;
