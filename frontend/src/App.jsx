import { useState } from "react";
import Stop from "./scenes/Stop.jsx";
import { nightDate } from "./lib/night.js";
import { readTapNight, writeTapNight } from "./lib/stamp.js";

// scene 상태로 S1~S3을 전환하는 구조는 T04에서. 지금은 S1만 보여준다.
export default function App() {
  const [tapped, setTapped] = useState(null);

  // 서버 기록은 T10. 지금은 기기에만 남긴다.
  function handleCardTap() {
    const tonight = nightDate();
    const already = readTapNight() === tonight;
    if (!already) writeTapNight(tonight);
    setTapped(already ? "again" : "first");
  }

  return (
    <div className="stage">
      <Stop tapped={tapped} onCardTap={handleCardTap} />
      <footer className="footer">
        <a href="#help">도움받을 곳</a>
      </footer>
    </div>
  );
}
