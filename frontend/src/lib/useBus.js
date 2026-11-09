import { useEffect, useState } from "react";
import { busAt } from "./bus.js";

// 1초마다 시간표를 보되, 화면은 남은 분이나 상태(오는 중/서 있음)가 바뀔 때만 다시 그린다
export function useBus() {
  const [bus, setBus] = useState(() => busAt(Date.now()));

  useEffect(() => {
    const id = setInterval(() => {
      const next = busAt(Date.now());
      setBus((prev) =>
        prev.phase === next.phase &&
        prev.minutes === next.minutes &&
        prev.arriveAt === next.arriveAt
          ? prev
          : next,
      );
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return bus;
}
