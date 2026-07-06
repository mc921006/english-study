"use client";

import Link from "next/link";
import { getAvailableStudyFeatures } from "../languageConfig";
import { useStudyLanguage } from "../context/LanguageProvider";
import styles from "../../../app/page.module.scss";

export function HomeStudyActions() {
  const { languageId } = useStudyLanguage();
  const availableFeatures = getAvailableStudyFeatures(languageId);

  return (
    <div className={styles.actions}>
      {availableFeatures.map((feature, index) => (
        <Link
          className={index === 0 ? styles.action : styles.actionSecondary}
          href={feature.href}
          key={feature.id}
        >
          {feature.actionLabel}
        </Link>
      ))}
    </div>
  );
}
