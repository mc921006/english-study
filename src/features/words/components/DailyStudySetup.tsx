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
        <h2>학습 옵션 선택</h2>
      </div>

      <div className={styles.setupSections}>
        <div className={styles.controlGroup}>
          <span className={styles.controlLabel}>CEFR 레벨</span>
          <div className={styles.levelGrid}>
            {cefrLevelOptions.map((option) => (
              <button
                key={option}
                className={
                  option === cefrLevel ? styles.levelCardActive : styles.levelCard
                }
                type="button"
                onClick={() => setCefrLevel(option)}
              >
                <span>{option}</span>
              </button>
            ))}
          </div>
        </div>

        <div className={styles.controlGroup}>
          <span className={styles.controlLabel}>학습 개수</span>
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
        {isLoading ? "준비 중..." : "학습 시작"}
      </button>
    </section>
  );
}
