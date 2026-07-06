"use client";

import { useState } from "react";
import type { CefrLevel } from "@/types/word";
import type { DailyStudyCount } from "../storage/dailyStudyStorage";
import styles from "./WordStudy.module.scss";

const cefrLevelOptions: CefrLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];
const dailyCountOptions: DailyStudyCount[] = [5, 10, 15, 20, "all"];

type DailyStudySetupProps = {
  errorMessage: string | null;
  isLoading: boolean;
  onStart: (cefrLevel: CefrLevel, dailyCount: DailyStudyCount) => void;
};

export function DailyStudySetup({
  errorMessage,
  isLoading,
  onStart,
}: DailyStudySetupProps) {
  const [cefrLevel, setCefrLevel] = useState<CefrLevel>("A1");
  const [dailyCount, setDailyCount] = useState<DailyStudyCount>(10);

  return (
    <section className={styles.setup} aria-label="Create daily study">
      <div className={styles.setupHeader}>
        <span className={styles.kicker}>Daily Study</span>
        <h2>Choose today&apos;s study</h2>
      </div>

      <div className={styles.controls}>
        <div className={styles.controlGroup}>
          <span className={styles.controlLabel}>CEFR level</span>
          <div className={styles.segmentedControl}>
            {cefrLevelOptions.map((option) => (
              <button
                key={option}
                className={
                  option === cefrLevel ? styles.segmentActive : styles.segment
                }
                type="button"
                onClick={() => setCefrLevel(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.controlGroup}>
          <span className={styles.controlLabel}>Today&apos;s words</span>
          <div className={styles.segmentedControl}>
            {dailyCountOptions.map((option) => (
              <button
                key={option}
                className={
                  option === dailyCount ? styles.segmentActive : styles.segment
                }
                type="button"
                onClick={() => setDailyCount(option)}
              >
                {option === "all" ? "All" : option}
              </button>
            ))}
          </div>
        </div>
      </div>

      {errorMessage ? <p className={styles.error}>{errorMessage}</p> : null}

      <button
        className={styles.primaryButton}
        type="button"
        onClick={() => onStart(cefrLevel, dailyCount)}
        disabled={isLoading}
      >
        {isLoading ? "Creating..." : "Start Daily Study"}
      </button>
    </section>
  );
}
