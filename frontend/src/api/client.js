// 서버로 가는 건 익명 ID와 "별을 띄웠다"는 사실뿐이다. 걱정 원문은 이 파일을 지나가지 않는다.
// 의식은 서버를 기다리지 않는다(Render 무료 서버는 잠들어 있을 수 있음). 실패하면 조용히 null.
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";
const TIMEOUT_MS = 15000;

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

// 오늘 밤 하늘. 실패하면 null이고, 화면은 숫자 없는 문구로 버틴다
export function getNight() {
  return request("/api/v1/night");
}
