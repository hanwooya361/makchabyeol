import { useState } from "react";
import Stop from "./scenes/Stop.jsx";
import Sky from "./scenes/Sky.jsx";
import { nightDate } from "./lib/night.js";
import { readTapNight, writeTapNight } from "./lib/stamp.js";
import { visitorId } from "./lib/visitor.js";
import { useNight } from "./lib/useNight.js";
import { postStar } from "./api/client.js";

// 의식 시간은 설계 3장(0.8 + 1.5 + 0.5초). 모션 줄이기에서는 애니메이션이 없으니 기다릴 이유도 없다
const RITUAL_MS = 2800;
const RITUAL_REDUCED_MS = 600;

function ritualMs() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? RITUAL_REDUCED_MS
    : RITUAL_MS;
}

export default function App() {
  const [tapped, setTapped] = useState(null);
  const [scene, setScene] = useState("stop");
  const [skyPhase, setSkyPhase] = useState("ask");
  const [released, setReleased] = useState(false);

  // 하늘에 올라온 동안만 폴링한다. 정류장에서는 서버를 부를 이유가 없다
  const { night, slow } = useNight(scene === "sky");

  // 서버 기록은 T10. 지금은 기기에만 남긴다.
  function handleCardTap() {
    const tonight = nightDate();
    const already = readTapNight() === tonight;
    if (!already) writeTapNight(tonight);
    setTapped(already ? "again" : "first");
    // 찍힌 느낌을 1초 보여준 뒤 하늘로 올린다(설계 3장).
    // App은 사는 동안 안 사라지니 타이머를 치울 일도 없다
    setTimeout(() => setScene("sky"), 1000);
  }

  // 걱정 원문은 Sky의 state에서 여기까지만 온다. 서버로는 익명 ID만 간다.
  // 애니메이션은 서버 응답을 기다리지 않는다 — 저장이 실패해도 별은 뜬다(설계 3장).
  // 원문을 받는 자리는 T09 위기 키워드 검사가 쓴다
  function handleRelease() {
    setReleased(true);
    setSkyPhase("releasing");
    postStar(visitorId());
    setTimeout(() => setSkyPhase("done"), ritualMs());
  }

  return (
    <div className="stage">
      {/* 화면 밖 장면은 inert로 포커스·스크린리더에서 뺀다. 하늘이 먼저 와야
          전환 중에 정류장이 그 위를 덮으며 내려간다(DOM 뒤쪽이 위에 그려짐) */}
      <main className="scenes" data-scene={scene}>
        <Sky
          inert={scene !== "sky"}
          phase={skyPhase}
          released={released}
          night={night}
          slow={slow}
          onRelease={handleRelease}
          onSkip={() => setSkyPhase("done")}
          onBackToStop={() => setScene("stop")}
        />
        <Stop
          inert={scene !== "stop"}
          tapped={tapped}
          onCardTap={handleCardTap}
          onSkyLink={() => setScene("sky")}
        />
      </main>
      <footer className="footer">
        <a href="#help">도움받을 곳</a>
      </footer>
    </div>
  );
}
