import { notFound } from "next/navigation";
import { GrammarDetail } from "@/features/grammar/components/GrammarDetail";
import { getGrammarBySlug, getNextGrammar } from "@/services/grammar";
import styles from "../../words/page.module.scss";

type GrammarDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const metadata = {
  title: "Grammar Detail",
};

export default async function GrammarDetailPage({
  params,
}: GrammarDetailPageProps) {
  const { slug } = await params;
  const grammar = await getGrammarBySlug(slug);

  if (!grammar) {
    notFound();
  }

  const nextGrammar = await getNextGrammar(grammar);

  return (
    <section className={styles.wordsPage}>
      <GrammarDetail grammar={grammar} nextGrammar={nextGrammar} />
    </section>
  );
}
