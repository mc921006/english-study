import type {
  ConversationFeedback,
  ConversationTopic,
} from "@/types/conversation";

export type MockAnswerEvaluation = ConversationFeedback & {
  nextQuestion: string;
};

export const conversationTopics: ConversationTopic[] = [
  {
    id: "daily-life",
    title: "Daily Life",
    subtitle: "일상",
    description: "Routines, weekends, small plans",
    starterQuestion: "What do you usually do after work or school?",
  },
  {
    id: "travel",
    title: "Travel",
    subtitle: "여행",
    description: "Trips, places, schedules",
    starterQuestion: "What kind of place do you want to visit next, and why?",
  },
  {
    id: "food",
    title: "Food",
    subtitle: "음식",
    description: "Restaurants, cooking, favorite meals",
    starterQuestion: "What food do you like to eat when you need comfort?",
  },
  {
    id: "work",
    title: "Work",
    subtitle: "업무",
    description: "Meetings, tasks, collaboration",
    starterQuestion: "What kind of work task do you enjoy the most?",
  },
  {
    id: "hobbies",
    title: "Hobbies",
    subtitle: "취미",
    description: "Free time, interests, habits",
    starterQuestion: "What hobby helps you relax after a busy day?",
  },
  {
    id: "small-talk",
    title: "Small Talk",
    subtitle: "스몰토크",
    description: "Weather, plans, friendly questions",
    starterQuestion: "How has your week been so far?",
  },
];

const sharedFeedback: MockAnswerEvaluation[] = [
  {
    summaryKo:
      "의미가 잘 전달됐어요. 문장을 조금 더 구체적으로 만들면 대화가 더 자연스럽게 이어집니다.",
    tipKo: "이유를 한 문장 더 붙이면 답변이 풍부해져요.",
    correction: {
      before: "I like it because it is good.",
      after: "I like it because it helps me feel refreshed.",
      noteKo: "good 대신 상황을 설명하는 표현을 쓰면 더 자연스럽습니다.",
    },
    nextQuestion: "What is one thing you want to improve about that experience?",
  },
  {
    summaryKo:
      "답변의 흐름이 좋아요. 시제와 빈도 표현을 함께 쓰면 더 정확하게 들립니다.",
    tipKo: "usually, often, these days 같은 단어로 습관과 현재 상황을 구분해보세요.",
    correction: {
      before: "I do it in weekend.",
      after: "I usually do it on weekends.",
      noteKo: "weekend 앞에는 보통 on을 쓰고, 반복되는 주말은 weekends가 자연스럽습니다.",
    },
    nextQuestion: "Who do you usually talk to about this topic?",
  },
  {
    summaryKo:
      "핵심 생각이 분명해요. 연결어를 넣으면 문장 사이 관계가 더 잘 보입니다.",
    tipKo: "because, so, but 중 하나를 써서 이유나 반대되는 생각을 이어보세요.",
    correction: {
      before: "It is hard. I like it.",
      after: "It is hard, but I still enjoy it.",
      noteKo: "상반된 생각은 but으로 연결하면 훨씬 매끄럽습니다.",
    },
    nextQuestion: "Can you tell me about a recent moment related to it?",
  },
];

const topicFeedback: Record<string, MockAnswerEvaluation[]> = {
  "daily-life": [
    {
      summaryKo:
        "일상 행동을 잘 설명했어요. 시간 표현을 더하면 듣는 사람이 상황을 쉽게 떠올릴 수 있습니다.",
      tipKo: "after dinner, before bed, in the morning 같은 표현을 붙여보세요.",
      correction: {
        before: "I take a rest at home.",
        after: "I relax at home for a while.",
        noteKo: "take a rest도 가능하지만 일상 대화에서는 relax가 더 자연스럽게 들립니다.",
      },
      nextQuestion: "What part of your daily routine do you enjoy the most?",
    },
    ...sharedFeedback,
  ],
  travel: [
    {
      summaryKo:
        "가고 싶은 장소를 잘 말했어요. 이유를 감각적으로 설명하면 더 생생한 답변이 됩니다.",
      tipKo: "beautiful, peaceful, exciting 같은 형용사를 장소와 연결해보세요.",
      correction: {
        before: "I want to go there for see the view.",
        after: "I want to go there to see the view.",
        noteKo: "목적을 말할 때는 for 동사원형보다 to 동사원형이 자연스럽습니다.",
      },
      nextQuestion: "Do you prefer planning every detail or traveling freely?",
    },
    ...sharedFeedback,
  ],
  food: [
    {
      summaryKo:
        "좋아하는 음식을 분명하게 말했어요. 맛이나 분위기를 함께 말하면 더 자연스럽습니다.",
      tipKo: "It tastes..., It reminds me of..., I usually eat it when... 같은 틀을 써보세요.",
      correction: {
        before: "The taste is very delicious.",
        after: "It tastes really good.",
        noteKo: "delicious는 이미 강한 의미라 very delicious보다 really good이 일상적입니다.",
      },
      nextQuestion: "Is there a food you want to learn how to cook?",
    },
    ...sharedFeedback,
  ],
  work: [
    {
      summaryKo:
        "업무 상황을 이해하기 쉽게 말했어요. 역할과 결과를 함께 말하면 더 전문적으로 들립니다.",
      tipKo: "I am responsible for..., I helped..., We finished... 같은 표현을 활용해보세요.",
      correction: {
        before: "I joined to the meeting.",
        after: "I joined the meeting.",
        noteKo: "join은 목적어를 바로 받을 수 있어서 to가 필요하지 않습니다.",
      },
      nextQuestion: "What makes a meeting useful for you?",
    },
    ...sharedFeedback,
  ],
  hobbies: [
    {
      summaryKo:
        "취미를 말하는 방식이 자연스러워요. 시작한 계기를 덧붙이면 대화가 더 이어집니다.",
      tipKo: "I started it because..., I got into it when... 같은 표현이 좋아요.",
      correction: {
        before: "I play it for reduce stress.",
        after: "I do it to reduce stress.",
        noteKo: "운동이나 악기처럼 play가 맞는 경우도 있지만, 일반적인 취미는 do it이 안전합니다.",
      },
      nextQuestion: "How did you first become interested in that hobby?",
    },
    ...sharedFeedback,
  ],
  "small-talk": [
    {
      summaryKo:
        "가볍게 대화를 시작하기 좋은 답변이에요. 감정 표현을 하나 넣으면 더 친근하게 들립니다.",
      tipKo: "pretty good, a bit busy, not too bad 같은 짧은 표현을 써보세요.",
      correction: {
        before: "My week is so-so.",
        after: "My week has been pretty busy, but not bad.",
        noteKo: "has been을 쓰면 이번 주가 지금까지 어땠는지 자연스럽게 말할 수 있습니다.",
      },
      nextQuestion: "Do you have any plans for this weekend?",
    },
    ...sharedFeedback,
  ],
};

export function getMockAnswerEvaluation(
  topicId: string,
  turnIndex: number,
): MockAnswerEvaluation {
  const feedbackItems = topicFeedback[topicId] ?? sharedFeedback;
  return feedbackItems[turnIndex % feedbackItems.length];
}
