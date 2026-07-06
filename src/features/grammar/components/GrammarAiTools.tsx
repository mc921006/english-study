"use client";

import { useState } from "react";
import type { Grammar } from "@/types/grammar";
import styles from "./Grammar.module.scss";

type MoreExample = {
  example: string;
  example_meaning: string;
};

type EasyExplanation = {
  paragraph: string;
  paragraph_meaning: string;
  explanation: string;
};

type GrammarAiToolsProps = {
  grammar: Grammar;
};

export function GrammarAiTools({ grammar }: GrammarAiToolsProps) {
  const [easyExplanation, setEasyExplanation] =
    useState<EasyExplanation | null>(null);
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
        paragraph?: string;
        paragraph_meaning?: string;
        explanation?: string;
        error?: string;
      };

      if (
        !response.ok ||
        !result.paragraph ||
        !result.paragraph_meaning ||
        !result.explanation
      ) {
        throw new Error(result.error ?? "Failed to generate explanation.");
      }

      setEasyExplanation({
        paragraph: result.paragraph,
        paragraph_meaning: result.paragraph_meaning,
        explanation: result.explanation,
      });
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
          <div className={styles.aiResult}>
            <h2>예시 문단</h2>
            <p className={styles.paragraphText}>
              {highlightMarkedSentence(easyExplanation.paragraph)}
            </p>
            <p className={styles.paragraphMeaning}>
              {easyExplanation.paragraph_meaning}
            </p>
          </div>

          <div className={styles.aiResult}>
            <h2>어떻게 쓰였나요?</h2>
            <p>{easyExplanation.explanation}</p>
          </div>
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

function highlightMarkedSentence(paragraph: string) {
  const match = paragraph.match(/\[\[(.*?)\]\]/);

  if (!match || match.index === undefined) {
    return paragraph;
  }

  const [markedText, sentence] = match;
  const before = paragraph.slice(0, match.index);
  const after = paragraph.slice(match.index + markedText.length);

  return (
    <>
      {before}
      <strong className={styles.highlightSentence}>{sentence}</strong>
      {after}
    </>
  );
}
