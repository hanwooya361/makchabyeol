import { useEffect, useRef } from "react";
import "./Home.css";
import { countMessage } from "./countMessage.js";

// S7 집 도착(T22.5). 버스에서 카드를 찍으면 온다. 2D·3D 모두 이 HTML 화면 하나.
// 후원 링크(Should)는 아직 없다. 붙일 때는 위기 안내가 떴던 세션에서 숨긴다(prd M4)
export default function Home({ inert, night, slow, onStay }) {
  const title = useRef(null);
  const wasInert = useRef(inert);
  const counted = countMessage(night, slow);

  // 도착하면 제목으로 포커스를 옮겨 스크린리더가 "집에 도착했어요"부터 읽게
  useEffect(() => {
    if (wasInert.current && !inert) title.current.focus({ preventScroll: true });
    wasInert.current = inert;
  }, [inert]);

  return (
    <section className="scene scene--home" inert={inert}>
      <div className="home__window" aria-hidden="true" />
      <h2 className="home__title" ref={title} tabIndex={-1}>
        집에 도착했어요.
      </h2>
      <p className="home__count" aria-live="polite">
        {counted}
      </p>
      <p className="home__closing">내일 또 와요.</p>
      <button type="button" className="home__stay" onClick={onStay}>
        조금 더 있다 갈래요
      </button>
    </section>
  );
}
