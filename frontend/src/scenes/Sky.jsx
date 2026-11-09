import "./Sky.css";

// S2 하늘. 배경 별은 CSS 그라디언트라 JS·상태·타이머가 없다.
// shortcut: 입력창·"맡기기"·"그냥 볼게요"가 아직 없음 — 의식 애니메이션과 서버가 붙는 T07·T08에서 한 번에 넣는다
export default function Sky({ inert }) {
  return (
    <section className="scene scene--sky" inert={inert}>
      <p className="sky__prompt">버스 오기 전에, 걱정 하나 맡기고 갈래요?</p>
    </section>
  );
}
