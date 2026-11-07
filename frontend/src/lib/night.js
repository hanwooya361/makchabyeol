// "오늘 밤"은 한국 시간 정오에 바뀐다. 11/7 12:00 ~ 11/8 11:59는 모두 "2026-11-07" 밤.
// 근거는 docs/tech-design.md 3장. 자정 기준으로 세면 23시의 별과 0시 10분의 별이 다른 날이 된다.
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const NOON_SHIFT_MS = 12 * 60 * 60 * 1000;

// 로컬 시간대 함수(getHours 등)를 쓰지 않는다. 해외에서 접속해도 한국 밤 날짜가 나와야 한다.
export function nightDate(now = new Date()) {
  const shifted = now.getTime() + KST_OFFSET_MS - NOON_SHIFT_MS;
  return new Date(shifted).toISOString().slice(0, 10);
}
