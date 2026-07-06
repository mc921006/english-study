"use client";

import {
  SelectCardGrid,
  type SelectCardGridItem,
} from "@/components/ui/select-card-grid/SelectCardGrid";
import {
  studyLanguages,
  type StudyLanguageId,
} from "../languageConfig";
import { useStudyLanguage } from "../context/LanguageProvider";
import styles from "./LanguageSelector.module.scss";

const languageItems: Array<SelectCardGridItem<StudyLanguageId>> =
  studyLanguages.map((language) => ({
    value: language.id,
    eyebrow: language.englishLabel,
    title: language.label,
    description: language.description,
  }));

export function LanguageSelector() {
  const { languageId, setLanguageId } = useStudyLanguage();

  return (
    <div className={styles.selector}>
      <div className={styles.header}>
        <span>Language</span>
        <h2>학습 언어 선택</h2>
      </div>
      <SelectCardGrid
        ariaLabel="Study language"
        items={languageItems}
        selectedValue={languageId}
        onSelect={setLanguageId}
      />
    </div>
  );
}
