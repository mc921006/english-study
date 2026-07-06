"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  SelectCardGrid,
  type SelectCardGridItem,
} from "@/components/ui/select-card-grid/SelectCardGrid";
import { getGrammarByLevel } from "@/services/grammar";
import type { Grammar } from "@/types/grammar";
import type { CefrLevel } from "@/types/word";
import styles from "./Grammar.module.scss";

const cefrLevelOptions: CefrLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];
const cefrLevelItems: Array<SelectCardGridItem<CefrLevel>> =
  cefrLevelOptions.map((level) => ({
    value: level,
    title: level,
  }));

export function GrammarList() {
  const [cefrLevel, setCefrLevel] = useState<CefrLevel>("A1");
  const [grammarItems, setGrammarItems] = useState<Grammar[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;

    async function loadGrammar() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const nextItems = await getGrammarByLevel(cefrLevel);
        if (!isCurrent) {
          return;
        }

        setGrammarItems(nextItems);
      } catch (error) {
        if (!isCurrent) {
          return;
        }

        setGrammarItems([]);
        setErrorMessage(
          error instanceof Error ? error.message : "Failed to load grammar.",
        );
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    }

    loadGrammar();

    return () => {
      isCurrent = false;
    };
  }, [cefrLevel]);

  return (
    <section className={styles.grammarPanel} aria-label="Grammar list">
      <SelectCardGrid
        ariaLabel="Grammar CEFR level"
        items={cefrLevelItems}
        selectedValue={cefrLevel}
        variant="compact"
        onSelect={setCefrLevel}
      />

      {isLoading ? (
        <div className={styles.empty}>Loading grammar...</div>
      ) : errorMessage ? (
        <div className={styles.empty}>{errorMessage}</div>
      ) : grammarItems.length === 0 ? (
        <div className={styles.empty}>No grammar found for {cefrLevel}.</div>
      ) : (
        <div className={styles.grammarList}>
          {grammarItems.map((item) => (
            <Link
              className={styles.grammarItem}
              href={`/grammar/${item.slug}`}
              key={item.id}
            >
              <span className={styles.itemIndex}>
                {String(item.order_index).padStart(2, "0")}
              </span>
              <span>
                <span className={styles.itemTitle}>{item.title}</span>
                <span className={styles.itemDescription}>
                  {item.description}
                </span>
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
