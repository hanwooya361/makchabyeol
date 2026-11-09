import { test } from "node:test";
import assert from "node:assert/strict";
import { busAt, DWELL_MS, INTERVAL_MS } from "./bus.js";

// 2026-11-09 23:05:00 KST = 14:05:00 UTC
const ARRIVAL = Date.UTC(2026, 10, 9, 14, 5, 0);

test("한국 시간 매시 5분 배수에 도착해 서 있다", () => {
  assert.deepEqual(busAt(ARRIVAL), { phase: "stopped", arriveAt: ARRIVAL, minutes: 0 });
  assert.equal(busAt(ARRIVAL + DWELL_MS - 1).phase, "stopped");
});

test("60초가 지나면 출발하고, 다음 버스까지 남은 분을 올림으로 센다", () => {
  const left = busAt(ARRIVAL + DWELL_MS);
  assert.equal(left.phase, "coming");
  assert.equal(left.arriveAt, ARRIVAL + INTERVAL_MS);
  assert.equal(left.minutes, 4);
  assert.equal(busAt(ARRIVAL + INTERVAL_MS - 1).minutes, 1); // 1밀리초 남아도 "1분"
  assert.equal(busAt(ARRIVAL + INTERVAL_MS - 60_001).minutes, 2);
});

test("누가 언제 보든 같은 시각엔 같은 버스", () => {
  const a = busAt(ARRIVAL + 123_456);
  const b = busAt(ARRIVAL + 123_456);
  assert.deepEqual(a, b);
  assert.equal(busAt(ARRIVAL - 1).arriveAt, ARRIVAL); // 도착 직전은 바로 그 버스를 기다리는 중
});
