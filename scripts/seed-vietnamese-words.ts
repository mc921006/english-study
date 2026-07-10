import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type VietnameseWordLevel = "common";
type VietnameseWordLanguage = "vi";

type VietnameseSeedWord = {
  language: VietnameseWordLanguage;
  level: VietnameseWordLevel;
  word: string;
  meaning: string;
  pronunciation: string;
  example: string;
  example_meaning: string;
  part_of_speech: string;
};

type WordInsert = {
  word: string;
  meaning: string;
  example: string;
  example_meaning: string;
  pronunciation: string;
  part_of_speech: string;
  level: VietnameseWordLevel;
  language: VietnameseWordLanguage;
};

type SeedDatabase = {
  public: {
    Tables: {
      words: {
        Row: WordInsert;
        Insert: WordInsert;
        Update: Partial<WordInsert>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

type WordsSupabaseClient = SupabaseClient<SeedDatabase>;

const VIETNAMESE_WORD_LEVEL: VietnameseWordLevel = "common";
const VIETNAMESE_WORD_LANGUAGE: VietnameseWordLanguage = "vi";

const VIETNAMESE_COMMON_WORDS: VietnameseSeedWord[] = [
  {
    language: "vi",
    level: "common",
    word: "xin chào",
    meaning: "안녕하세요",
    pronunciation: "씬 짜오",
    example: "Xin chào, tôi là Min.",
    example_meaning: "안녕하세요, 저는 민입니다.",
    part_of_speech: "interjection",
  },
  {
    language: "vi",
    level: "common",
    word: "cảm ơn",
    meaning: "감사합니다",
    pronunciation: "깜 언",
    example: "Cảm ơn bạn rất nhiều.",
    example_meaning: "정말 감사합니다.",
    part_of_speech: "interjection",
  },
  {
    language: "vi",
    level: "common",
    word: "xin lỗi",
    meaning: "미안합니다",
    pronunciation: "씬 로이",
    example: "Xin lỗi, tôi đến muộn.",
    example_meaning: "미안합니다, 제가 늦었습니다.",
    part_of_speech: "interjection",
  },
  {
    language: "vi",
    level: "common",
    word: "vâng",
    meaning: "네",
    pronunciation: "벙",
    example: "Vâng, tôi hiểu.",
    example_meaning: "네, 이해했습니다.",
    part_of_speech: "interjection",
  },
  {
    language: "vi",
    level: "common",
    word: "không",
    meaning: "아니요, 아니다",
    pronunciation: "콩",
    example: "Tôi không uống cà phê.",
    example_meaning: "저는 커피를 마시지 않습니다.",
    part_of_speech: "adverb",
  },
  {
    language: "vi",
    level: "common",
    word: "có",
    meaning: "있다, 그렇다",
    pronunciation: "꺼",
    example: "Tôi có một câu hỏi.",
    example_meaning: "저는 질문이 하나 있습니다.",
    part_of_speech: "verb",
  },
  {
    language: "vi",
    level: "common",
    word: "tôi",
    meaning: "나, 저",
    pronunciation: "또이",
    example: "Tôi học tiếng Việt.",
    example_meaning: "저는 베트남어를 공부합니다.",
    part_of_speech: "pronoun",
  },
  {
    language: "vi",
    level: "common",
    word: "bạn",
    meaning: "당신, 친구",
    pronunciation: "반",
    example: "Bạn sống ở đâu?",
    example_meaning: "당신은 어디에 삽니까?",
    part_of_speech: "pronoun",
  },
  {
    language: "vi",
    level: "common",
    word: "anh",
    meaning: "형, 오빠, 남성 호칭",
    pronunciation: "아인",
    example: "Anh có khỏe không?",
    example_meaning: "잘 지내세요?",
    part_of_speech: "pronoun",
  },
  {
    language: "vi",
    level: "common",
    word: "chị",
    meaning: "누나, 언니, 여성 호칭",
    pronunciation: "찌",
    example: "Chị làm việc ở công ty.",
    example_meaning: "그녀는 회사에서 일합니다.",
    part_of_speech: "pronoun",
  },
  {
    language: "vi",
    level: "common",
    word: "em",
    meaning: "동생, 어린 사람 호칭",
    pronunciation: "엠",
    example: "Em thích nghe nhạc.",
    example_meaning: "저는 음악 듣는 것을 좋아합니다.",
    part_of_speech: "pronoun",
  },
  {
    language: "vi",
    level: "common",
    word: "chúng tôi",
    meaning: "우리",
    pronunciation: "쭝 또이",
    example: "Chúng tôi đi học mỗi ngày.",
    example_meaning: "우리는 매일 학교에 갑니다.",
    part_of_speech: "pronoun",
  },
  {
    language: "vi",
    level: "common",
    word: "đi",
    meaning: "가다",
    pronunciation: "디",
    example: "Tôi đi làm bằng xe buýt.",
    example_meaning: "저는 버스로 출근합니다.",
    part_of_speech: "verb",
  },
  {
    language: "vi",
    level: "common",
    word: "đến",
    meaning: "오다, 도착하다",
    pronunciation: "덴",
    example: "Bạn đến Việt Nam khi nào?",
    example_meaning: "당신은 언제 베트남에 왔나요?",
    part_of_speech: "verb",
  },
  {
    language: "vi",
    level: "common",
    word: "ăn",
    meaning: "먹다",
    pronunciation: "안",
    example: "Tôi ăn cơm với gia đình.",
    example_meaning: "저는 가족과 밥을 먹습니다.",
    part_of_speech: "verb",
  },
  {
    language: "vi",
    level: "common",
    word: "uống",
    meaning: "마시다",
    pronunciation: "우옹",
    example: "Tôi uống nước mỗi sáng.",
    example_meaning: "저는 매일 아침 물을 마십니다.",
    part_of_speech: "verb",
  },
  {
    language: "vi",
    level: "common",
    word: "ngủ",
    meaning: "자다",
    pronunciation: "응우",
    example: "Tôi ngủ lúc mười một giờ.",
    example_meaning: "저는 11시에 잡니다.",
    part_of_speech: "verb",
  },
  {
    language: "vi",
    level: "common",
    word: "học",
    meaning: "공부하다, 배우다",
    pronunciation: "혹",
    example: "Bạn học tiếng Việt ở đâu?",
    example_meaning: "당신은 어디에서 베트남어를 공부하나요?",
    part_of_speech: "verb",
  },
  {
    language: "vi",
    level: "common",
    word: "làm",
    meaning: "하다, 일하다",
    pronunciation: "람",
    example: "Tôi làm việc ở nhà.",
    example_meaning: "저는 집에서 일합니다.",
    part_of_speech: "verb",
  },
  {
    language: "vi",
    level: "common",
    word: "mua",
    meaning: "사다",
    pronunciation: "무아",
    example: "Tôi muốn mua cà phê.",
    example_meaning: "저는 커피를 사고 싶습니다.",
    part_of_speech: "verb",
  },
  {
    language: "vi",
    level: "common",
    word: "bán",
    meaning: "팔다",
    pronunciation: "반",
    example: "Cửa hàng này bán bánh mì.",
    example_meaning: "이 가게는 반미를 팝니다.",
    part_of_speech: "verb",
  },
  {
    language: "vi",
    level: "common",
    word: "nói",
    meaning: "말하다",
    pronunciation: "노이",
    example: "Tôi nói tiếng Việt một chút.",
    example_meaning: "저는 베트남어를 조금 말합니다.",
    part_of_speech: "verb",
  },
  {
    language: "vi",
    level: "common",
    word: "nghe",
    meaning: "듣다",
    pronunciation: "응에",
    example: "Tôi nghe nhạc Việt Nam.",
    example_meaning: "저는 베트남 음악을 듣습니다.",
    part_of_speech: "verb",
  },
  {
    language: "vi",
    level: "common",
    word: "đọc",
    meaning: "읽다",
    pronunciation: "독",
    example: "Cô ấy đọc sách buổi tối.",
    example_meaning: "그녀는 저녁에 책을 읽습니다.",
    part_of_speech: "verb",
  },
  {
    language: "vi",
    level: "common",
    word: "viết",
    meaning: "쓰다",
    pronunciation: "비엣",
    example: "Tôi viết tên của tôi.",
    example_meaning: "저는 제 이름을 씁니다.",
    part_of_speech: "verb",
  },
  {
    language: "vi",
    level: "common",
    word: "thích",
    meaning: "좋아하다",
    pronunciation: "틱",
    example: "Tôi thích món ăn Việt Nam.",
    example_meaning: "저는 베트남 음식을 좋아합니다.",
    part_of_speech: "verb",
  },
  {
    language: "vi",
    level: "common",
    word: "muốn",
    meaning: "원하다",
    pronunciation: "무온",
    example: "Bạn muốn uống gì?",
    example_meaning: "무엇을 마시고 싶나요?",
    part_of_speech: "verb",
  },
  {
    language: "vi",
    level: "common",
    word: "cần",
    meaning: "필요하다",
    pronunciation: "껀",
    example: "Tôi cần một vé.",
    example_meaning: "저는 표 한 장이 필요합니다.",
    part_of_speech: "verb",
  },
  {
    language: "vi",
    level: "common",
    word: "biết",
    meaning: "알다",
    pronunciation: "비엣",
    example: "Tôi biết đường này.",
    example_meaning: "저는 이 길을 압니다.",
    part_of_speech: "verb",
  },
  {
    language: "vi",
    level: "common",
    word: "hiểu",
    meaning: "이해하다",
    pronunciation: "히에우",
    example: "Tôi hiểu câu này.",
    example_meaning: "저는 이 문장을 이해합니다.",
    part_of_speech: "verb",
  },
  {
    language: "vi",
    level: "common",
    word: "nhà",
    meaning: "집",
    pronunciation: "냐",
    example: "Nhà tôi ở gần đây.",
    example_meaning: "제 집은 여기 근처에 있습니다.",
    part_of_speech: "noun",
  },
  {
    language: "vi",
    level: "common",
    word: "trường học",
    meaning: "학교",
    pronunciation: "쯔엉 혹",
    example: "Trường học mở cửa lúc tám giờ.",
    example_meaning: "학교는 8시에 문을 엽니다.",
    part_of_speech: "noun",
  },
  {
    language: "vi",
    level: "common",
    word: "công ty",
    meaning: "회사",
    pronunciation: "꽁 띠",
    example: "Công ty của tôi ở Hà Nội.",
    example_meaning: "제 회사는 하노이에 있습니다.",
    part_of_speech: "noun",
  },
  {
    language: "vi",
    level: "common",
    word: "chợ",
    meaning: "시장",
    pronunciation: "쩌",
    example: "Tôi đi chợ vào buổi sáng.",
    example_meaning: "저는 아침에 시장에 갑니다.",
    part_of_speech: "noun",
  },
  {
    language: "vi",
    level: "common",
    word: "nhà hàng",
    meaning: "식당",
    pronunciation: "냐 항",
    example: "Nhà hàng này rất ngon.",
    example_meaning: "이 식당은 매우 맛있습니다.",
    part_of_speech: "noun",
  },
  {
    language: "vi",
    level: "common",
    word: "khách sạn",
    meaning: "호텔",
    pronunciation: "칵 산",
    example: "Khách sạn ở gần sân bay.",
    example_meaning: "호텔은 공항 근처에 있습니다.",
    part_of_speech: "noun",
  },
  {
    language: "vi",
    level: "common",
    word: "nước",
    meaning: "물, 나라",
    pronunciation: "느억",
    example: "Tôi uống nước lạnh.",
    example_meaning: "저는 찬물을 마십니다.",
    part_of_speech: "noun",
  },
  {
    language: "vi",
    level: "common",
    word: "cơm",
    meaning: "밥",
    pronunciation: "껌",
    example: "Tôi ăn cơm trưa lúc mười hai giờ.",
    example_meaning: "저는 12시에 점심밥을 먹습니다.",
    part_of_speech: "noun",
  },
  {
    language: "vi",
    level: "common",
    word: "cà phê",
    meaning: "커피",
    pronunciation: "까 페",
    example: "Cà phê Việt Nam rất nổi tiếng.",
    example_meaning: "베트남 커피는 매우 유명합니다.",
    part_of_speech: "noun",
  },
  {
    language: "vi",
    level: "common",
    word: "trà",
    meaning: "차",
    pronunciation: "짜",
    example: "Bạn muốn uống trà không?",
    example_meaning: "차를 마시고 싶나요?",
    part_of_speech: "noun",
  },
  {
    language: "vi",
    level: "common",
    word: "tiền",
    meaning: "돈",
    pronunciation: "띠엔",
    example: "Tôi cần đổi tiền.",
    example_meaning: "저는 환전이 필요합니다.",
    part_of_speech: "noun",
  },
  {
    language: "vi",
    level: "common",
    word: "thời gian",
    meaning: "시간",
    pronunciation: "터이 지안",
    example: "Tôi không có nhiều thời gian.",
    example_meaning: "저는 시간이 많지 않습니다.",
    part_of_speech: "noun",
  },
  {
    language: "vi",
    level: "common",
    word: "hôm nay",
    meaning: "오늘",
    pronunciation: "홈 나이",
    example: "Hôm nay trời đẹp.",
    example_meaning: "오늘 날씨가 좋습니다.",
    part_of_speech: "adverb",
  },
  {
    language: "vi",
    level: "common",
    word: "ngày mai",
    meaning: "내일",
    pronunciation: "응아이 마이",
    example: "Ngày mai tôi đi Đà Nẵng.",
    example_meaning: "내일 저는 다낭에 갑니다.",
    part_of_speech: "adverb",
  },
  {
    language: "vi",
    level: "common",
    word: "hôm qua",
    meaning: "어제",
    pronunciation: "홈 꽈",
    example: "Hôm qua tôi gặp bạn.",
    example_meaning: "어제 저는 친구를 만났습니다.",
    part_of_speech: "adverb",
  },
  {
    language: "vi",
    level: "common",
    word: "bây giờ",
    meaning: "지금",
    pronunciation: "버이 저",
    example: "Bây giờ tôi đang học.",
    example_meaning: "지금 저는 공부하고 있습니다.",
    part_of_speech: "adverb",
  },
  {
    language: "vi",
    level: "common",
    word: "buổi sáng",
    meaning: "아침",
    pronunciation: "부오이 상",
    example: "Buổi sáng tôi uống cà phê.",
    example_meaning: "아침에 저는 커피를 마십니다.",
    part_of_speech: "noun",
  },
  {
    language: "vi",
    level: "common",
    word: "buổi tối",
    meaning: "저녁, 밤",
    pronunciation: "부오이 또이",
    example: "Buổi tối tôi đọc sách.",
    example_meaning: "저녁에 저는 책을 읽습니다.",
    part_of_speech: "noun",
  },
  {
    language: "vi",
    level: "common",
    word: "ở",
    meaning: "~에 있다, 살다",
    pronunciation: "어",
    example: "Tôi ở Seoul.",
    example_meaning: "저는 서울에 삽니다.",
    part_of_speech: "preposition",
  },
  {
    language: "vi",
    level: "common",
    word: "trong",
    meaning: "~안에",
    pronunciation: "쫑",
    example: "Sách ở trong túi.",
    example_meaning: "책은 가방 안에 있습니다.",
    part_of_speech: "preposition",
  },
  {
    language: "vi",
    level: "common",
    word: "với",
    meaning: "~와 함께",
    pronunciation: "버이",
    example: "Tôi đi ăn với bạn.",
    example_meaning: "저는 친구와 밥을 먹으러 갑니다.",
    part_of_speech: "preposition",
  },
  {
    language: "vi",
    level: "common",
    word: "và",
    meaning: "그리고",
    pronunciation: "바",
    example: "Tôi thích cà phê và trà.",
    example_meaning: "저는 커피와 차를 좋아합니다.",
    part_of_speech: "conjunction",
  },
  {
    language: "vi",
    level: "common",
    word: "nhưng",
    meaning: "하지만",
    pronunciation: "능",
    example: "Tôi muốn đi nhưng tôi bận.",
    example_meaning: "저는 가고 싶지만 바쁩니다.",
    part_of_speech: "conjunction",
  },
  {
    language: "vi",
    level: "common",
    word: "rất",
    meaning: "매우",
    pronunciation: "젓",
    example: "Món này rất ngon.",
    example_meaning: "이 음식은 매우 맛있습니다.",
    part_of_speech: "adverb",
  },
  {
    language: "vi",
    level: "common",
    word: "đẹp",
    meaning: "아름답다, 예쁘다",
    pronunciation: "뎁",
    example: "Thành phố này rất đẹp.",
    example_meaning: "이 도시는 매우 아름답습니다.",
    part_of_speech: "adjective",
  },
  {
    language: "vi",
    level: "common",
    word: "ngon",
    meaning: "맛있다",
    pronunciation: "응온",
    example: "Phở ở đây rất ngon.",
    example_meaning: "여기 쌀국수는 매우 맛있습니다.",
    part_of_speech: "adjective",
  },
  {
    language: "vi",
    level: "common",
    word: "tốt",
    meaning: "좋다",
    pronunciation: "똣",
    example: "Dịch vụ ở đây tốt.",
    example_meaning: "여기 서비스는 좋습니다.",
    part_of_speech: "adjective",
  },
  {
    language: "vi",
    level: "common",
    word: "rẻ",
    meaning: "싸다",
    pronunciation: "제",
    example: "Món này rẻ và ngon.",
    example_meaning: "이 음식은 싸고 맛있습니다.",
    part_of_speech: "adjective",
  },
  {
    language: "vi",
    level: "common",
    word: "đắt",
    meaning: "비싸다",
    pronunciation: "닷",
    example: "Khách sạn này hơi đắt.",
    example_meaning: "이 호텔은 조금 비쌉니다.",
    part_of_speech: "adjective",
  },
  {
    language: "vi",
    level: "common",
    word: "lớn",
    meaning: "크다",
    pronunciation: "런",
    example: "Nhà của anh ấy rất lớn.",
    example_meaning: "그의 집은 매우 큽니다.",
    part_of_speech: "adjective",
  },
  {
    language: "vi",
    level: "common",
    word: "nhỏ",
    meaning: "작다",
    pronunciation: "녀",
    example: "Tôi muốn một phòng nhỏ.",
    example_meaning: "저는 작은 방을 원합니다.",
    part_of_speech: "adjective",
  },
  {
    language: "vi",
    level: "common",
    word: "nóng",
    meaning: "덥다, 뜨겁다",
    pronunciation: "농",
    example: "Hôm nay trời nóng.",
    example_meaning: "오늘 날씨가 덥습니다.",
    part_of_speech: "adjective",
  },
  {
    language: "vi",
    level: "common",
    word: "lạnh",
    meaning: "춥다, 차갑다",
    pronunciation: "라잉",
    example: "Tôi muốn nước lạnh.",
    example_meaning: "저는 찬물을 원합니다.",
    part_of_speech: "adjective",
  },
  {
    language: "vi",
    level: "common",
    word: "khỏe",
    meaning: "건강하다, 잘 지내다",
    pronunciation: "쾌",
    example: "Bạn có khỏe không?",
    example_meaning: "잘 지내세요?",
    part_of_speech: "adjective",
  },
  {
    language: "vi",
    level: "common",
    word: "gia đình",
    meaning: "가족",
    pronunciation: "자 딩",
    example: "Gia đình tôi sống ở Busan.",
    example_meaning: "제 가족은 부산에 삽니다.",
    part_of_speech: "noun",
  },
  {
    language: "vi",
    level: "common",
    word: "bạn bè",
    meaning: "친구들",
    pronunciation: "반 베",
    example: "Tôi gặp bạn bè vào cuối tuần.",
    example_meaning: "저는 주말에 친구들을 만납니다.",
    part_of_speech: "noun",
  },
  {
    language: "vi",
    level: "common",
    word: "đường",
    meaning: "길, 설탕",
    pronunciation: "드엉",
    example: "Đường này đi đến chợ.",
    example_meaning: "이 길은 시장으로 갑니다.",
    part_of_speech: "noun",
  },
  {
    language: "vi",
    level: "common",
    word: "xe buýt",
    meaning: "버스",
    pronunciation: "쎄 부잇",
    example: "Tôi đi xe buýt đến công ty.",
    example_meaning: "저는 버스를 타고 회사에 갑니다.",
    part_of_speech: "noun",
  },
  {
    language: "vi",
    level: "common",
    word: "sân bay",
    meaning: "공항",
    pronunciation: "선 바이",
    example: "Sân bay ở xa trung tâm.",
    example_meaning: "공항은 중심가에서 멉니다.",
    part_of_speech: "noun",
  },
  {
    language: "vi",
    level: "common",
    word: "bao nhiêu",
    meaning: "얼마, 얼마나",
    pronunciation: "바오 니에우",
    example: "Cái này bao nhiêu tiền?",
    example_meaning: "이것은 얼마인가요?",
    part_of_speech: "adverb",
  },
  {
    language: "vi",
    level: "common",
    word: "ở đâu",
    meaning: "어디에",
    pronunciation: "어 더우",
    example: "Nhà vệ sinh ở đâu?",
    example_meaning: "화장실은 어디에 있나요?",
    part_of_speech: "adverb",
  },
  {
    language: "vi",
    level: "common",
    word: "khi nào",
    meaning: "언제",
    pronunciation: "키 나오",
    example: "Khi nào bạn đi du lịch?",
    example_meaning: "당신은 언제 여행을 가나요?",
    part_of_speech: "adverb",
  },
];

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

async function main() {
  loadEnvLocal();

  const supabaseUrl = getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL");
  const supabaseAnonKey = getRequiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  const supabase: WordsSupabaseClient = createClient<SeedDatabase>(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: { persistSession: false },
    },
  );

  const existingWords = await fetchExistingVietnameseWords(supabase);
  const seedWords = getUniqueSeedWords(VIETNAMESE_COMMON_WORDS);
  const wordsToInsert = seedWords
    .filter((word) => !existingWords.has(normalizeWord(word.word)))
    .map(toWordInsert);

  if (wordsToInsert.length === 0) {
    console.log("No new Vietnamese words to insert.");
    return;
  }

  const insertedWords = await insertWords(supabase, wordsToInsert);

  console.log(
    [
      `Done. Inserted ${insertedWords.length} Vietnamese words.`,
      `Skipped ${seedWords.length - wordsToInsert.length} duplicates.`,
      `language=${VIETNAMESE_WORD_LANGUAGE}`,
      `level=${VIETNAMESE_WORD_LEVEL}`,
    ].join(" "),
  );
}

async function fetchExistingVietnameseWords(supabase: WordsSupabaseClient) {
  const words = new Set<string>();
  const pageSize = 1000;
  let from = 0;

  while (true) {
    const to = from + pageSize - 1;
    const { data, error } = await supabase
      .from("words")
      .select("word")
      .eq("language", VIETNAMESE_WORD_LANGUAGE)
      .eq("level", VIETNAMESE_WORD_LEVEL)
      .range(from, to);

    if (error) {
      throw new Error(`Failed to fetch existing words: ${error.message}`);
    }

    for (const row of data ?? []) {
      words.add(normalizeWord(String(row.word)));
    }

    if (!data || data.length < pageSize) {
      break;
    }

    from += pageSize;
  }

  return words;
}

function getUniqueSeedWords(words: VietnameseSeedWord[]) {
  const seen = new Set<string>();

  return words.filter((word) => {
    const normalizedWord = normalizeWord(word.word);
    if (seen.has(normalizedWord)) {
      return false;
    }

    seen.add(normalizedWord);
    return true;
  });
}

function toWordInsert(word: VietnameseSeedWord): WordInsert {
  return {
    word: word.word,
    meaning: word.meaning,
    example: word.example,
    example_meaning: word.example_meaning,
    pronunciation: word.pronunciation,
    part_of_speech: word.part_of_speech,
    level: word.level,
    language: word.language,
  };
}

async function insertWords(
  supabase: WordsSupabaseClient,
  words: WordInsert[],
) {
  const { data, error } = await supabase
    .from("words")
    .insert(words)
    .select("word");

  if (error) {
    throw new Error(`Failed to insert Vietnamese words: ${error.message}`);
  }

  return data ?? [];
}

function getRequiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required. Add it to .env.local.`);
  }

  return value;
}

function loadEnvLocal() {
  const envPath = resolve(process.cwd(), ".env.local");
  if (!existsSync(envPath)) {
    return;
  }

  const envFile = readFileSync(envPath, "utf8");
  for (const line of envFile.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const match = trimmed.match(/^([\w.-]+)\s*=\s*(.*)$/);
    if (!match) {
      continue;
    }

    const [, key, rawValue] = match;
    if (process.env[key] !== undefined) {
      continue;
    }

    process.env[key] = stripEnvValue(rawValue);
  }
}

function stripEnvValue(value: string) {
  const withoutComment = value.replace(/\s+#.*$/, "").trim();
  const quote = withoutComment[0];

  if (
    (quote === "'" || quote === '"') &&
    withoutComment[withoutComment.length - 1] === quote
  ) {
    return withoutComment.slice(1, -1);
  }

  return withoutComment;
}

function normalizeWord(word: string) {
  return word
    .normalize("NFC")
    .trim()
    .replace(/\s+/g, " ")
    .toLocaleLowerCase("vi-VN");
}
