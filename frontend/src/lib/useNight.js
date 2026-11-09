import { useEffect, useState } from "react";
import { getNight } from "../api/client.js";

const POLL_MS = 30000;
const SLOW_MS = 10000;

/**
 * 오늘 밤 하늘을 30초마다 받아 온다. 서버가 잠들어 있을 수 있으니 장면은 이걸 기다리지 않고,
 * 10초가 지나도 첫 응답이 없으면 숫자 없는 문구로 바꾸라고 slow를 올린다(docs/screen-design.md 2장).
 */
export function useNight(active) {
  const [night, setNight] = useState(null);
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    if (!active) return undefined;

    let alive = true;
    const slowTimer = setTimeout(() => {
      if (alive) setSlow(true);
    }, SLOW_MS);

    async function tick() {
      const data = await getNight();
      if (!alive || !data) return;
      // 한 번 받아 온 뒤 폴링이 실패하면 직전 숫자를 그대로 둔다. 숫자가 사라지는 편이 더 불안하다
      setNight(data);
      setSlow(false);
      clearTimeout(slowTimer);
    }

    tick();
    const poll = setInterval(tick, POLL_MS);

    return () => {
      alive = false;
      clearTimeout(slowTimer);
      clearInterval(poll);
    };
  }, [active]);

  return { night, slow };
}
