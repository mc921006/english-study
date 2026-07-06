"use client";

import type { ConversationTopic } from "@/types/conversation";
import styles from "./Conversation.module.scss";

type TopicSelectorProps = Readonly<{
  selectedTopicId: string | null;
  topics: ConversationTopic[];
  onSelectTopic: (topicId: string) => void;
}>;

export function TopicSelector({
  selectedTopicId,
  topics,
  onSelectTopic,
}: TopicSelectorProps) {
  return (
    <aside className={styles.topicPanel} aria-label="Conversation topics">
      <div className={styles.panelHeader}>
        <span className={styles.kicker}>Topics</span>
        <h2>Choose a topic</h2>
      </div>

      <div className={styles.topicList}>
        {topics.map((topic) => {
          const isSelected = topic.id === selectedTopicId;

          return (
            <button
              className={isSelected ? styles.topicCardActive : styles.topicCard}
              key={topic.id}
              type="button"
              onClick={() => onSelectTopic(topic.id)}
            >
              <span className={styles.topicSubtitle}>{topic.subtitle}</span>
              <span className={styles.topicTitle}>{topic.title}</span>
              <span className={styles.topicDescription}>
                {topic.description}
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
