import { lazy, Suspense, useState } from "react";
import Stop from "./scenes/Stop.jsx";
import Sky from "./scenes/Sky.jsx";
import Home from "./scenes/Home.jsx";
import { nightDate } from "./lib/night.js";
import { readTapNight, writeTapNight } from "./lib/stamp.js";
import { visitorId } from "./lib/visitor.js";
import { useNight } from "./lib/useNight.js";
import { useBus } from "./lib/useBus.js";
import { DWELL_MS, INTERVAL_MS } from "./lib/bus.js";
import { postCardTap, postCrisisEvent, postStar } from "./api/client.js";
import { isCrisis } from "./safety/crisis.js";
import HelpCard from "./components/HelpCard.jsx";
import {
  detectRenderer,
  forcedRenderer,
  isDebug,
  rememberFallback,
  tooSlow,
} from "./lib/renderer.js";

// 3D 코드는 따로 쪼개 3D로 가는 사람만 받는다. 받는 동안은 2D가 대체 화면으로 보인다(설계 8장)
const Stage3D = lazy(() => import("./scenes/three/Stage3D.jsx"));
const RENDERER = detectRenderer();
const DEBUG = isDebug(window.location.search);

// 의식 시간은 설계 3장(0.8 + 1.5 + 0.5초). 모션 줄이기에서는 애니메이션이 없으니 기다릴 이유도 없다
const RITUAL_MS = 2800;
const RITUAL_REDUCED_MS = 600;

// 카드를 찍고 집 도착 화면까지: 3D는 버스가 떠나는 걸 보여 주고, 2D는 "삑" 문구만 잠깐
const RIDE_3D_MS = 4000;
const RIDE_2D_MS = 1500;

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
  const [renderer, setRenderer] = useState(RENDERER);
  // 3D에서 카메라로 위를 많이 올려다보는 중. 하늘로 넘기지 않고 "하늘 보기"만 살짝 강조한다
  const [lookingUp, setLookingUp] = useState(false);

  // 버스로 마무리하기(T22.5). 순서는 별 → 버스 → 카드
  const [boardedBus, setBoardedBus] = useState(null); // 탄 버스의 도착 시각(안 탔으면 null)
  const [asking, setAsking] = useState(false); // 문 앞 질문 "걱정 하나 맡기고 갈래요?"
  const [noWorry, setNoWorry] = useState(false); // "오늘은 맡길 게 없어요"를 골라 희미한 별만 띄움
  const [riding, setRiding] = useState(false); // 카드를 찍어 내 버스가 출발함
  const [boardRequest, setBoardRequest] = useState(0); // 3D: "버스 타기"를 누르면 캐릭터가 걸어 들어감

  // 3D가 이 기기에서 버벅이면 조용히 2D로 내리고, 다음 방문부터는 바로 2D로 연다.
  // 주소로 강제한 경우(측정 중)는 내리지 않는다
  function handlePerf(fps) {
    if (!tooSlow(fps) || forcedRenderer(window.location.search)) return;
    rememberFallback();
    setThreeReady(false);
    setRenderer("2d");
  }

  // 하늘에 올라온 동안만 폴링한다. 정류장에서는 서버를 부를 이유가 없다
  const { night, slow } = useNight(scene === "sky" || scene === "home");
  // 버스 시간표는 기기 시계로. 전광판(2D·3D 공통)과 3D 버스가 같은 값을 본다
  const bus = useBus();
  const starDone = released || noWorry;
  const use3D = renderer === "3d" && threeReady;

  // 버스 안 = 탄 그 버스의 문이 아직 열려 있음(카드를 찍었으면 출발 중이어도 안).
  // 문이 닫혔는데 카드를 안 찍었으면 태우지 않고 내려 준 것: "다음 버스 타도 괜찮아요".
  // 다음 버스 문이 열리면 그 안내도 사라진다. 본인이 찍지 않으면 탑승이 아니다
  const boarded = boardedBus !== null && (riding || (bus.doorOpen && bus.arriveAt === boardedBus));
  const missed = boardedBus !== null && !riding && !boarded && !bus.doorOpen;

  // 3D 캐릭터가 버스 안에 들어오거나 스스로 걸어 나갔을 때. 문이 닫혀 밀려난 건 "놓침"으로 남긴다
  function handleInBus(inside) {
    if (inside) setBoardedBus(bus.arriveAt);
    else if (bus.doorOpen) setBoardedBus(null);
  }

  // 실제로 태우기: 3D는 캐릭터가 걸어 들어가서 안에 닿으면 탄 것, 2D는 바로 탄 것
  function board() {
    if (use3D) setBoardRequest((n) => n + 1);
    else setBoardedBus(bus.arriveAt);
  }

  // "버스 타기" 버튼, 또는 3D에서 별 없이 문 앞까지 걸어왔을 때
  function handleBoard() {
    if (!bus.doorOpen || boarded || riding) return;
    if (!starDone) {
      setAsking(true);
      return;
    }
    board();
  }

  function handleAnswer(choice) {
    setAsking(false);
    if (choice === "worry") {
      setScene("sky");
      return;
    }
    // 글 없이 희미한 별 하나. 서버에는 다른 별과 똑같이 "별을 띄웠다"만 간다
    setNoWorry(true);
    setReleased(true);
    setSkyPhase("done");
    postStar(visitorId());
    board();
  }

  function handleStay() {
    setScene("stop");
    setRiding(false);
    setBoardedBus(null);
    setTapped(null);
  }

  // 문구는 기기에 남은 기록으로 바로 정한다. 서버 기록은 뒤에서 따라가고 기다리지 않는다 —
  // 잠든 서버 때문에 "삑"이 늦으면 의식이 깨진다(설계 2장 S1 로딩)
  function handleCardTap() {
    if (!boarded || riding) return; // 카드는 버스 안에서만(버튼도 꺼져 있다)
    const tonight = nightDate();
    const already = readTapNight() === tonight;
    if (!already) writeTapNight(tonight);
    setTapped(already ? "again" : "first");
    postCardTap(visitorId());
    // 카드 = 탑승. 내 화면에서는 시간표를 기다리지 않고 바로 출발해 집으로 간다.
    // App은 사는 동안 안 사라지니 타이머를 치울 일도 없다
    setRiding(true);
    setTimeout(() => setScene("home"), use3D ? RIDE_3D_MS : RIDE_2D_MS);
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
    <div
      className="stage"
      data-three={threeReady ? "ready" : undefined}
      data-look-up={lookingUp && scene === "stop" ? "" : undefined}
    >
      {renderer === "3d" && (
        <Suspense fallback={null}>
          <Stage3D
            scene={scene}
            night={night}
            phase={skyPhase}
            bus={{
              arriveAt: bus.arriveAt,
              dwellMs: DWELL_MS,
              intervalMs: INTERVAL_MS,
              doorOpen: bus.doorOpen,
            }}
            canEnter={bus.doorOpen && starDone && !riding}
            boarded={boarded}
            riding={riding}
            boardRequest={boardRequest}
            onInBus={handleInBus}
            onAtDoor={handleBoard}
            debug={DEBUG}
            onReady={() => setThreeReady(true)}
            onPerf={handlePerf}
            onLookUp={setLookingUp}
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
          faint={noWorry}
          night={night}
          slow={slow}
          onRelease={handleRelease}
          onSkip={() => setSkyPhase("done")}
          onBackToStop={() => setScene("stop")}
        />
        <Stop
          inert={scene !== "stop"}
          bus={bus}
          boarded={boarded}
          riding={riding}
          asking={asking}
          missed={missed}
          tapped={tapped}
          onBoard={handleBoard}
          onAnswer={handleAnswer}
          onCardTap={handleCardTap}
          onSkyLink={() => setScene("sky")}
        />
        <Home inert={scene !== "home"} night={night} slow={slow} onStay={handleStay} />
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
