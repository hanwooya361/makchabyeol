import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { MeshLambertMaterial } from "three";

// 5분마다 오는 버스(T22.4). 시간표는 App(lib/bus.js)이 정해 props로 주고, 여기서는 그 시각에 맞춰
// 들어오고·서고·떠나는 모습만 그린다. 기본 도형만. 앞은 -x(오른쪽에서 들어와 왼쪽으로 떠남)
const STOP_X = 4.1; // 앞문이 정류장 앞(x 0.6)에 오는 자리
const ROAD_Z = 3.15; // 연석(z 1.85) 바로 바깥 차도
const DRIVE_MS = 6000; // 들어오는 데·떠나는 데 걸리는 시간
const DRIVE_DIST = 45;
const DOOR = { open: 1500, closeBefore: 2000 }; // 서고 1.5초 뒤 열리고, 떠나기 2초 전 닫힘

function easeOut(t) {
  return 1 - (1 - t) ** 3;
}

// 이 시각에 버스가 어디 있는지. 이번 도착과 바로 전 도착을 둘 다 봐야 떠나는 모습이 끊기지 않는다
function poseAt(now, arriveAt, dwellMs, intervalMs) {
  for (const arrival of [arriveAt, arriveAt - intervalMs]) {
    const t = now - arrival;
    if (t >= -DRIVE_MS && t < 0) {
      return {
        x: STOP_X + DRIVE_DIST * (1 - easeOut((t + DRIVE_MS) / DRIVE_MS)),
        open: false,
        moving: true,
      };
    }
    if (t >= 0 && t < dwellMs) {
      return { x: STOP_X, open: t > DOOR.open && t < dwellMs - DOOR.closeBefore, moving: false };
    }
    if (t >= dwellMs && t < dwellMs + DRIVE_MS) {
      const k = (t - dwellMs) / DRIVE_MS;
      return { x: STOP_X - DRIVE_DIST * k * k, open: false, moving: true };
    }
  }
  return null; // 지금은 버스가 없다
}

function makeMaterials() {
  return {
    body: new MeshLambertMaterial({ color: "#3f7a63", flatShading: true, transparent: true }),
    dark: new MeshLambertMaterial({ color: "#1b2233", flatShading: true, transparent: true }),
    // 안에서 새어 나오는 따뜻한 불빛
    window: new MeshLambertMaterial({
      color: "#3a3326",
      emissive: "#ffd89a",
      emissiveIntensity: 0.4,
      transparent: true,
    }),
    light: new MeshLambertMaterial({ color: "#fff4d6", emissive: "#fff4d6", transparent: true }),
  };
}

// 재질은 버스 하나에 한 벌. 매 프레임 투명도만 바꿔 쓴다(카메라와 캐릭터 사이에 오면 옅게)
const mats = makeMaterials();

function Box({ position, size, material }) {
  return (
    <mesh position={position} material={material}>
      <boxGeometry args={size} />
    </mesh>
  );
}

export default function Bus({ bus, me }) {
  const root = useRef(null);
  const door = useRef(null);
  const invalidate = useThree((state) => state.invalidate);

  // 시간표 시계: 1초에 한 번 그려서 버스가 올 때를 놓치지 않는다(움직이는 동안은 매 프레임)
  useEffect(() => {
    const id = setInterval(invalidate, 1000);
    return () => clearInterval(id);
  }, [invalidate]);

  useFrame(({ camera }) => {
    const pose = poseAt(Date.now(), bus.arriveAt, bus.dwellMs, bus.intervalMs);
    root.current.visible = Boolean(pose);
    if (!pose) return;
    root.current.position.x = pose.x;
    door.current.visible = !pose.open; // 열리면 문짝이 사라지고 안쪽 불빛이 보인다

    // 카메라가 버스 너머(차도 쪽)에서 정류장 쪽 캐릭터를 보면 버스가 가린다. 그때는 윤곽만 남게
    // 아주 옅게 하고 창문 불빛도 줄인다(화면 전체가 뿌옇게 덮이지 않게)
    const blocking = camera.position.z > ROAD_Z - 1.2 && me.current.z < ROAD_Z - 1.2;
    for (const m of Object.values(mats)) {
      m.opacity = blocking ? 0.1 : 1;
      m.depthWrite = !blocking;
    }
    mats.window.emissiveIntensity = blocking ? 0.1 : 0.4;
    if (pose.moving) invalidate();
  });

  return (
    <group ref={root} position={[STOP_X, 0, ROAD_Z]} visible={false}>
      {/* 차체(길이 9m, 폭 2.4m), 아래 검은 띠, 지붕 */}
      <Box position={[0, 1.7, 0]} size={[9, 2.4, 2.4]} material={mats.body} />
      <Box position={[0, 0.45, 0]} size={[9, 0.3, 2.3]} material={mats.dark} />
      {/* 옆 창문: 양쪽에 4장씩 따로 붙여 사이로 차체 색이 보이게. 앞유리 */}
      {[-1.9, -0.2, 1.5, 3.2].map((x) =>
        [-1.215, 1.215].map((z) => (
          <Box
            key={`${x}${z}`}
            position={[x, 2.15, z]}
            size={[1.4, 0.85, 0.03]}
            material={mats.window}
          />
        )),
      )}
      <Box position={[-4.51, 2.0, 0]} size={[0.04, 1.3, 2.1]} material={mats.window} />
      {/* 앞문(정류장 쪽 -z 면). 닫혀 있을 때만 보이는 문짝, 열리면 그 자리의 불빛 */}
      <Box position={[-3.4, 1.35, -1.215]} size={[1.0, 2.0, 0.03]} material={mats.window} />
      <mesh ref={door} position={[-3.4, 1.35, -1.23]} material={mats.dark}>
        <boxGeometry args={[1.0, 2.0, 0.03]} />
      </mesh>
      {/* 바퀴 넷 */}
      {[-3, 3].map((x) =>
        [-1.2, 1.2].map((z) => (
          <mesh
            key={`${x}${z}`}
            position={[x, 0.45, z]}
            rotation-x={Math.PI / 2}
            material={mats.dark}
          >
            <cylinderGeometry args={[0.45, 0.45, 0.3, 10]} />
          </mesh>
        )),
      )}
      {/* 전조등 */}
      <Box position={[-4.52, 0.85, -0.8]} size={[0.04, 0.2, 0.35]} material={mats.light} />
      <Box position={[-4.52, 0.85, 0.8]} size={[0.04, 0.2, 0.35]} material={mats.light} />
    </group>
  );
}
