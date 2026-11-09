import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Euler, Vector3 } from "three";
import { fovFor } from "./fov.js";

// 3인칭 카메라(T22.1). 캐릭터 뒤쪽 위에서 따라오고, 끌어서 둘레를 돈다.
// pitch는 "보는 각도"(+ 위, − 아래). 아래를 볼 때는 카메라가 올라가 캐릭터를 내려다보고,
// 위를 볼 때는 카메라가 낮은 자리에 멈춘 채 고개만 든다 → 땅 밑으로 내려가지 않는다
const DISTANCE = 4; // 세로 폰은 가로 시야가 좁아서 4m(요청 범위 3~4m의 위쪽)
const HEAD = 1.0; // 캐릭터 몸 가운데쯤을 본다
const LOW_ELEVATION = 0.14; // 위를 볼 때 카메라가 머무는 낮은 높이각(약 8도)
const PITCH_MIN = -1.05; // 내려다보기 60도까지
const PITCH_MAX = 1.31; // 올려다보기 75도까지
const LOOK_UP = 1.05; // 60도 넘게 올려다보면 "하늘 보기"를 살짝 강조
const START_PITCH = -0.32; // 처음엔 살짝 내려다본다
const SKY_PITCH = 1.05; // 하늘 장면: 정면(yaw 0)으로 60도. 별 자리가 2D와 같게 맞춰진 각도
const TILT_SECONDS = 1.2; // 2D 장면이 위아래로 미는 시간과 같게(설계 3장)
const TAP_SLOP = 8; // 이보다 덜 움직였으면 끌기가 아니라 탭(걷기)

function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
}

// -π~π로 접어서 하늘 시점(yaw 0)으로 갈 때 가까운 쪽으로 돈다
function wrap(a) {
  return Math.atan2(Math.sin(a), Math.cos(a));
}

// 끌기 입력. 캔버스에만 붙인다(HTML 버튼·입력칸은 건드리지 않음).
// PC는 오른쪽 버튼 끌기(마우스를 오른쪽으로 → 오른쪽을 봄), 폰은 한 손가락 끌기(화면을 잡아끄는 느낌)
function useDragToLook(view, enabled, onLookUp) {
  const { gl, invalidate } = useThree();
  const lookingUp = useRef(false);

  useEffect(() => {
    const el = gl.domElement;
    let drag = null;

    function down(e) {
      if (!enabled.current) return;
      if (e.pointerType === "mouse" && e.button !== 2) return;
      drag = {
        id: e.pointerId,
        x: e.clientX,
        y: e.clientY,
        moved: 0,
        touch: e.pointerType !== "mouse",
      };
    }
    function move(e) {
      if (!drag || e.pointerId !== drag.id) return;
      const dx = e.clientX - drag.x;
      const dy = e.clientY - drag.y;
      drag.x = e.clientX;
      drag.y = e.clientY;
      drag.moved += Math.hypot(dx, dy);
      if (drag.moved < TAP_SLOP) return;
      // 폰: 아래로 끌면 하늘이 내려와 위를 봄. PC: 마우스를 위로 올리면 위를 봄
      const k = drag.touch ? 0.005 : -0.005;
      view.current.yaw += dx * k;
      view.current.pitch = Math.min(PITCH_MAX, Math.max(PITCH_MIN, view.current.pitch + dy * k));
      const up = view.current.pitch > LOOK_UP;
      if (up !== lookingUp.current) onLookUp((lookingUp.current = up));
      invalidate();
    }
    function up(e) {
      if (drag && e.pointerId === drag.id) drag = null;
    }
    const noMenu = (e) => e.preventDefault();

    el.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    el.addEventListener("contextmenu", noMenu);
    return () => {
      el.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      el.removeEventListener("contextmenu", noMenu);
    };
  }, [gl, invalidate, view, enabled, onLookUp]);
}

export default function CameraRig({ up, me, onLookUp }) {
  const view = useRef({ yaw: 0, pitch: START_PITCH });
  const enabled = useRef(!up);
  const sky = useRef(up ? 1 : 0); // 0 정류장 ~ 1 하늘
  const target = useRef(me.current.clone().setY(HEAD));
  const invalidate = useThree((state) => state.invalidate);
  const tmp = useRef({ pos: new Vector3(), euler: new Euler(0, 0, 0, "YXZ") });

  // 장면이 바뀌면 끌기를 켜고 끄고, 멈춰 있던 그리기를 깨운다
  useEffect(() => {
    enabled.current = !up;
    invalidate();
  }, [up, invalidate]);

  useDragToLook(view, enabled, onLookUp);

  useFrame(({ camera, size }, dt) => {
    // 화면 비율이 바뀌면(창 크기, 폰 회전) 시야각을 다시 맞춘다
    const fov = fovFor(size.width / size.height);
    if (camera.fov !== fov) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }

    const step = Math.min(dt, 1 / 30); // 쉬다 깬 첫 프레임이 한 번에 건너뛰지 않게
    const goal = up ? 1 : 0;
    sky.current +=
      Math.sign(goal - sky.current) * Math.min(Math.abs(goal - sky.current), step / TILT_SECONDS);
    const e = easeInOut(sky.current);

    // 캐릭터를 부드럽게 늦게 따라간다(1초에 남은 거리의 약 99%)
    const want = me.current.clone().setY(HEAD);
    target.current.lerp(want, 1 - Math.exp(-5 * step));

    // 하늘로 갈 땐 정해진 하늘 시점으로 섞는다
    const yaw = view.current.yaw + wrap(0 - view.current.yaw) * e;
    const pitch = view.current.pitch + (SKY_PITCH - view.current.pitch) * e;

    // 카메라 자리: 보는 각도의 반대쪽 위. 위를 볼 땐 낮은 높이각에 머문다
    const elevation = Math.max(-pitch, LOW_ELEVATION);
    const { pos, euler } = tmp.current;
    pos.set(
      Math.sin(yaw) * Math.cos(elevation),
      Math.sin(elevation),
      Math.cos(yaw) * Math.cos(elevation),
    );
    camera.position.copy(target.current).addScaledVector(pos, DISTANCE);
    camera.rotation.copy(euler.set(pitch, yaw, 0));

    const settling = sky.current !== goal || target.current.distanceToSquared(want) > 1e-5;
    if (settling) invalidate();
  });
  return null;
}
