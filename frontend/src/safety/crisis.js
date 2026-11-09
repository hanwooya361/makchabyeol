// 위기 키워드 감지. 걱정 원문은 이 파일까지만 오고 브라우저 밖으로 나가지 않는다.
// 서버로 가는 건 "안내 카드가 떴다"는 사실뿐이다(T12).
//
// 오탐은 감수한다. 틀리게 떠도 다정한 카드 하나가 전부인데, 놓치면 사람을 놓친다(prd.md 리스크 표).
// 비교 전에 공백·특수문자를 지우므로("죽.고. 싶다" → "죽고싶다") 키워드도 그 형태로 적는다.
// 어미가 여러 가지라 "죽고싶"처럼 어간만 둔다.
const KEYWORDS = [
  "죽고싶",
  "죽고파",
  "죽을까",
  "죽을래",
  "죽어버리",
  "죽는게",
  "죽자",
  "자살",
  "목매",
  "목맬",
  "목멜",
  "뛰어내리",
  "투신",
  "번개탄",
  "수면제",
  "자해",
  "손목긋",
  "손목그어",
  "사라지고싶",
  "없어지고싶",
  "살기싫",
  "살고싶지않",
  "살아갈이유",
  "인생끝",
  "삶을끝",
  "유서",
  "극단적선택",
  "세상을떠",
  "suicide",
  "killmyself",
  "wanttodie",
  "endmylife",
];

// shortcut: 자모 분리("ㅈㅜㄱ고싶")와 초성("ㅈㄱㅅ")은 못 잡는다. 감지를 피하려는 입력이 아니라
// 진심으로 쓴 한 줄을 잡는 게 목적이라서다. 출시 전 키워드 검토(T16)에서 다시 본다.
function normalize(text) {
  return text.toLowerCase().replace(/[^0-9a-z가-힣]/g, "");
}

export function isCrisis(text) {
  const normalized = normalize(text);
  return KEYWORDS.some((keyword) => normalized.includes(keyword));
}
