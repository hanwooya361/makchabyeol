import { test } from "node:test";
import assert from "node:assert/strict";
import { isCrisis } from "./crisis.js";

test("있는 그대로 쓴 위기 표현을 잡는다", () => {
  assert.equal(isCrisis("죽고 싶어요"), true);
  assert.equal(isCrisis("자살하고 싶다는 생각이 들어요"), true);
  assert.equal(isCrisis("이제 그냥 사라지고 싶어"), true);
});

test("띄어쓰기를 바꿔도 잡는다", () => {
  assert.equal(isCrisis("죽 고 싶 다"), true);
  assert.equal(isCrisis("죽고싶다"), true);
  assert.equal(isCrisis("자 살"), true);
});

test("특수문자·줄바꿈을 섞어도 잡는다", () => {
  assert.equal(isCrisis("죽.고.싶.다"), true);
  assert.equal(isCrisis("죽고\n싶어요..."), true);
  assert.equal(isCrisis("자*살"), true);
});

test("영문은 대소문자를 가리지 않는다", () => {
  assert.equal(isCrisis("I want to die"), true);
  assert.equal(isCrisis("KILL MYSELF"), true);
  assert.equal(isCrisis("Suicide"), true);
});

test("평범한 걱정은 그냥 지나간다", () => {
  assert.equal(isCrisis(""), false);
  assert.equal(isCrisis("내일 발표가 무서워요"), false);
  assert.equal(isCrisis("요즘 잠이 잘 안 와요"), false);
  assert.equal(isCrisis("다들 앞서가는 것 같아요"), false);
  assert.equal(isCrisis("오늘 일 다 끝내고 집에 왔어요"), false);
});
