"use client";

import { FormEvent, useState } from "react";
import styles from "./Conversation.module.scss";

type ConversationComposerProps = Readonly<{
  disabled?: boolean;
  isSubmitting?: boolean;
  onSubmit: (answer: string) => Promise<boolean>;
}>;

export function ConversationComposer({
  disabled = false,
  isSubmitting = false,
  onSubmit,
}: ConversationComposerProps) {
  const [draft, setDraft] = useState("");
  const trimmedDraft = draft.trim();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!trimmedDraft || disabled || isSubmitting) {
      return;
    }

    const shouldClear = await onSubmit(trimmedDraft);

    if (shouldClear) {
      setDraft("");
    }
  }

  return (
    <form className={styles.composer} onSubmit={handleSubmit}>
      <label className={styles.composerLabel} htmlFor="conversation-answer">
        Your answer
      </label>
      <textarea
        id="conversation-answer"
        className={styles.answerInput}
        disabled={disabled}
        placeholder="Write your answer in English."
        rows={4}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
      />
      <button
        className={styles.primaryButton}
        disabled={!trimmedDraft || disabled || isSubmitting}
        type="submit"
      >
        {isSubmitting ? "Checking..." : "Send answer"}
      </button>
    </form>
  );
}
