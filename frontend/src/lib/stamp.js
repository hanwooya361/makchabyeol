// 카드 찍은 밤을 기기에만 남긴다. 서버 기록은 T10.
// 사생활 보호 모드나 저장소 차단에서는 localStorage가 예외를 던진다. 저장이 막혀도
// 의식은 굴러가야 하므로 삼키고 넘어간다(그 경우 재방문 판정이 안 될 뿐, 아무것도 잃지 않음).
const KEY = "makchabyeol.lastTapNight";

export function readTapNight() {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function writeTapNight(night) {
  try {
    localStorage.setItem(KEY, night);
  } catch {
    // 저장소가 막힌 브라우저
  }
}
