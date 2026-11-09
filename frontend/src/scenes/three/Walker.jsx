import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Vector3 } from "three";

// 내 실루엣과 "누른 곳으로 걷기"(T22). 걷기는 장식이라 의식 로직과 상관없다:
// 걷지 않아도 카드 찍기·별 띄우기는 그대로다. 그래서 장면 안에서만 다룬다.
// 2단계(같이 있기)에서는 이 위치를 콜백으로 올려 서버에 보낸다

// 정류장 앞 보도 안에서만. 벤치 앞(z 0.15)부터 연석 전(z 1.6)까지
const AREA = { minX: -2.8, maxX: 3.0, minZ: 0.15, maxZ: 1.6 };
// 지나가면 안 되는 기둥들(가로등, 정류장 기둥 둘): [x, z]
const POSTS = [
  [-2.1, 0.4],
  [-1.1, 0.6],
  [2.3, 0.6],
];
const POST_RADIUS = 0.3;
const SPEED = 1.3; // m/s, 천천히 걷는 걸음
const KEY_STEP = 0.8;
export const START = new Vector3(0.6, 0, 1.0);

function clampToArea(p) {
  p.x = Math.min(AREA.maxX, Math.max(AREA.minX, p.x));
  p.z = Math.min(AREA.maxZ, Math.max(AREA.minZ, p.z));
  return p;
}

// 기둥 안으로 들어갔으면 기둥 둘레로 밀어낸다
function pushOutOfPosts(p) {
  for (const [x, z] of POSTS) {
    const dx = p.x - x;
    const dz = p.z - z;
    const d = Math.hypot(dx, dz);
    if (d >= POST_RADIUS) continue;
    if (d === 0) {
      p.x = x + POST_RADIUS; // 정확히 한가운데면 오른쪽으로
    } else {
      p.x = x + (dx / d) * POST_RADIUS;
      p.z = z + (dz / d) * POST_RADIUS;
    }
  }
  return p;
}

export default function Walker({ active, me }) {
  const body = useRef(null);
  const ring = useRef(null);
  const target = useMemo(() => START.clone(), []);
  const invalidate = useThree((state) => state.invalidate);

  function walkTo(point) {
    target.copy(pushOutOfPosts(clampToArea(new Vector3(point.x, 0, point.z))));
    ring.current.position.set(target.x, 0.08, target.z);
    ring.current.visible = true;
    invalidate();
  }

  // 키보드로도 걸을 수 있게. 입력칸에 쓰는 중이거나 정류장이 아닐 때는 듣지 않는다
  useEffect(() => {
    if (!active) return undefined;
    const dirs = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
    function onKey(event) {
      const dir = dirs[event.key];
      if (!dir || event.target.closest?.("input, textarea")) return;
      event.preventDefault();
      walkTo({ x: me.current.x + dir[0] * KEY_STEP, z: me.current.z + dir[1] * KEY_STEP });
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  useFrame((_, dt) => {
    const p = me.current;
    const to = target.clone().sub(p);
    const dist = to.length();
    if (dist < 0.01) {
      ring.current.visible = false;
      return;
    }
    const step = Math.min(dist, SPEED * Math.min(dt, 1 / 30));
    p.add(to.multiplyScalar(step / dist));
    pushOutOfPosts(p);
    // 가는 쪽을 본다(가만히 있을 때 앞은 -z, 정류장 쪽). 걸음마다 아주 살짝 들썩인다
    const bob = Math.abs(Math.sin(performance.now() / 160)) * 0.03;
    body.current.position.set(p.x, bob, p.z);
    body.current.rotation.y = Math.atan2(-(target.x - p.x), -(target.z - p.z));
    invalidate();
  });

  return (
    <group>
      {/* 바닥 어디를 눌러도 받는다(보이지 않는 판). 구역 밖을 누르면 가장 가까운 안쪽으로 */}
      <mesh
        rotation-x={-Math.PI / 2}
        position={[0, 0.08, 0]}
        onClick={(event) => {
          // 끌어서 카메라를 돌린 뒤 손을 뗀 건 탭이 아니다(8px, CameraRig와 같은 기준)
          if (!active || event.delta > 8) return;
          event.stopPropagation();
          walkTo(event.point);
        }}
      >
        <planeGeometry args={[30, 30]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* 실루엣: 몸통(캡슐)과 머리. 등을 카메라 쪽으로 두고 정류장을 본다 */}
      <group ref={body} position={START.toArray()}>
        <mesh position={[0, 0.55, 0]}>
          <capsuleGeometry args={[0.17, 0.62, 3, 8]} />
          <meshLambertMaterial color="#0b1024" flatShading />
        </mesh>
        <mesh position={[0, 1.22, 0]}>
          <icosahedronGeometry args={[0.15, 1]} />
          <meshLambertMaterial color="#0b1024" flatShading />
        </mesh>
      </group>

      {/* 누른 곳 표시: 걸어가는 동안만 */}
      <mesh ref={ring} rotation-x={-Math.PI / 2} visible={false}>
        <ringGeometry args={[0.16, 0.2, 24]} />
        <meshBasicMaterial color="#f6c76b" transparent opacity={0.6} depthWrite={false} />
      </mesh>
    </group>
  );
}
