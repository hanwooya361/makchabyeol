// 버스 시간표(T22.4). 서버 없이 기기 시계로 계산해서 모두가 같은 분에 같은 버스를 본다.
// 1970년부터 5분 배수 시각에 도착해 60초 서 있다가 출발한다. 한국 시간은 UTC+9(정시 차이)라
// "매시 0·5·10…분"이 그대로 맞는다.
// shortcut: 기기 시계가 틀리면 그 사람만 버스가 어긋나 보인다. 2단계(같이 있기)에서 서버 시각으로 보정
export const INTERVAL_MS = 5 * 60 * 1000;
export const DWELL_MS = 60 * 1000;
// 서고 1.5초 뒤 문이 열리고 떠나기 2초 전 닫힌다(3D 버스와 같은 값). 출발 10초 전부터 "곧 출발해요"
export const DOOR_OPEN_MS = 1500;
export const DOOR_CLOSE_BEFORE_MS = 2000;
const SOON_MS = 10 * 1000;

// 지금 버스가 어디쯤인지. arriveAt은 서 있으면 이번 도착 시각, 오는 중이면 다음 도착 시각
export function busAt(now) {
  const sinceArrival = now % INTERVAL_MS;
  const lastArrival = now - sinceArrival;
  if (sinceArrival < DWELL_MS) {
    return {
      phase: "stopped",
      arriveAt: lastArrival,
      minutes: 0,
      doorOpen: sinceArrival >= DOOR_OPEN_MS && sinceArrival < DWELL_MS - DOOR_CLOSE_BEFORE_MS,
      leavingSoon: sinceArrival >= DWELL_MS - SOON_MS,
    };
  }
  const next = lastArrival + INTERVAL_MS;
  // 4분 1초 남았으면 "5분"이 아니라 "다음 버스 5분"이 맞다: 올림
  return {
    phase: "coming",
    arriveAt: next,
    minutes: Math.ceil((next - now) / 60000),
    doorOpen: false,
    leavingSoon: false,
  };
}
