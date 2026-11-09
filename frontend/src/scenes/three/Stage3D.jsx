import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Vector3 } from "three";
import StopModel from "./StopModel.jsx";
import StarField from "./StarField.jsx";
import Walker, { START } from "./Walker.jsx";
import "./Stage3D.css";

// 3D 정류장·밤하늘(T17 시험 제작). 2D 장면과 같은 값을 받아 그리기만 한다.
// 글자·버튼은 위에 겹친 2D 장면의 HTML이 맡고, 이 캔버스는 통째로 장식(aria-hidden)이다.
const EYE_HEIGHT = 1.4; // 살짝 낮은 3인칭: 벤치 옆에 선 사람 눈높이보다 조금 아래
const STOP_PITCH = 0.04;
const SKY_PITCH = 1.05; // 하늘을 올려다본 각도(약 60도)
const TILT_SECONDS = 1.2; // 2D 장면이 위아래로 미는 시간과 같게(설계 3장)
const HALF_WIDTH = 3.1; // 가로등부터 정류장 끝까지 화면 폭에 들어오게

const NO_STARS = [];

function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
}

// 카메라 자리: 화면 비율에 맞춰 정류장 전체가 들어오도록 뒤로 뺀다. 별도 이 자리를 기준으로 뜬다
function useEye() {
  const { camera, size } = useThree();
  return useMemo(() => {
    const vfov = (camera.fov * Math.PI) / 180;
    const hfov = 2 * Math.atan(Math.tan(vfov / 2) * (size.width / size.height));
    return new Vector3(0.3, EYE_HEIGHT, Math.max(7, HALF_WIDTH / Math.tan(hfov / 2)));
  }, [camera, size.width, size.height]);
}

// 카메라는 고개를 들고(하늘), 내 실루엣을 따라 옆으로 반쯤만 미끄러진다(3인칭).
// 움직일 때만 다음 프레임을 부른다(가만히 있을 땐 다시 그리지 않음)
const FOLLOW = 0.5;

function CameraRig({ up, eye, me }) {
  const progress = useRef(up ? 1 : 0);
  const offsetX = useRef((me.current.x - START.x) * FOLLOW);
  const invalidate = useThree((state) => state.invalidate);

  // 장면이 바뀌면 멈춰 있던 그리기를 깨운다
  useEffect(() => invalidate(), [up, invalidate]);

  useFrame(({ camera }, dt) => {
    const target = up ? 1 : 0;
    // 한참 쉬다 깬 첫 프레임은 dt가 커서 한 번에 끝까지 가 버린다. 한 프레임 몫으로 자른다
    const step = Math.min(Math.abs(target - progress.current), Math.min(dt, 1 / 30) / TILT_SECONDS);
    progress.current += Math.sign(target - progress.current) * step;
    // 따라가기는 부드럽게 늦게(1초에 남은 거리의 약 95%)
    const wantX = (me.current.x - START.x) * FOLLOW;
    offsetX.current += (wantX - offsetX.current) * (1 - Math.exp(-3 * Math.min(dt, 1 / 30)));
    camera.position.set(eye.x + offsetX.current, eye.y, eye.z);
    camera.rotation.set(STOP_PITCH + (SKY_PITCH - STOP_PITCH) * easeInOut(progress.current), 0, 0);
    if (progress.current !== target || Math.abs(wantX - offsetX.current) > 0.002) invalidate();
  });
  return null;
}

// ?debug: 1초마다 fps와 가장 길었던 한 프레임. React를 다시 그리지 않으려고 글자를 직접 바꾼다
function FpsProbe({ onSample }) {
  const acc = useRef({ frames: 0, time: 0, worst: 0 });
  useFrame((_, dt) => {
    const a = acc.current;
    a.frames += 1;
    a.time += dt;
    a.worst = Math.max(a.worst, dt);
    if (a.time < 1) return;
    const fps = Math.round(a.frames / a.time);
    const worst = Math.round(a.worst * 1000);
    onSample(fps, worst);
    Object.assign(a, { frames: 0, time: 0, worst: 0 });
  });
  return null;
}

// 처음 1초(셰이더 준비 등)는 빼고 그다음 3초 평균 fps를 한 번만 알린다. 2D로 내릴지는 App이 정한다.
// 탭이 숨겨졌다 돌아온 긴 공백(0.5초 넘는 프레임)은 느린 게 아니라 멈춘 것이라 세지 않는다
// 측정이 끝나면 "움직일 때만 그리기"로 바꾼다. 밤에 오래 켜 두는 화면이라 폰 배터리·발열을 아낀다.
// ?debug일 때는 fps를 계속 봐야 해서 계속 그린다
function PerfCheck({ onPerf, debug }) {
  const setFrameloop = useThree((state) => state.setFrameloop);
  const acc = useRef({ time: 0, frames: 0, done: false });
  useFrame((_, dt) => {
    const a = acc.current;
    if (a.done || dt > 0.5) return;
    a.time += dt;
    if (a.time < 1) return;
    a.frames += 1;
    if (a.time < 4) return;
    a.done = true;
    onPerf(Math.round(a.frames / (a.time - 1)));
    if (!debug) setFrameloop("demand");
  });
  return null;
}

// 측정용 가짜 별. 서버 별과 합쳐 300개를 채운다
function fillTo300(stars) {
  let seed = 11;
  const random = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const fake = Array.from({ length: Math.max(0, 300 - stars.length) }, () => ({
    x: Math.floor(random() * 1001),
    y: Math.floor(random() * 1001),
    hue: Math.floor(random() * 360),
  }));
  return [...stars, ...fake];
}

// 캔버스 안쪽. 화면 크기(useThree)를 알아야 카메라 자리를 정할 수 있어서 따로 둔다
function World({ up, stars, debug, onSample, onPerf }) {
  const eye = useEye();
  // 내 실루엣 위치. 걷기(Walker)가 바꾸고 카메라(CameraRig)가 읽는다
  const me = useRef(START.clone());
  return (
    <>
      <color attach="background" args={["#0e1530"]} />
      <fog attach="fog" args={["#0e1530", 12, 45]} />
      <ambientLight color="#3a4a7a" intensity={0.6} />
      <StopModel />
      <StarField stars={stars} origin={eye} pitch={SKY_PITCH} />
      <Walker active={!up} me={me} />
      <CameraRig up={up} eye={eye} me={me} />
      <PerfCheck onPerf={onPerf} debug={debug} />
      {debug && <FpsProbe onSample={onSample} />}
    </>
  );
}

export default function Stage3D({ scene, night, phase, debug, onReady, onPerf }) {
  const fpsText = useRef(null);
  function showFps(fps, worst) {
    fpsText.current.textContent = `${fps} fps · 가장 긴 프레임 ${worst}ms`;
  }
  const serverStars = useMemo(() => night?.stars ?? [], [night]);
  const stars = useMemo(() => (debug ? fillTo300(serverStars) : serverStars), [debug, serverStars]);

  return (
    <div className="three" aria-hidden="true">
      <Canvas
        flat
        dpr={[1, 1.5]}
        gl={{ antialias: false, powerPreference: "high-performance" }}
        camera={{ fov: 55, near: 0.1, far: 90 }}
        onCreated={({ gl }) => {
          // GPU가 캔버스를 빼앗기면(메모리 부족 등) 아주 느린 것과 같게 본다
          gl.domElement.addEventListener("webglcontextlost", () => onPerf(0));
          onReady();
        }}
      >
        <World
          up={scene === "sky"}
          // 다른 사람 별은 2D처럼 의식이 끝난 뒤에만. 입력하는 동안 글자를 가리지 않게
          stars={phase === "done" ? stars : NO_STARS}
          debug={debug}
          onSample={showFps}
          onPerf={onPerf}
        />
      </Canvas>
      {debug && <p className="three__fps" ref={fpsText} />}
    </div>
  );
}
