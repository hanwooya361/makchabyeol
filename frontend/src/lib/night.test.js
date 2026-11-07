import { test } from "node:test";
import assert from "node:assert/strict";
import { nightDate } from "./night.js";

test("정오 직전은 아직 어젯밤", () => {
  assert.equal(nightDate(new Date("2026-11-07T11:59:59+09:00")), "2026-11-06");
});

test("정오가 되면 그날 밤으로 바뀐다", () => {
  assert.equal(nightDate(new Date("2026-11-07T12:00:00+09:00")), "2026-11-07");
});

test("자정을 넘겨도 같은 밤이다", () => {
  assert.equal(nightDate(new Date("2026-11-07T23:30:00+09:00")), "2026-11-07");
  assert.equal(nightDate(new Date("2026-11-08T00:10:00+09:00")), "2026-11-07");
  assert.equal(nightDate(new Date("2026-11-08T11:59:59+09:00")), "2026-11-07");
});

test("다음 정오에 다음 밤으로 넘어간다", () => {
  assert.equal(nightDate(new Date("2026-11-08T12:00:00+09:00")), "2026-11-08");
});

test("브라우저 시간대와 상관없이 같은 순간은 같은 밤", () => {
  assert.equal(nightDate(new Date("2026-11-07T03:00:00Z")), "2026-11-07");
  assert.equal(nightDate(new Date("2026-11-06T22:00:00-05:00")), "2026-11-07");
});

test("연말을 넘어간다", () => {
  assert.equal(nightDate(new Date("2026-12-31T23:00:00+09:00")), "2026-12-31");
  assert.equal(nightDate(new Date("2027-01-01T11:00:00+09:00")), "2026-12-31");
  assert.equal(nightDate(new Date("2027-01-01T12:00:00+09:00")), "2027-01-01");
});
