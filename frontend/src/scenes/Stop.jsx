import "./Stop.css";

// S1 정류장. 실루엣은 장식이라 SVG를 통째로 aria-hidden 하고,
// 읽어야 하는 글자는 모두 HTML로 올린다(대비·글자 크기 조절·스크린리더).
export default function Stop() {
  return (
    <main className="scene scene--stop">
      <p className="stop__sign">
        막차까지 <span className="stop__sign-infinity">∞</span>분
      </p>

      <div className="stop__art">
        <svg
          className="stop__svg"
          viewBox="0 0 360 300"
          preserveAspectRatio="xMidYMax meet"
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            <radialGradient id="lampGlow">
              <stop offset="0%" stopColor="var(--lamp-light)" stopOpacity="0.45" />
              <stop offset="55%" stopColor="var(--lamp-light)" stopOpacity="0.12" />
              <stop offset="100%" stopColor="var(--lamp-light)" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="lampBeam" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--lamp-light)" stopOpacity="0.2" />
              <stop offset="100%" stopColor="var(--lamp-light)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* 가로등 빛: 실루엣 뒤에 깔린다 */}
          <circle cx="54" cy="56" r="92" fill="url(#lampGlow)" />
          <path d="M54 64 L18 286 H90 Z" fill="url(#lampBeam)" />
          <ellipse cx="54" cy="286" rx="58" ry="12" fill="url(#lampGlow)" />

          {/* 정류장: 지붕, 측면 판, 기둥 둘 */}
          <rect x="96" y="100" width="248" height="13" rx="4" fill="var(--stop-shadow)" />
          <rect x="320" y="113" width="14" height="150" fill="var(--stop-shadow)" />
          <rect x="104" y="113" width="9" height="173" rx="2" fill="var(--stop-shadow)" />
          <rect x="326" y="113" width="9" height="173" rx="2" fill="var(--stop-shadow)" />

          {/* 벤치: 세로 지지대가 등받이·앉는 판·다리를 한 줄로 잇는다 */}
          <rect x="142" y="192" width="150" height="8" rx="3" fill="var(--stop-shadow)" />
          <rect x="154" y="196" width="9" height="90" rx="2" fill="var(--stop-shadow)" />
          <rect x="271" y="196" width="9" height="90" rx="2" fill="var(--stop-shadow)" />
          <rect x="142" y="222" width="150" height="11" rx="4" fill="var(--stop-shadow)" />

          {/* 가로등 기둥과 등 */}
          <rect x="50" y="60" width="8" height="226" rx="3" fill="var(--stop-shadow)" />
          <path d="M34 44 H74 L66 62 H42 Z" fill="var(--stop-shadow)" />
          <circle cx="54" cy="54" r="7" fill="var(--star-light)" />

          {/* 바닥 */}
          <rect x="0" y="286" width="360" height="4" rx="2" fill="var(--stop-shadow)" />
        </svg>
      </div>

      <div className="stop__reader">
        <span className="stop__reader-led" aria-hidden="true" />
        카드를 대 주세요
      </div>

      {/* shortcut: 아직 아무 동작 없는 버튼, T04에서 하늘(S2) 전환을 연결한다 */}
      <button type="button" className="stop__sky-link">
        하늘 보기 <span aria-hidden="true">↑</span>
      </button>
    </main>
  );
}
