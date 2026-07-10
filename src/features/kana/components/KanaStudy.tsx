"use client";

import { useMemo, useState } from "react";
import { kanaSets, type KanaCard, type KanaSetId } from "../data/kanaData";
import { KanaCardGrid } from "./KanaCardGrid";
import { KanaDetail } from "./KanaDetail";
import styles from "./Kana.module.scss";

const defaultKanaSetId: KanaSetId = "hiragana";

export function KanaStudy() {
  const [selectedSetId, setSelectedSetId] =
    useState<KanaSetId>(defaultKanaSetId);
  const [selectedCard, setSelectedCard] = useState<KanaCard | null>(null);
  const selectedSet = useMemo(
    () =>
      kanaSets.find((kanaSet) => kanaSet.id === selectedSetId) ?? kanaSets[0],
    [selectedSetId],
  );

  function selectKanaSet(nextSetId: KanaSetId) {
    setSelectedSetId(nextSetId);
    setSelectedCard(null);
  }

  return (
    <section className={styles.study} aria-label="Kana study">
      <div className={styles.tabs} role="tablist" aria-label="Kana scripts">
        {kanaSets.map((kanaSet) => {
          const isSelected = kanaSet.id === selectedSet.id;

          return (
            <button
              className={isSelected ? styles.tabActive : styles.tab}
              id={`${kanaSet.id}-tab`}
              key={kanaSet.id}
              type="button"
              role="tab"
              aria-controls={`${kanaSet.id}-panel`}
              aria-selected={isSelected}
              onClick={() => selectKanaSet(kanaSet.id)}
            >
              <span>{kanaSet.label}</span>
              <small>{kanaSet.englishLabel}</small>
            </button>
          );
        })}
      </div>

      <div
        className={styles.panel}
        id={`${selectedSet.id}-panel`}
        role="tabpanel"
        aria-labelledby={`${selectedSet.id}-tab`}
      >
        <div className={styles.panelHeader}>
          <div>
            <span className={styles.kicker}>{selectedSet.englishLabel}</span>
            <h2>{selectedSet.label}</h2>
          </div>
          <p>{selectedSet.description}</p>
        </div>

        {selectedCard ? (
          <KanaDetail
            card={selectedCard}
            kanaSet={selectedSet}
            onBack={() => setSelectedCard(null)}
          />
        ) : (
          <KanaCardGrid
            cards={selectedSet.cards}
            kanaSetId={selectedSet.id}
            onSelectCard={setSelectedCard}
          />
        )}
      </div>
    </section>
  );
}
