export type KanaSetId = "hiragana" | "katakana";

export type KanaCard = {
  kana: string;
  romanization: string;
  exampleWord: string;
  exampleReading: string;
  exampleMeaning: string;
};

export type KanaSet = {
  id: KanaSetId;
  label: string;
  englishLabel: string;
  description: string;
  cards: KanaCard[];
};

const hiraganaCards: KanaCard[] = [
  { kana: "あ", romanization: "a", exampleWord: "あめ", exampleReading: "ame", exampleMeaning: "비" },
  { kana: "い", romanization: "i", exampleWord: "いぬ", exampleReading: "inu", exampleMeaning: "개" },
  { kana: "う", romanization: "u", exampleWord: "うみ", exampleReading: "umi", exampleMeaning: "바다" },
  { kana: "え", romanization: "e", exampleWord: "えき", exampleReading: "eki", exampleMeaning: "역" },
  { kana: "お", romanization: "o", exampleWord: "おに", exampleReading: "oni", exampleMeaning: "도깨비" },
  { kana: "か", romanization: "ka", exampleWord: "かさ", exampleReading: "kasa", exampleMeaning: "우산" },
  { kana: "き", romanization: "ki", exampleWord: "きつね", exampleReading: "kitsune", exampleMeaning: "여우" },
  { kana: "く", romanization: "ku", exampleWord: "くも", exampleReading: "kumo", exampleMeaning: "구름" },
  { kana: "け", romanization: "ke", exampleWord: "けさ", exampleReading: "kesa", exampleMeaning: "오늘 아침" },
  { kana: "こ", romanization: "ko", exampleWord: "こえ", exampleReading: "koe", exampleMeaning: "목소리" },
  { kana: "さ", romanization: "sa", exampleWord: "さくら", exampleReading: "sakura", exampleMeaning: "벚꽃" },
  { kana: "し", romanization: "shi", exampleWord: "しお", exampleReading: "shio", exampleMeaning: "소금" },
  { kana: "す", romanization: "su", exampleWord: "すし", exampleReading: "sushi", exampleMeaning: "초밥" },
  { kana: "せ", romanization: "se", exampleWord: "せみ", exampleReading: "semi", exampleMeaning: "매미" },
  { kana: "そ", romanization: "so", exampleWord: "そら", exampleReading: "sora", exampleMeaning: "하늘" },
  { kana: "た", romanization: "ta", exampleWord: "たこ", exampleReading: "tako", exampleMeaning: "문어" },
  { kana: "ち", romanization: "chi", exampleWord: "ちず", exampleReading: "chizu", exampleMeaning: "지도" },
  { kana: "つ", romanization: "tsu", exampleWord: "つき", exampleReading: "tsuki", exampleMeaning: "달" },
  { kana: "て", romanization: "te", exampleWord: "て", exampleReading: "te", exampleMeaning: "손" },
  { kana: "と", romanization: "to", exampleWord: "とり", exampleReading: "tori", exampleMeaning: "새" },
  { kana: "な", romanization: "na", exampleWord: "なつ", exampleReading: "natsu", exampleMeaning: "여름" },
  { kana: "に", romanization: "ni", exampleWord: "にく", exampleReading: "niku", exampleMeaning: "고기" },
  { kana: "ぬ", romanization: "nu", exampleWord: "ぬの", exampleReading: "nuno", exampleMeaning: "천" },
  { kana: "ね", romanization: "ne", exampleWord: "ねこ", exampleReading: "neko", exampleMeaning: "고양이" },
  { kana: "の", romanization: "no", exampleWord: "のり", exampleReading: "nori", exampleMeaning: "김" },
  { kana: "は", romanization: "ha", exampleWord: "はな", exampleReading: "hana", exampleMeaning: "꽃" },
  { kana: "ひ", romanization: "hi", exampleWord: "ひる", exampleReading: "hiru", exampleMeaning: "낮" },
  { kana: "ふ", romanization: "fu", exampleWord: "ふね", exampleReading: "fune", exampleMeaning: "배" },
  { kana: "へ", romanization: "he", exampleWord: "へや", exampleReading: "heya", exampleMeaning: "방" },
  { kana: "ほ", romanization: "ho", exampleWord: "ほし", exampleReading: "hoshi", exampleMeaning: "별" },
  { kana: "ま", romanization: "ma", exampleWord: "まど", exampleReading: "mado", exampleMeaning: "창문" },
  { kana: "み", romanization: "mi", exampleWord: "みみ", exampleReading: "mimi", exampleMeaning: "귀" },
  { kana: "む", romanization: "mu", exampleWord: "むし", exampleReading: "mushi", exampleMeaning: "벌레" },
  { kana: "め", romanization: "me", exampleWord: "めがね", exampleReading: "megane", exampleMeaning: "안경" },
  { kana: "も", romanization: "mo", exampleWord: "もも", exampleReading: "momo", exampleMeaning: "복숭아" },
  { kana: "や", romanization: "ya", exampleWord: "やま", exampleReading: "yama", exampleMeaning: "산" },
  { kana: "ゆ", romanization: "yu", exampleWord: "ゆき", exampleReading: "yuki", exampleMeaning: "눈" },
  { kana: "よ", romanization: "yo", exampleWord: "よる", exampleReading: "yoru", exampleMeaning: "밤" },
  { kana: "ら", romanization: "ra", exampleWord: "らいおん", exampleReading: "raion", exampleMeaning: "사자" },
  { kana: "り", romanization: "ri", exampleWord: "りす", exampleReading: "risu", exampleMeaning: "다람쥐" },
  { kana: "る", romanization: "ru", exampleWord: "るす", exampleReading: "rusu", exampleMeaning: "부재중" },
  { kana: "れ", romanization: "re", exampleWord: "れきし", exampleReading: "rekishi", exampleMeaning: "역사" },
  { kana: "ろ", romanization: "ro", exampleWord: "ろく", exampleReading: "roku", exampleMeaning: "여섯" },
  { kana: "わ", romanization: "wa", exampleWord: "わに", exampleReading: "wani", exampleMeaning: "악어" },
  { kana: "を", romanization: "wo", exampleWord: "ほんを", exampleReading: "hon o", exampleMeaning: "책을" },
  { kana: "ん", romanization: "n", exampleWord: "ほん", exampleReading: "hon", exampleMeaning: "책" },
];

const katakanaCards: KanaCard[] = [
  { kana: "ア", romanization: "a", exampleWord: "アメ", exampleReading: "ame", exampleMeaning: "사탕" },
  { kana: "イ", romanization: "i", exampleWord: "イカ", exampleReading: "ika", exampleMeaning: "오징어" },
  { kana: "ウ", romanization: "u", exampleWord: "ウニ", exampleReading: "uni", exampleMeaning: "성게" },
  { kana: "エ", romanization: "e", exampleWord: "エアコン", exampleReading: "eakon", exampleMeaning: "에어컨" },
  { kana: "オ", romanization: "o", exampleWord: "オレンジ", exampleReading: "orenji", exampleMeaning: "오렌지" },
  { kana: "カ", romanization: "ka", exampleWord: "カメラ", exampleReading: "kamera", exampleMeaning: "카메라" },
  { kana: "キ", romanization: "ki", exampleWord: "キウイ", exampleReading: "kiui", exampleMeaning: "키위" },
  { kana: "ク", romanization: "ku", exampleWord: "クラス", exampleReading: "kurasu", exampleMeaning: "반, 수업" },
  { kana: "ケ", romanization: "ke", exampleWord: "ケーキ", exampleReading: "keeki", exampleMeaning: "케이크" },
  { kana: "コ", romanization: "ko", exampleWord: "コーヒー", exampleReading: "koohii", exampleMeaning: "커피" },
  { kana: "サ", romanization: "sa", exampleWord: "サラダ", exampleReading: "sarada", exampleMeaning: "샐러드" },
  { kana: "シ", romanization: "shi", exampleWord: "シャツ", exampleReading: "shatsu", exampleMeaning: "셔츠" },
  { kana: "ス", romanization: "su", exampleWord: "スープ", exampleReading: "suupu", exampleMeaning: "수프" },
  { kana: "セ", romanization: "se", exampleWord: "セーター", exampleReading: "seetaa", exampleMeaning: "스웨터" },
  { kana: "ソ", romanization: "so", exampleWord: "ソース", exampleReading: "soosu", exampleMeaning: "소스" },
  { kana: "タ", romanization: "ta", exampleWord: "タクシー", exampleReading: "takushii", exampleMeaning: "택시" },
  { kana: "チ", romanization: "chi", exampleWord: "チーズ", exampleReading: "chiizu", exampleMeaning: "치즈" },
  { kana: "ツ", romanization: "tsu", exampleWord: "ツアー", exampleReading: "tsuaa", exampleMeaning: "투어" },
  { kana: "テ", romanization: "te", exampleWord: "テレビ", exampleReading: "terebi", exampleMeaning: "텔레비전" },
  { kana: "ト", romanization: "to", exampleWord: "トマト", exampleReading: "tomato", exampleMeaning: "토마토" },
  { kana: "ナ", romanization: "na", exampleWord: "ナイフ", exampleReading: "naifu", exampleMeaning: "나이프" },
  { kana: "ニ", romanization: "ni", exampleWord: "ニコニコ", exampleReading: "nikoniko", exampleMeaning: "방긋방긋" },
  { kana: "ヌ", romanization: "nu", exampleWord: "ヌードル", exampleReading: "nuudoru", exampleMeaning: "누들" },
  { kana: "ネ", romanization: "ne", exampleWord: "ネクタイ", exampleReading: "nekutai", exampleMeaning: "넥타이" },
  { kana: "ノ", romanization: "no", exampleWord: "ノート", exampleReading: "nooto", exampleMeaning: "노트" },
  { kana: "ハ", romanization: "ha", exampleWord: "ハム", exampleReading: "hamu", exampleMeaning: "햄" },
  { kana: "ヒ", romanization: "hi", exampleWord: "ヒーロー", exampleReading: "hiiroo", exampleMeaning: "영웅" },
  { kana: "フ", romanization: "fu", exampleWord: "フルーツ", exampleReading: "furuutsu", exampleMeaning: "과일" },
  { kana: "ヘ", romanization: "he", exampleWord: "ヘリ", exampleReading: "heri", exampleMeaning: "헬리콥터" },
  { kana: "ホ", romanization: "ho", exampleWord: "ホテル", exampleReading: "hoteru", exampleMeaning: "호텔" },
  { kana: "マ", romanization: "ma", exampleWord: "マスク", exampleReading: "masuku", exampleMeaning: "마스크" },
  { kana: "ミ", romanization: "mi", exampleWord: "ミルク", exampleReading: "miruku", exampleMeaning: "우유" },
  { kana: "ム", romanization: "mu", exampleWord: "ムービー", exampleReading: "muubii", exampleMeaning: "영화" },
  { kana: "メ", romanization: "me", exampleWord: "メニュー", exampleReading: "menyuu", exampleMeaning: "메뉴" },
  { kana: "モ", romanization: "mo", exampleWord: "モデル", exampleReading: "moderu", exampleMeaning: "모델" },
  { kana: "ヤ", romanization: "ya", exampleWord: "ヤクルト", exampleReading: "yakuruto", exampleMeaning: "야쿠르트" },
  { kana: "ユ", romanization: "yu", exampleWord: "ユニフォーム", exampleReading: "yunifoomu", exampleMeaning: "유니폼" },
  { kana: "ヨ", romanization: "yo", exampleWord: "ヨガ", exampleReading: "yoga", exampleMeaning: "요가" },
  { kana: "ラ", romanization: "ra", exampleWord: "ラジオ", exampleReading: "rajio", exampleMeaning: "라디오" },
  { kana: "リ", romanization: "ri", exampleWord: "リモコン", exampleReading: "rimokon", exampleMeaning: "리모컨" },
  { kana: "ル", romanization: "ru", exampleWord: "ルール", exampleReading: "ruuru", exampleMeaning: "규칙" },
  { kana: "レ", romanization: "re", exampleWord: "レモン", exampleReading: "remon", exampleMeaning: "레몬" },
  { kana: "ロ", romanization: "ro", exampleWord: "ロボット", exampleReading: "robotto", exampleMeaning: "로봇" },
  { kana: "ワ", romanization: "wa", exampleWord: "ワイン", exampleReading: "wain", exampleMeaning: "와인" },
  { kana: "ヲ", romanization: "wo", exampleWord: "ヲタク", exampleReading: "otaku", exampleMeaning: "오타쿠" },
  { kana: "ン", romanization: "n", exampleWord: "パン", exampleReading: "pan", exampleMeaning: "빵" },
];

export const kanaSets: KanaSet[] = [
  {
    id: "hiragana",
    label: "히라가나",
    englishLabel: "Hiragana",
    description: "일본어 기본 음절 문자입니다.",
    cards: hiraganaCards,
  },
  {
    id: "katakana",
    label: "카타카나",
    englishLabel: "Katakana",
    description: "외래어와 이름에 자주 쓰이는 문자입니다.",
    cards: katakanaCards,
  },
];
