import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Vector3 } from "three";
import StopModel from "./StopModel.jsx";
import StarField from "./StarField.jsx";
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

// 카메라는 한자리에서 고개만 든다
function CameraRig({ up, eye }) {
  const progress = useRef(up ? 1 : 0);

  useFrame(({ camera }, dt) => {
    const target = up ? 1 : 0;
    const step = Math.min(Math.abs(target - progress.current), dt / TILT_SECONDS);
    progress.current += Math.sign(target - progress.current) * step;
    camera.position.copy(eye);
    camera.rotation.set(STOP_PITCH + (SKY_PITCH - STOP_PITCH) * easeInOut(progress.current), 0, 0);
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
function World({ up, stars, showMine, debug, onSample }) {
  const eye = useEye();
  return (
    <>
      <color attach="background" args={["#0e1530"]} />
      <fog attach="fog" args={["#0e1530", 12, 45]} />
      <ambientLight color="#3a4a7a" intensity={0.6} />
      <StopModel />
      <StarField stars={stars} showMine={showMine} origin={eye} pitch={SKY_PITCH} />
      <CameraRig up={up} eye={eye} />
      {debug && <FpsProbe onSample={onSample} />}
    </>
  );
}

export default function Stage3D({ scene, night, released, phase, debug, onReady }) {
  const fpsText = useRef(null);
  function showFps(fps, worst) {
    fpsText.current.textContent = `${fps} fps · 가장 긴 프레임 ${worst}ms`;
    window.__fps = { fps, worst }; // 헤드리스 측정이 읽어 간다
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
        onCreated={onReady}
      >
        <World
          up={scene === "sky"}
          // 다른 사람 별은 2D처럼 의식이 끝난 뒤에만. 입력하는 동안 글자를 가리지 않게
          stars={phase === "done" ? stars : NO_STARS}
          showMine={released && phase === "done"}
          debug={debug}
          onSample={showFps}
        />
      </Canvas>
      {debug && <p className="three__fps" ref={fpsText} />}
    </div>
  );
}
