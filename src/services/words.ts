import { supabase } from "@/lib/supabase";
import {
  defaultWordLanguage,
  type Word,
  type WordLanguage,
  type WordStudyLevel,
} from "@/types/word";

export type GetWordsParams = {
  cefrLevel: WordStudyLevel;
  language?: WordLanguage;
  limit: number | "all";
};

export async function getWords({
  cefrLevel,
  language = defaultWordLanguage,
  limit,
}: GetWordsParams): Promise<Word[]> {
  const { data, error } = await supabase
    .from("words")
    .select(
      "word, meaning, example, example_meaning, pronunciation, part_of_speech, cefr_level, language",
    )
    .eq("cefr_level", cefrLevel)
    .eq("language", language)
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
