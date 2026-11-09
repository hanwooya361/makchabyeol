import { test } from "node:test";
import assert from "node:assert/strict";
import { isDebug, pickRenderer } from "./renderer.js";

test("WebGL이 되고 모션 줄이기가 꺼져 있으면 3D", () => {
  assert.equal(pickRenderer({ search: "", reducedMotion: false, webgl: true }), "3d");
});

test("WebGL이 없거나 모션 줄이기가 켜져 있으면 2D 대체 화면", () => {
  assert.equal(pickRenderer({ search: "", reducedMotion: false, webgl: false }), "2d");
  assert.equal(pickRenderer({ search: "", reducedMotion: true, webgl: true }), "2d");
});

test("주소의 ?renderer가 판별보다 먼저다", () => {
  assert.equal(pickRenderer({ search: "?renderer=2d", reducedMotion: false, webgl: true }), "2d");
  assert.equal(pickRenderer({ search: "?renderer=3d", reducedMotion: true, webgl: false }), "3d");
  assert.equal(pickRenderer({ search: "?renderer=vr", reducedMotion: false, webgl: true }), "3d");
});

test("?debug가 있을 때만 측정 모드", () => {
  assert.equal(isDebug("?debug"), true);
  assert.equal(isDebug("?renderer=3d&debug"), true);
  assert.equal(isDebug(""), false);
});
