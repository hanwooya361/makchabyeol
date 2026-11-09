import { lazy, Suspense, useState } from "react";
import Stop from "./scenes/Stop.jsx";
import Sky from "./scenes/Sky.jsx";
import { nightDate } from "./lib/night.js";
import { readTapNight, writeTapNight } from "./lib/stamp.js";
import { visitorId } from "./lib/visitor.js";
import { useNight } from "./lib/useNight.js";
import { postCardTap, postCrisisEvent, postStar } from "./api/client.js";
import { isCrisis } from "./safety/crisis.js";
import HelpCard from "./components/HelpCard.jsx";
import { detectRenderer, isDebug } from "./lib/renderer.js";

// 3D 코드는 따로 쪼개 3D로 가는 사람만 받는다. 받는 동안은 2D가 대체 화면으로 보인다(설계 8장)
const Stage3D = lazy(() => import("./scenes/three/Stage3D.jsx"));
const RENDERER = detectRenderer();
const DEBUG = isDebug(window.location.search);

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
  // 안내 카드: null | "crisis"(S4) | "help"(S5). 닫으면 다시 null
  const [help, setHelp] = useState(null);
  // 위기 카드는 한 세션에 한 번만. 나중에 붙일 후원 링크도 이 세션에서는 숨긴다(prd M4)
  const [crisisSeen, setCrisisSeen] = useState(false);
  // 3D 캔버스가 만들어지면 2D 그림을 숨긴다. 그 전까지는 2D가 그대로 보인다
  const [threeReady, setThreeReady] = useState(false);

  // 하늘에 올라온 동안만 폴링한다. 정류장에서는 서버를 부를 이유가 없다
  const { night, slow } = useNight(scene === "sky");

  // 문구는 기기에 남은 기록으로 바로 정한다. 서버 기록은 뒤에서 따라가고 기다리지 않는다 —
  // 잠든 서버 때문에 "삑"이 늦으면 의식이 깨진다(설계 2장 S1 로딩)
  function handleCardTap() {
    const tonight = nightDate();
    const already = readTapNight() === tonight;
    if (!already) writeTapNight(tonight);
    setTapped(already ? "again" : "first");
    postCardTap(visitorId());
    // 찍힌 느낌을 1초 보여준 뒤 하늘로 올린다(설계 3장).
    // App은 사는 동안 안 사라지니 타이머를 치울 일도 없다
    setTimeout(() => setScene("sky"), 1000);
  }

  // 걱정 원문은 Sky의 state에서 여기까지만 온다. 검사도 브라우저 안에서 하고, 서버로는 익명 ID만 간다.
  // 애니메이션은 서버 응답을 기다리지 않는다 — 저장이 실패해도 별은 뜬다(설계 3장)
  function handleRelease(text) {
    // 카드는 별이 다 뜬 뒤에 띄운다. 의식을 끊지 않는다(prd M4)
    const crisis = !crisisSeen && isCrisis(text);
    if (crisis) setCrisisSeen(true);
    setReleased(true);
    setSkyPhase("releasing");
    postStar(visitorId());
    setTimeout(() => {
      setSkyPhase("done");
      // 집계는 카드가 실제로 보이는 순간에. 의식 도중 창을 닫아 못 본 경우는 세지 않는다
      if (crisis) {
        setHelp("crisis");
        postCrisisEvent();
      }
    }, ritualMs());
  }

  return (
    <div className="stage" data-three={threeReady ? "ready" : undefined}>
      {RENDERER === "3d" && (
        <Suspense fallback={null}>
          <Stage3D
            scene={scene}
            night={night}
            released={released}
            phase={skyPhase}
            debug={DEBUG}
            onReady={() => setThreeReady(true)}
          />
        </Suspense>
      )}
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
        <button type="button" onClick={() => setHelp("help")}>
          도움받을 곳
        </button>
        <a href="/privacy.html">소개·개인정보</a>
      </footer>
      {/* 열릴 때만 그린다. 마운트되면 스스로 모달이 되고, Esc나 닫기 버튼이 onClose로 돌아온다 */}
      {help && <HelpCard variant={help} onClose={() => setHelp(null)} />}
    </div>
  );
}
