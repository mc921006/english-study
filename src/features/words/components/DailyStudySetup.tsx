"use client";

import { useState } from "react";
import {
  SelectCardGrid,
  type SelectCardGridItem,
} from "@/components/ui/select-card-grid/SelectCardGrid";
import {
  getDefaultWordStudyLevel,
  type CefrLevel,
  type JlptLevel,
  type WordLanguage,
  type WordStudyLevel,
} from "@/types/word";
import type { DailyStudyCount } from "../storage/dailyStudyStorage";
import styles from "./WordStudy.module.scss";

const cefrLevelOptions: CefrLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];
const cefrLevelItems: Array<SelectCardGridItem<CefrLevel>> =
  cefrLevelOptions.map((level) => ({
    value: level,
    title: level,
  }));
const japaneseLevelOptions: JlptLevel[] = ["N5", "N4", "N3", "N2", "N1"];
const japaneseLevelItems: Array<SelectCardGridItem<JlptLevel>> =
  japaneseLevelOptions.map((level) => ({
    value: level,
    title: level,
  }));
const dailyCountItems: Array<SelectCardGridItem<DailyStudyCount>> = [
  { value: 5, title: "5" },
  { value: 10, title: "10" },
  { value: 15, title: "15" },
  { value: 20, title: "20" },
  { value: "all", title: "All" },
];

type DailyStudySetupProps = {
  errorMessage: string | null;
  isLoading: boolean;
  wordLanguage: WordLanguage;
  onStart: (level: WordStudyLevel, dailyCount: DailyStudyCount) => void;
};

export function DailyStudySetup({
  errorMessage,
  isLoading,
  wordLanguage,
  onStart,
}: DailyStudySetupProps) {
  const [cefrLevel, setCefrLevel] = useState<CefrLevel>("A1");
  const [japaneseLevel, setJapaneseLevel] = useState<JlptLevel>("N5");
  const [dailyCount, setDailyCount] = useState<DailyStudyCount>(10);
  const selectedStudyLevel = getSelectedStudyLevel({
    cefrLevel,
    japaneseLevel,
    wordLanguage,
  });

  return (
    <section className={styles.setup} aria-label="Create daily study">
      <div className={styles.setupHeader}>
        <span className={styles.kicker}>Daily Study</span>
        <h2>학습 옵션 선택</h2>
      </div>

      <div className={styles.setupSections}>
        {wordLanguage === "en" ? (
          <div className={styles.controlGroup}>
            <span className={styles.controlLabel}>CEFR 레벨</span>
            <SelectCardGrid
              ariaLabel="CEFR level"
              items={cefrLevelItems}
              selectedValue={cefrLevel}
              variant="compact"
              onSelect={setCefrLevel}
            />
          </div>
        ) : null}

        {wordLanguage === "ja" ? (
          <div className={styles.controlGroup}>
            <span className={styles.controlLabel}>JLPT 레벨</span>
            <SelectCardGrid
              ariaLabel="JLPT level"
              items={japaneseLevelItems}
              selectedValue={japaneseLevel}
              variant="compact"
              onSelect={setJapaneseLevel}
            />
          </div>
        ) : null}

        <div className={styles.controlGroup}>
          <span className={styles.controlLabel}>학습 개수</span>
          <SelectCardGrid
            ariaLabel="Daily word count"
            items={dailyCountItems}
            selectedValue={dailyCount}
            variant="compact"
            onSelect={setDailyCount}
          />
        </div>
      </div>

      {errorMessage ? <p className={styles.error}>{errorMessage}</p> : null}

      <button
        className={styles.primaryButton}
        type="button"
        onClick={() => onStart(selectedStudyLevel, dailyCount)}
        disabled={isLoading}
      >
        {isLoading ? "준비 중..." : "학습 시작"}
      </button>
    </section>
  );
}

function getSelectedStudyLevel({
  cefrLevel,
  japaneseLevel,
  wordLanguage,
}: {
  cefrLevel: CefrLevel;
  japaneseLevel: JlptLevel;
  wordLanguage: WordLanguage;
}): WordStudyLevel {
  if (wordLanguage === "en") {
    return cefrLevel;
  }

  if (wordLanguage === "ja") {
    return japaneseLevel;
  }

  return getDefaultWordStudyLevel(wordLanguage);
}
