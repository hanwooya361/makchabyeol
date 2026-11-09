import { CanvasTexture } from "three";

// 가운데가 밝고 가장자리로 사라지는 동그란 빛. 후처리(bloom) 패키지 없이 빛 번짐을 흉내 낸다.
// 바닥 번짐·가로등 후광·내 별 후광이 같이 쓴다
export function makeGlowTexture() {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.35, "rgba(255,255,255,0.35)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return new CanvasTexture(canvas);
}
