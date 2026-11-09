import { useEffect, useRef } from "react";
import "./Stop.css";

const FEEDBACK = {
  first: "삑. 오늘도 여기까지 왔네요.",
  again: "오늘은 이미 찍었어요. 그래도 와 줘서 고마워요.",
};

// S1 정류장. 실루엣은 장식이라 SVG를 통째로 aria-hidden 하고,
// 읽어야 하는 글자는 모두 HTML로 올린다(대비·글자 크기 조절·스크린리더).
// 오늘 이미 찍었는지 판단하는 건 App.jsx와 lib/의 몫이고, 여기선 받아서 그리기만 한다.
export default function Stop({ inert, tapped, onCardTap, onSkyLink }) {
  const reader = useRef(null);
  const wasInert = useRef(inert);

  // 하늘에서 돌아오면 포커스를 단말기로. 안 그러면 inert가 된 하늘에서 포커스가 사라져 맨 앞으로 튄다.
  // 첫 화면에서는 옮기지 않는다(이전 값과 비교하니 StrictMode의 두 번 실행에도 안전)
  useEffect(() => {
    if (wasInert.current && !inert) reader.current.focus({ preventScroll: true });
    wasInert.current = inert;
  }, [inert]);

  return (
    <section className="scene scene--stop" inert={inert}>
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

      <button type="button" className="stop__reader" ref={reader} onClick={onCardTap}>
        <span
          className={tapped ? "stop__reader-led is-on" : "stop__reader-led"}
          aria-hidden="true"
        />
        카드를 대 주세요
      </button>

      {/* 영역은 늘 자리를 잡아 두고(CSS min-height) 내용만 바뀐다. 문구가 떴다 사라져도
          레이아웃이 튀지 않고, aria-live가 붙은 바깥 요소는 그대로 살아 있어야 읽어 준다 */}
      <p className="stop__feedback" aria-live="polite">
        {tapped && (
          <span key={tapped} className="stop__feedback-text">
            {FEEDBACK[tapped]}
          </span>
        )}
      </p>

      <button type="button" className="stop__sky-link" onClick={onSkyLink}>
        하늘 보기 <span aria-hidden="true">↑</span>
      </button>
    </section>
  );
}
