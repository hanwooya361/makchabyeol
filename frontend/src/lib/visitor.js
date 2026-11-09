// 익명 방문자 ID. 이름·이메일·기기 정보와 연결되지 않고, 브라우저 데이터를 지우면 새 사람이 된다.
// rate limit과 재방문 측정에만 쓴다(docs/tech-design.md 3장).
const KEY = "makchabyeol.visitorId";

export function visitorId() {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved) return saved;

    const fresh = crypto.randomUUID();
    localStorage.setItem(KEY, fresh);
    return fresh;
  } catch {
    // 저장소가 막힌 브라우저. 이번 방문에만 쓰는 ID로 의식은 그대로 굴러간다
    return crypto.randomUUID();
  }
}
