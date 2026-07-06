"use client";

import { SelectCardGrid } from "@/components/ui/select-card-grid/SelectCardGrid";
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
  const topicItems = topics.map((topic) => ({
    value: topic.id,
    eyebrow: topic.subtitle,
    title: topic.title,
    description: topic.description,
  }));

  return (
    <aside className={styles.topicPanel} aria-label="Conversation topics">
      <div className={styles.panelHeader}>
        <span className={styles.kicker}>Topics</span>
        <h2>Choose a topic</h2>
      </div>

      <SelectCardGrid
        ariaLabel="Conversation topics"
        items={topicItems}
        selectedValue={selectedTopicId ?? ""}
        onSelect={onSelectTopic}
      />
    </aside>
  );
}
