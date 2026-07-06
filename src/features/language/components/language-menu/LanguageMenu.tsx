"use client";

import { useEffect, useRef, useState } from "react";
import { studyLanguages } from "../../languageConfig";
import { useStudyLanguage } from "../../context/LanguageProvider";
import styles from "./LanguageMenu.module.scss";

export function LanguageMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { language, languageId, setLanguageId } = useStudyLanguage();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function closeMenu(event: MouseEvent) {
      if (
        menuRef.current &&
        event.target instanceof Node &&
        !menuRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", closeMenu);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("mousedown", closeMenu);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  return (
    <div className={styles.menu} ref={menuRef}>
      <button
        className={styles.trigger}
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={`Current study language: ${language.englishLabel}`}
        onClick={() => setIsOpen((current) => !current)}
      >
        {language.mark}
      </button>

      {isOpen ? (
        <div className={styles.popover} role="menu">
          {studyLanguages.map((item) => {
            const isSelected = item.id === languageId;

            return (
              <button
                className={isSelected ? styles.optionActive : styles.option}
                key={item.id}
                type="button"
                role="menuitemradio"
                aria-checked={isSelected}
                onClick={() => {
                  setLanguageId(item.id);
                  setIsOpen(false);
                }}
              >
                <span className={styles.flag}>{item.flag}</span>
                <span>{item.englishLabel}</span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
