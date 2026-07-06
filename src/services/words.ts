import { supabase } from "@/lib/supabase";
import type { CefrLevel, Word } from "@/types/word";

export type GetWordsParams = {
  cefrLevel: CefrLevel;
  limit: number | "all";
};

export async function getWords({
  cefrLevel,
  limit,
}: GetWordsParams): Promise<Word[]> {
  const { data, error } = await supabase
    .from("words")
    .select(
      "word, meaning, example, example_meaning, pronunciation, part_of_speech, cefr_level",
    )
    .eq("cefr_level", cefrLevel)
    .limit(1000);

  if (error) {
    throw new Error(error.message);
  }

  const shuffledWords = shuffleWords((data ?? []) as Word[]);

  if (limit === "all") {
    return shuffledWords;
  }

  return shuffledWords.slice(0, limit);
}

function shuffleWords(words: Word[]): Word[] {
  return [...words].sort(() => Math.random() - 0.5);
}
