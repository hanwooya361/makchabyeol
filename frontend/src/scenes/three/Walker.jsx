import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Vector3 } from "three";
import Avatar from "./Avatar.jsx";

// 내 캐릭터와 걷기(T22, T22.2). 걷기는 장식이라 의식 로직과 상관없다:
// 걷지 않아도 별 띄우기·카드 찍기는 그대로다. 그래서 장면 안에서만 다룬다.
// 2단계(같이 있기)에서는 이 위치를 콜백으로 올려 서버에 보낸다

// 정류장 주변 인도 16m × 4.6m. 뒤판 양 끝으로 돌아 정류장 뒤까지 갈 수 있다. 연석(z 1.6) 너머는 차도
const AREA = { minX: -8, maxX: 8, minZ: -3, maxZ: 1.6 };
const BODY = 0.25; // 몸 반지름. 벽에 몸이 묻히지 않게 장애물을 이만큼 부풀린다
// 상자 장애물 [x1, x2, z1, z2]: 정류장 뒤판, 벤치(StopModel과 같은 자리)
const BOXES = [
  [-1.1, 2.3, -0.68, -0.62],
  [-0.4, 1.6, -0.5, -0.02],
];
// 원 장애물 [x, z]: 가로등, 정류장 기둥 둘
const POSTS = [
  [-2.1, 0.4],
  [-1.1, 0.6],
  [2.3, 0.6],
];
const POST_RADIUS = 0.08 + BODY;
// 버스 문 구역(T22.5): 문이 열려 있고 탈 수 있을 때만 앞문 앞(x 0.25~1.15)으로 버스 안(z 3.2)까지 열린다
const DOOR = { minX: 0.25, maxX: 1.15, maxZ: 3.2, inside: 2.0 };
const CURB = AREA.maxZ;
const BOARD_SPOT = { x: 0.7, z: 2.6 };
const OUT_SPOT_Z = 1.3; // 문이 닫히면 내려 주는 자리(문 앞 인도)
const SPEED = 1.6; // m/s, 천천히 걷는 걸음
export const START = new Vector3(0.6, 0, 1.0);

// 누르고 있는 동안 걷는 키: [오른쪽, 앞]
const KEYS = {
  KeyW: [0, 1],
  ArrowUp: [0, 1],
  KeyS: [0, -1],
  ArrowDown: [0, -1],
  KeyA: [-1, 0],
  ArrowLeft: [-1, 0],
  KeyD: [1, 0],
  ArrowRight: [1, 0],
};

// 구역 안으로, 장애물 밖으로. 벽에 부딪히면 덜 파고든 쪽으로 밀어내서 벽을 따라 미끄러진다
function resolve(p, open = false) {
  p.x = Math.min(AREA.maxX, Math.max(AREA.minX, p.x));
  const inDoor = open && p.x > DOOR.minX && p.x < DOOR.maxX;
  p.z = Math.min(inDoor ? DOOR.maxZ : AREA.maxZ, Math.max(AREA.minZ, p.z));
  // 버스 안에서는 옆 벽을 뚫고 나가지 않게 문 폭 안에 둔다
  if (p.z > CURB) p.x = Math.min(DOOR.maxX, Math.max(DOOR.minX, p.x));
  for (const [x1, x2, z1, z2] of BOXES) {
    const left = p.x - (x1 - BODY);
    const right = x2 + BODY - p.x;
    const back = p.z - (z1 - BODY);
    const front = z2 + BODY - p.z;
    if (left <= 0 || right <= 0 || back <= 0 || front <= 0) continue;
    const least = Math.min(left, right, back, front);
    if (least === left) p.x -= left;
    else if (least === right) p.x += right;
    else if (least === back) p.z -= back;
    else p.z += front;
  }
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

export default function Walker({
  active,
  me,
  doorOpen,
  canEnter,
  riding,
  boardRequest,
  onInBus,
  onAtDoor,
}) {
  const body = useRef(null);
  const ring = useRef(null);
  const target = useMemo(() => START.clone(), []);
  const held = useRef(new Set());
  const invalidate = useThree((state) => state.invalidate);
  // useFrame 안에서 최신 props를 보려고 담아 둔다
  const live = useRef({ doorOpen, canEnter, riding, onInBus, onAtDoor });
  const was = useRef({ inBus: false, atDoor: false });
  useEffect(() => {
    live.current = { doorOpen, canEnter, riding, onInBus, onAtDoor };
    invalidate();
  });

  function walkTo(point) {
    target.copy(resolve(new Vector3(point.x, 0, point.z), live.current.canEnter));
    ring.current.position.set(target.x, 0.08, target.z);
    ring.current.visible = true;
    invalidate();
  }

  // "버스 타기"를 누르면 알아서 버스 안까지 걸어 들어간다
  useEffect(() => {
    if (boardRequest > 0) walkTo(BOARD_SPOT);
    // walkTo는 매번 새로 만들어지지만 요청 번호가 바뀔 때만 걸어야 한다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardRequest]);

  // 카드를 찍으면 버스와 함께 떠나 화면에서 사라지고, 집에서 돌아오면 문 앞 인도에 다시 선다
  useEffect(() => {
    if (riding) return;
    if (me.current.z > CURB) {
      me.current.set(BOARD_SPOT.x, 0, OUT_SPOT_Z);
      target.copy(me.current);
      body.current.position.set(me.current.x, 0, me.current.z);
    }
    body.current.visible = true;
  }, [riding, me, target]);

  // 키는 누르고 있는 동안만 걷는다. 입력칸에 쓰는 중이거나 정류장이 아닐 때는 듣지 않는다
  useEffect(() => {
    const keys = held.current;
    if (!active) {
      keys.clear();
      return undefined;
    }
    function down(event) {
      if (!KEYS[event.code] || event.target.closest?.("input, textarea")) return;
      event.preventDefault(); // 방향키로 페이지가 스크롤되지 않게
      keys.add(event.code);
      invalidate();
    }
    function up(event) {
      keys.delete(event.code);
    }
    const clear = () => keys.clear(); // 다른 창으로 가면 손을 뗀 걸로
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", clear);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", clear);
    };
  }, [active, invalidate]);

  useFrame(({ camera }, dt) => {
    const p = me.current;
    const { canEnter: open, doorOpen: door, riding: away } = live.current;
    if (away) {
      body.current.visible = false; // 버스와 함께 떠났다
      return;
    }
    const step = SPEED * Math.min(dt, 1 / 30);
    const from = p.clone();

    // 키: 카메라가 보는 쪽이 앞(W). 카메라 회전은 YXZ 순서라 rotation.y가 좌우로 본 각도다
    let right = 0;
    let forward = 0;
    for (const code of held.current) {
      right += KEYS[code][0];
      forward += KEYS[code][1];
    }
    if (right || forward) {
      const yaw = camera.rotation.y;
      const move = new Vector3(
        Math.cos(yaw) * right - Math.sin(yaw) * forward,
        0,
        -Math.sin(yaw) * right - Math.cos(yaw) * forward,
      );
      p.addScaledVector(move.normalize(), step);
      resolve(p, open);
      target.copy(p); // 키로 걷기 시작하면 누른 곳 걷기는 그만
      ring.current.visible = false;
    } else {
      const to = target.clone().sub(p);
      const dist = to.length();
      if (dist >= 0.01) {
        p.addScaledVector(to, Math.min(dist, step) / dist);
        resolve(p, open);
      } else {
        ring.current.visible = false;
      }
      // 벽에 막혀 더 못 가면 거기서 멈춘다(제자리걸음으로 계속 그리지 않게)
      if (p.distanceToSquared(from) < 1e-8) target.copy(p);
    }

    // 문이 닫혔는데(또는 탈 수 없는데) 버스 안이면 태우지 않고 문 앞 인도로 내려 준다
    if (!open && p.z > CURB) {
      p.set(Math.min(DOOR.maxX, Math.max(DOOR.minX, p.x)), 0, OUT_SPOT_Z);
      target.copy(p);
    }

    // 버스 안에 들어왔는지·문 앞에 왔는지를 바뀔 때만 App에 알린다
    const inBus = p.z > DOOR.inside;
    if (inBus !== was.current.inBus) live.current.onInBus((was.current.inBus = inBus));
    const atDoor = door && !open && p.z > 1.45 && p.x > 0 && p.x < 1.4;
    if (atDoor && !was.current.atDoor) live.current.onAtDoor();
    was.current.atDoor = atDoor;

    if (p.distanceToSquared(from) < 1e-8) return; // 안 움직였으면 다시 그리지 않는다

    // 가는 쪽을 본다(가만히 있을 때 앞은 -z, 정류장 쪽). 걸음마다 아주 살짝 들썩인다
    const moved = p.clone().sub(from);
    if (moved.lengthSq() > 1e-8) body.current.rotation.y = Math.atan2(-moved.x, -moved.z);
    const bob = Math.abs(Math.sin(performance.now() / 160)) * 0.03;
    body.current.position.set(p.x, bob, p.z);
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
        <planeGeometry args={[40, 40]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* 내 캐릭터. 등을 카메라 쪽으로 두고 정류장을 본다 */}
      <group ref={body} position={START.toArray()}>
        <Avatar />
      </group>

      {/* 누른 곳 표시: 걸어가는 동안만 */}
      <mesh ref={ring} rotation-x={-Math.PI / 2} visible={false}>
        <ringGeometry args={[0.16, 0.2, 24]} />
        <meshBasicMaterial color="#f6c76b" transparent opacity={0.6} depthWrite={false} />
      </mesh>
    </group>
  );
}
