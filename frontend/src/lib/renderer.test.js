import { test } from "node:test";
import assert from "node:assert/strict";
import { forcedRenderer, isDebug, isLowEnd, pickRenderer, tooSlow } from "./renderer.js";

const normal = { search: "", reducedMotion: false, webgl: true, lowEnd: false, remembered: null };

test("WebGL이 되고 모션 줄이기가 꺼진 보통 기기는 3D", () => {
  assert.equal(pickRenderer(normal), "3d");
});

test("WebGL 없음·모션 줄이기·저사양·지난번에 버벅인 기기는 2D 대체 화면", () => {
  assert.equal(pickRenderer({ ...normal, webgl: false }), "2d");
  assert.equal(pickRenderer({ ...normal, reducedMotion: true }), "2d");
  assert.equal(pickRenderer({ ...normal, lowEnd: true }), "2d");
  assert.equal(pickRenderer({ ...normal, remembered: "2d" }), "2d");
});

test("주소의 ?renderer가 모든 판별보다 먼저다", () => {
  assert.equal(pickRenderer({ ...normal, search: "?renderer=2d" }), "2d");
  assert.equal(
    pickRenderer({ ...normal, search: "?renderer=3d", webgl: false, remembered: "2d" }),
    "3d",
  );
  assert.equal(forcedRenderer("?renderer=vr"), null);
  assert.equal(forcedRenderer(""), null);
});

test("메모리 2GB 이하나 코어 2개 이하만 저사양으로 본다. 모르는 값은 판단하지 않는다", () => {
  assert.equal(isLowEnd({ deviceMemory: 2, cores: 8 }), true);
  assert.equal(isLowEnd({ deviceMemory: 8, cores: 2 }), true);
  assert.equal(isLowEnd({ deviceMemory: 4, cores: 4 }), false);
  assert.equal(isLowEnd({ deviceMemory: undefined, cores: undefined }), false);
});

test("처음 몇 초 평균 24fps 미만이면 2D로 내린다", () => {
  assert.equal(tooSlow(23), true);
  assert.equal(tooSlow(0), true);
  assert.equal(tooSlow(24), false);
  assert.equal(tooSlow(60), false);
});

test("?debug가 있을 때만 측정 모드", () => {
  assert.equal(isDebug("?debug"), true);
  assert.equal(isDebug("?renderer=3d&debug"), true);
  assert.equal(isDebug(""), false);
});
