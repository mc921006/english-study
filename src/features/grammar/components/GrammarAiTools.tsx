"use client";

import { useState } from "react";
import type { Grammar } from "@/types/grammar";
import styles from "./Grammar.module.scss";

type MoreExample = {
  example: string;
  example_meaning: string;
};

type GrammarAiToolsProps = {
  grammar: Grammar;
};

export function GrammarAiTools({ grammar }: GrammarAiToolsProps) {
  const [easyExplanation, setEasyExplanation] = useState<string | null>(null);
  const [moreExamples, setMoreExamples] = useState<MoreExample[]>([]);
  const [loadingAction, setLoadingAction] = useState<
    "explain" | "examples" | null
  >(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const explainEasier = async () => {
    setLoadingAction("explain");
    setErrorMessage(null);

    try {
      const response = await fetch("/api/grammar/explain-easier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: grammar.title,
          description: grammar.description,
          example: grammar.example,
        }),
      });
      const result = (await response.json()) as {
        explanation?: string;
        error?: string;
      };

      if (!response.ok || !result.explanation) {
        throw new Error(result.error ?? "Failed to generate explanation.");
      }

      setEasyExplanation(result.explanation);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to generate explanation.",
      );
    } finally {
      setLoadingAction(null);
    }
  };

  const generateMoreExamples = async () => {
    setLoadingAction("examples");
    setErrorMessage(null);

    try {
      const response = await fetch("/api/grammar/more-examples", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: grammar.title,
          description: grammar.description,
          cefr_level: grammar.cefr_level,
        }),
      });
      const result = (await response.json()) as {
        examples?: MoreExample[];
        error?: string;
      };

      if (!response.ok || !result.examples) {
        throw new Error(result.error ?? "Failed to generate examples.");
      }

      setMoreExamples(result.examples);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to generate examples.",
      );
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <section className={styles.aiTools} aria-label="AI grammar tools">
      <div className={styles.futureActions}>
        <button
          type="button"
          onClick={explainEasier}
          disabled={loadingAction !== null}
        >
          {loadingAction === "explain" ? "Explaining..." : "Explain Easier"}
        </button>
        <button
          type="button"
          onClick={generateMoreExamples}
          disabled={loadingAction !== null}
        >
          {loadingAction === "examples" ? "Generating..." : "More Examples"}
        </button>
      </div>

      {errorMessage ? <p className={styles.error}>{errorMessage}</p> : null}

      {easyExplanation ? (
        <div className={styles.aiResult}>
          <h2>Easy Explanation</h2>
          <p>{easyExplanation}</p>
        </div>
      ) : null}

      {moreExamples.length > 0 ? (
        <div className={styles.aiResult}>
          <h2>More Examples</h2>
          <ol className={styles.moreExampleList}>
            {moreExamples.map((item, index) => (
              <li key={`${item.example}-${index}`}>
                <p className={styles.example}>{item.example}</p>
                <p className={styles.exampleMeaning}>{item.example_meaning}</p>
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </section>
  );
}
