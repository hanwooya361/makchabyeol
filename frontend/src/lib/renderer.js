// 3D로 그릴지 2D 대체 화면으로 갈지는 여기 한 곳에서만 정한다(docs/tech-design.md 8장).
// 시험용으로 주소에 ?renderer=2d|3d를 붙이면 강제로 고를 수 있고, 그때는 자동 전환도 하지 않는다.
const KEY = "makchabyeol.renderer";

// 3D를 띄운 뒤 처음 몇 초 평균이 이보다 낮으면 2D로 내린다. 목표(30fps)보다 조금 낮게 잡아
// 잠깐 출렁인 정도로는 내리지 않는다
export const MIN_FPS = 24;

export function forcedRenderer(search) {
  const forced = new URLSearchParams(search).get("renderer");
  return forced === "2d" || forced === "3d" ? forced : null;
}

// 메모리(Chrome만 알려 줌)나 코어 수가 아주 적으면 3D 코드를 받기 전에 2D로 보낸다.
// 애매한 기기는 여기서 거르지 않고 실제 fps로 판단한다(tooSlow)
export function isLowEnd({ deviceMemory, cores }) {
  return (deviceMemory !== undefined && deviceMemory <= 2) || (cores !== undefined && cores <= 2);
}

export function pickRenderer({ search, reducedMotion, webgl, lowEnd, remembered }) {
  const forced = forcedRenderer(search);
  if (forced) return forced;
  if (!webgl || reducedMotion || lowEnd || remembered === "2d") return "2d";
  return "3d";
}

export function tooSlow(fps) {
  return fps < MIN_FPS;
}

// ?debug: fps 표시 + 별 300개 채우기(측정용)
export function isDebug(search) {
  return new URLSearchParams(search).has("debug");
}

// 이 기기에서 3D가 버벅였다는 표시. 다음 방문부터 3D 코드를 받지 않고 바로 2D로 연다.
// 저장이 막힌 브라우저면 매번 3D를 한 번 시도할 뿐이다
export function rememberFallback() {
  try {
    localStorage.setItem(KEY, "2d");
  } catch {
    // 저장소가 막힌 브라우저
  }
}

function readRemembered() {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
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
    lowEnd: isLowEnd({
      deviceMemory: navigator.deviceMemory,
      cores: navigator.hardwareConcurrency,
    }),
    remembered: readRemembered(),
  });
}
