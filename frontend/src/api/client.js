// 서버로 가는 건 익명 ID와 "별을 띄웠다"는 사실뿐이다. 걱정 원문은 이 파일을 지나가지 않는다.
// 의식은 서버를 기다리지 않는다(Render 무료 서버는 잠들어 있을 수 있음). 실패하면 조용히 null.
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";
// Render 무료 서버는 깨는 데 50초쯤 걸린다. 화면은 응답을 기다리지 않으니 넉넉히 기다려야
// 잠든 서버를 만난 첫 방문자의 별·도장도 저장된다(T16: 15초였을 땐 전부 버려짐).
// shortcut: 서버가 깨기 전에 탭을 닫으면 그 요청은 사라진다. 누락이 눈에 띄면 keepalive나 재전송 큐로
const TIMEOUT_MS = 70000;

async function request(path, body) {
  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      method: body ? "POST" : "GET",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    return response.ok ? await response.json() : null;
  } catch {
    // shortcut: 재시도 없음. 잠든 서버가 깨는 데 1분 가까이 걸려서 한 번 더 걸어도 대개 같이 실패하고,
    // 실패해도 사용자 화면에는 별이 뜬다. 별 개수가 눈에 띄게 비면 그때 재시도를 붙인다
    return null;
  }
}

export function postStar(visitorId) {
  return request("/api/v1/stars", { visitorId });
}

// "오늘도 버텼다" 도장. 같은 밤에 또 찍으면 서버가 200 firstToday:false를 주는데,
// 화면 문구는 기기에 남은 기록으로 이미 정해져 있어서 응답을 보지 않는다
export function postCardTap(visitorId) {
  return request("/api/v1/card-taps", { visitorId });
}

// 위기 안내 카드가 한 번 떴다는 사실만 보낸다. 원문도 방문자 ID도 싣지 않는다.
// 빈 {}는 request()가 POST로 보내게 하려는 것뿐이고, 서버는 본문을 읽지 않는다
export function postCrisisEvent() {
  return request("/api/v1/crisis-events", {});
}

// 오늘 밤 하늘. 실패하면 null이고, 화면은 숫자 없는 문구로 버틴다
export function getNight() {
  return request("/api/v1/night");
}
