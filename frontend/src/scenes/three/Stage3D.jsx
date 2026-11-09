import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import StopModel from "./StopModel.jsx";
import StarField from "./StarField.jsx";
import Walker, { START } from "./Walker.jsx";
import CameraRig from "./CameraRig.jsx";
import Bus from "./Bus.jsx";
import { fovFor } from "./fov.js";
import "./Stage3D.css";

// 3D 정류장·밤하늘(T17 시험 제작). 2D 장면과 같은 값을 받아 그리기만 한다.
// 글자·버튼은 위에 겹친 2D 장면의 HTML이 맡고, 이 캔버스는 통째로 장식(aria-hidden)이다.
// 하늘 시점 각도는 CameraRig의 SKY_PITCH와 같아야 별 자리가 2D와 맞는다
const SKY_PITCH = 1.05;

const NO_STARS = [];

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

// 캔버스 안쪽(useFrame·useThree는 캔버스 안에서만 쓸 수 있어서 따로 둔다)
function World({ up, stars, bus, debug, onSample, onPerf, onLookUp }) {
  // 내 위치. 걷기(Walker)가 바꾸고 카메라(CameraRig)가 읽는다
  const me = useRef(START.clone());
  return (
    <>
      <color attach="background" args={["#0e1530"]} />
      <fog attach="fog" args={["#0e1530", 12, 45]} />
      <ambientLight color="#3a4a7a" intensity={0.6} />
      <StopModel />
      <StarField stars={stars} pitch={SKY_PITCH} />
      <Walker active={!up} me={me} />
      <Bus bus={bus} me={me} />
      <CameraRig up={up} me={me} onLookUp={onLookUp} />
      <PerfCheck onPerf={onPerf} debug={debug} />
      {debug && <FpsProbe onSample={onSample} />}
    </>
  );
}

export default function Stage3D({ scene, night, phase, bus, debug, onReady, onPerf, onLookUp }) {
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
        // 큰 모니터에서도 픽셀을 1.5배까지만 그린다(4K에서 GPU가 버거워지지 않게)
        dpr={[1, 1.5]}
        gl={{ antialias: false, powerPreference: "high-performance" }}
        camera={{ fov: fovFor(window.innerWidth / window.innerHeight), near: 0.1, far: 90 }}
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
          bus={bus}
          debug={debug}
          onSample={showFps}
          onPerf={onPerf}
          onLookUp={onLookUp}
        />
      </Canvas>
      {debug && <p className="three__fps" ref={fpsText} />}
    </div>
  );
}
