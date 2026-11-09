import { useLayoutEffect, useMemo, useRef } from "react";
import { useThree } from "@react-three/fiber";
import { AdditiveBlending, Color, Euler, Object3D, SRGBColorSpace, Vector3 } from "three";
import { makeGlowTexture } from "./glow.js";

const RADIUS = 30;
const MAX_STARS = 300; // 서버가 내려주는 최대치(StarService.MAX_STARS)
const BACKGROUND_STARS = 500;

// 서버 좌표(천분율, 화면 기준)를 "하늘을 올려다본 카메라 화면"의 같은 자리로 옮긴다.
// 2D에서 같은 별이 같은 자리에 뜨던 약속을 지킨다. 각도로 나누면 머리 위에서 별이 한데 몰려서
// 카메라 앞 평면의 화면 좌표로 방향을 만든 뒤 하늘을 보는 만큼 돌린다
function skyPoint(x, y, origin, pitch, hfov, vfov) {
  const dx = (x / 500 - 1) * Math.tan(hfov / 2) * 0.92;
  const dy = (1 - y / 500) * Math.tan(vfov / 2) * 0.92;
  return new Vector3(dx, dy, -1)
    .normalize()
    .applyEuler(new Euler(pitch, 0, 0))
    .multiplyScalar(RADIUS)
    .add(origin);
}

// 같은 하늘이 매번 같게 보이도록 고정 씨앗으로 섞는다
function seeded(seed) {
  return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
}

function useFov() {
  const { camera, size } = useThree();
  const vfov = (camera.fov * Math.PI) / 180;
  return { vfov, hfov: 2 * Math.atan(Math.tan(vfov / 2) * (size.width / size.height)) };
}

function BackgroundStars({ origin }) {
  const positions = useMemo(() => {
    const random = seeded(7);
    const out = new Float32Array(BACKGROUND_STARS * 3);
    for (let i = 0; i < BACKGROUND_STARS; i++) {
      const yaw = random() * Math.PI * 2;
      const p = 0.08 + random() * 1.45; // 지평선 바로 위부터 머리 위까지
      out.set(
        [
          Math.sin(yaw) * Math.cos(p) * 40 + origin.x,
          Math.sin(p) * 40,
          -Math.cos(yaw) * Math.cos(p) * 40,
        ],
        i * 3,
      );
    }
    return out;
  }, [origin]);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#fff4d6"
        size={1.6}
        sizeAttenuation={false}
        transparent
        opacity={0.7}
        fog={false}
      />
    </points>
  );
}

// 다른 사람 별: 빛만. 300개를 InstancedMesh 하나로 그려 그리기 호출이 1번이다
function OtherStars({ stars, origin, pitch }) {
  const mesh = useRef(null);
  const { hfov, vfov } = useFov();

  useLayoutEffect(() => {
    const dummy = new Object3D();
    const color = new Color();
    stars.slice(0, MAX_STARS).forEach((star, i) => {
      dummy.position.copy(skyPoint(star.x, star.y, origin, pitch, hfov, vfov));
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
      // 2D와 같은 hsl(hue 70% 88%)
      mesh.current.setColorAt(i, color.setHSL(star.hue / 360, 0.7, 0.88, SRGBColorSpace));
    });
    mesh.current.count = Math.min(stars.length, MAX_STARS);
    mesh.current.instanceMatrix.needsUpdate = true;
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
  }, [stars, origin, pitch, hfov, vfov]);

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, MAX_STARS]} frustumCulled={false}>
      <icosahedronGeometry args={[0.08, 0]} />
      <meshBasicMaterial fog={false} />
    </instancedMesh>
  );
}

// 내 별: 2D와 같은 자리(가로 가운데, 위에서 22%)
function MyStar({ origin, pitch }) {
  const glow = useMemo(() => makeGlowTexture(), []);
  const { hfov, vfov } = useFov();
  const position = useMemo(
    () => skyPoint(500, 220, origin, pitch, hfov, vfov),
    [origin, pitch, hfov, vfov],
  );

  return (
    <group position={position}>
      <mesh>
        <icosahedronGeometry args={[0.16, 0]} />
        <meshBasicMaterial color="#fff4d6" fog={false} />
      </mesh>
      <sprite scale={1.6}>
        <spriteMaterial
          map={glow}
          color="#fff4d6"
          transparent
          opacity={0.6}
          blending={AdditiveBlending}
          depthWrite={false}
          fog={false}
        />
      </sprite>
    </group>
  );
}

export default function StarField({ stars, showMine, origin, pitch }) {
  return (
    <group>
      <BackgroundStars origin={origin} />
      <OtherStars stars={stars} origin={origin} pitch={pitch} />
      {showMine && <MyStar origin={origin} pitch={pitch} />}
    </group>
  );
}
