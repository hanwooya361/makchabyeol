// 3D로 그릴지 2D 대체 화면으로 갈지는 여기 한 곳에서만 정한다(docs/tech-design.md 8장).
// 시험용으로 주소에 ?renderer=2d|3d를 붙이면 강제로 고를 수 있다.
// shortcut: 저사양 판별은 아직 없다. T17 실측을 보고 T18에서 기준을 정한다
export function pickRenderer({ search, reducedMotion, webgl }) {
  const forced = new URLSearchParams(search).get("renderer");
  if (forced === "2d" || forced === "3d") return forced;
  return webgl && !reducedMotion ? "3d" : "2d";
}

// ?debug: fps 표시 + 별 300개 채우기(T17 측정용)
export function isDebug(search) {
  return new URLSearchParams(search).has("debug");
}

function hasWebGL() {
  try {
    return Boolean(document.createElement("canvas").getContext("webgl2"));
  } catch {
    return false;
  }
}

export function detectRenderer() {
  return pickRenderer({
    search: window.location.search,
    reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    webgl: hasWebGL(),
  });
}
