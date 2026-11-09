import { useState } from "react";
import Stop from "./scenes/Stop.jsx";
import Sky from "./scenes/Sky.jsx";
import { nightDate } from "./lib/night.js";
import { readTapNight, writeTapNight } from "./lib/stamp.js";

export default function App() {
  const [tapped, setTapped] = useState(null);
  const [scene, setScene] = useState("stop");

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

  return (
    <div className="stage">
      {/* 화면 밖 장면은 inert로 포커스·스크린리더에서 뺀다. 하늘이 먼저 와야
          전환 중에 정류장이 그 위를 덮으며 내려간다(DOM 뒤쪽이 위에 그려짐) */}
      <main className="scenes" data-scene={scene}>
        <Sky inert={scene !== "sky"} />
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
