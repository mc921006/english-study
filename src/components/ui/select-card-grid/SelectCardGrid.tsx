"use client";

import styles from "./SelectCardGrid.module.scss";

export type SelectCardValue = string | number;

export type SelectCardGridItem<TValue extends SelectCardValue> = {
  value: TValue;
  title: string;
  eyebrow?: string;
  description?: string;
};

type SelectCardGridProps<TValue extends SelectCardValue> = Readonly<{
  ariaLabel: string;
  items: Array<SelectCardGridItem<TValue>>;
  selectedValue: TValue;
  onSelect: (value: TValue) => void;
}>;

export function SelectCardGrid<TValue extends SelectCardValue>({
  ariaLabel,
  items,
  selectedValue,
  onSelect,
}: SelectCardGridProps<TValue>) {
  return (
    <div className={styles.grid} aria-label={ariaLabel} role="group">
      {items.map((item) => {
        const isSelected = item.value === selectedValue;

        return (
          <button
            className={isSelected ? styles.cardActive : styles.card}
            key={String(item.value)}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onSelect(item.value)}
          >
            {item.eyebrow ? (
              <span className={styles.eyebrow}>{item.eyebrow}</span>
            ) : null}
            <span className={styles.title}>{item.title}</span>
            {item.description ? (
              <span className={styles.description}>{item.description}</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
