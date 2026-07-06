import { NextResponse } from "next/server";
import { generateJsonWithAI } from "@/lib/server/ai";

type ExplainEasierRequest = {
  title?: unknown;
  description?: unknown;
  example?: unknown;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ExplainEasierRequest;
    const title = requiredString(body.title, "title");
    const description = requiredString(body.description, "description");
    const example = requiredString(body.example, "example");
    const result = await generateJsonWithAI({
      maxTokens: 1800,
      messages: [
        {
          role: "system",
          content:
            "You explain English grammar in context to Korean learners. Return JSON only.",
        },
        {
          role: "user",
          content: [
            "약 100단어 정도의 자연스러운 영어 문단을 만드세요.",
            "하나의 상황이나 짧은 이야기처럼 문장들이 자연스럽게 이어져야 합니다.",
            "해당 문법이 문단 안에서 문맥상 자연스럽게 사용되도록 하세요.",
            "해당 문법이 사용된 핵심 문장 하나만 paragraph 안에서 [[문장]] 형태로 감싸세요.",
            "[[ ]]로 감싼 문장은 문단의 중간쯤에 위치하면 좋습니다.",
            "paragraph_meaning에는 문단 전체의 자연스러운 한국어 해석만 작성하고 [[ ]] 마커는 넣지 마세요.",
            "explanation은 문법책처럼 규칙만 설명하지 마세요.",
            "explanation은 반드시 예시 문단의 상황과 앞뒤 맥락을 이용해 설명하세요.",
            "explanation은 3~5문장, 200~300자 정도로 작성하세요.",
            "explanation은 사용자가 30초 안에 읽을 수 있는 길이여야 합니다.",
            "explanation의 첫 문장은 문단이 어떤 상황인지 한 문장으로 설명하세요.",
            "그 다음, 그 상황에서 왜 이 문법이 사용되었는지 간단하게 설명하세요.",
            "일반적인 표현과 현재 문법을 사용했을 때의 느낌 차이를 한 문장 정도로 설명하세요.",
            "문법 규칙을 길게 설명하기보다 문맥을 이해하는 데 집중하세요.",
            "실제 영어를 읽는 사람이 '아, 그래서 여기서 이렇게 썼구나.'라고 빠르게 이해할 수 있게 작성하세요.",
            "초등학생도 이해할 수 있는 쉬운 한국어로 친절하게 설명하세요.",
            `Grammar title: ${title}`,
            `Description: ${description}`,
            `Example: ${example}`,
          ].join("\n"),
        },
      ],
      responseFormat: {
        name: "grammar_explain_easier",
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            paragraph: { type: "string" },
            paragraph_meaning: { type: "string" },
            explanation: { type: "string" },
          },
          required: ["paragraph", "paragraph_meaning", "explanation"],
        },
      },
    });

    if (!isExplainEasierResponse(result)) {
      throw new Error("AI response had an invalid shape.");
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Request failed." },
      { status: 400 },
    );
  }
}

function requiredString(value: unknown, fieldName: string) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${fieldName} is required.`);
  }

  return value.trim();
}

function isExplainEasierResponse(
  value: unknown,
): value is {
  paragraph: string;
  paragraph_meaning: string;
  explanation: string;
} {
  return (
    Boolean(value) &&
    typeof value === "object" &&
    typeof (value as { paragraph?: unknown }).paragraph === "string" &&
    typeof (value as { paragraph_meaning?: unknown }).paragraph_meaning ===
      "string" &&
    typeof (value as { explanation?: unknown }).explanation === "string"
  );
}
