import { supabase } from "@/lib/supabase";
import type { Grammar } from "@/types/grammar";
import type { CefrLevel } from "@/types/word";

const GRAMMAR_SELECT =
  "id, title, slug, description, example, example_meaning, cefr_level, order_index, created_at";

export async function getGrammarByLevel(
  cefrLevel: CefrLevel,
): Promise<Grammar[]> {
  const { data, error } = await supabase
    .from("grammar")
    .select(GRAMMAR_SELECT)
    .eq("cefr_level", cefrLevel)
    .order("order_index", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Grammar[];
}

export async function getGrammarBySlug(slug: string): Promise<Grammar | null> {
  const { data, error } = await supabase
    .from("grammar")
    .select(GRAMMAR_SELECT)
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data as Grammar | null) ?? null;
}

export async function getNextGrammar(grammar: Grammar): Promise<Grammar | null> {
  const { data, error } = await supabase
    .from("grammar")
    .select(GRAMMAR_SELECT)
    .eq("cefr_level", grammar.cefr_level)
    .gt("order_index", grammar.order_index)
    .order("order_index", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data as Grammar | null) ?? null;
}
