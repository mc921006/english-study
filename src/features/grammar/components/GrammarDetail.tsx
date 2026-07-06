import Link from "next/link";
import type { Grammar } from "@/types/grammar";
import { GrammarAiTools } from "./GrammarAiTools";
import styles from "./Grammar.module.scss";

type GrammarDetailProps = {
  grammar: Grammar;
  nextGrammar: Grammar | null;
};

export function GrammarDetail({ grammar, nextGrammar }: GrammarDetailProps) {
  return (
    <article className={styles.detail}>
      <div className={styles.detailHeader}>
        <span className={styles.kicker}>{grammar.cefr_level}</span>
        <h1>{grammar.title}</h1>
      </div>

      <section className={styles.explanation}>
        <h2>Description</h2>
        <p>{grammar.description}</p>
      </section>

      <section className={styles.exampleBox}>
        <h2>Example</h2>
        <p className={styles.example}>{grammar.example}</p>
        <p className={styles.exampleMeaning}>{grammar.example_meaning}</p>
      </section>

      <GrammarAiTools grammar={grammar} />

      <nav className={styles.detailActions} aria-label="Grammar navigation">
        <Link className={styles.secondaryButton} href="/grammar">
          Back to Grammar
        </Link>
        {nextGrammar ? (
          <Link className={styles.primaryButton} href={`/grammar/${nextGrammar.slug}`}>
            Next
          </Link>
        ) : (
          <span className={styles.disabledButton}>Next</span>
        )}
      </nav>
    </article>
  );
}
