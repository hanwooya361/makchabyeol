import { useEffect, useState } from "react";
import { busAt } from "./bus.js";

// 1초마다 시간표를 보되, 화면은 남은 분·상태·문·곧 출발 중 하나라도 바뀔 때만 다시 그린다
export function useBus() {
  const [bus, setBus] = useState(() => busAt(Date.now()));

  useEffect(() => {
    const id = setInterval(() => {
      const next = busAt(Date.now());
      setBus((prev) => (Object.keys(next).every((key) => prev[key] === next[key]) ? prev : next));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return bus;
}
