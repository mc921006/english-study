import { supabase } from "@/lib/supabase";
import {
  defaultWordLanguage,
  type Word,
  type WordLanguage,
  type WordStudyLevel,
} from "@/types/word";

export type GetWordsParams = {
  level: WordStudyLevel;
  language?: WordLanguage;
  limit: number | "all";
};

export async function getWords({
  level,
  language = defaultWordLanguage,
  limit,
}: GetWordsParams): Promise<Word[]> {
  const { data, error } = await supabase
    .from("words")
    .select(
      "word, meaning, example, example_meaning, pronunciation, part_of_speech, level, language",
    )
    .eq("level", level)
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

export async function getWordMeaningsByLanguage(
  language: WordLanguage,
): Promise<string[]> {
  const pageSize = 1000;
  const meanings: string[] = [];

  for (let from = 0; ; from += pageSize) {
    const to = from + pageSize - 1;
    const { data, error } = await supabase
      .from("words")
      .select("word, meaning")
      .eq("language", language)
      .order("word", { ascending: true })
      .range(from, to);

    if (error) {
      throw new Error(error.message);
    }

    const rows = (data ?? []) as Array<Pick<Word, "meaning">>;
    meanings.push(
      ...rows
        .map((row) => row.meaning.trim())
        .filter((meaning) => meaning.length > 0),
    );

    if (rows.length < pageSize) {
      break;
    }
  }

  return meanings;
}

function shuffleWords(words: Word[]): Word[] {
  return [...words].sort(() => Math.random() - 0.5);
}
