import { useMemo } from "react";
import { AdditiveBlending } from "three";
import { makeGlowTexture } from "./glow.js";

// 정류장 실루엣. 2D SVG와 같은 구성(지붕·측면 판·기둥·벤치·가로등)을 기본 도형으로만 쌓는다.
// 외부 모델 파일 없음(docs/tech-design.md 8장). 단위는 대략 미터
const SHADOW = "#1f2a44";
const LAMP = "#f6c76b";
const LAMP_POS = [-2.1, 3.1, 0.4];

function Block({ position, size, color = SHADOW }) {
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshLambertMaterial color={color} flatShading />
    </mesh>
  );
}

export default function StopModel() {
  const glow = useMemo(() => makeGlowTexture(), []);

  return (
    <group>
      {/* 바닥: 멀리까지 차도, 정류장이 선 보도, 그 사이 연석. 정류장이 "길가"에 서 있게 */}
      <mesh rotation-x={-Math.PI / 2}>
        <planeGeometry args={[60, 60]} />
        <meshLambertMaterial color="#161f45" />
      </mesh>
      <Block position={[0, 0.03, -0.6]} size={[60, 0.06, 4.8]} color="#232c50" />
      <Block position={[0, 0.06, 1.85]} size={[60, 0.12, 0.16]} color="#3a4569" />

      {/* 정류장: 지붕, 뒤판, 기둥 둘 */}
      <Block position={[0.6, 2.6, 0]} size={[3.6, 0.14, 1.5]} />
      {/* 뒤판은 유리. 캐릭터가 정류장 뒤로 돌아가도 카메라에서 보이게(T22.2) */}
      <mesh position={[0.6, 1.5, -0.65]}>
        <boxGeometry args={[3.4, 2.1, 0.06]} />
        <meshLambertMaterial color="#3a4f86" transparent opacity={0.28} depthWrite={false} />
      </mesh>
      <Block position={[-1.1, 1.3, 0.6]} size={[0.1, 2.6, 0.1]} />
      <Block position={[2.3, 1.3, 0.6]} size={[0.1, 2.6, 0.1]} />

      {/* 전광판은 3D로 만들지 않는다. 위에 얹힌 HTML 전광판("막차까지 ∞분")이 그 자리다.
          3D 틀을 따로 두면 화면 비율마다 HTML 글자와 어긋나 빈 상자처럼 보였다(T17) */}

      {/* 벤치: 앉는 판, 등받이, 다리 */}
      <Block position={[0.6, 0.48, -0.25]} size={[2, 0.08, 0.45]} />
      <Block position={[0.6, 0.85, -0.47]} size={[2, 0.35, 0.06]} />
      <Block position={[-0.25, 0.22, -0.25]} size={[0.08, 0.44, 0.4]} />
      <Block position={[1.45, 0.22, -0.25]} size={[0.08, 0.44, 0.4]} />

      {/* 가로등: 기둥, 갓, 전구 */}
      <mesh position={[LAMP_POS[0], LAMP_POS[1] / 2, LAMP_POS[2]]}>
        <cylinderGeometry args={[0.05, 0.07, LAMP_POS[1], 6]} />
        <meshLambertMaterial color={SHADOW} flatShading />
      </mesh>
      <mesh position={[LAMP_POS[0], LAMP_POS[1] + 0.12, LAMP_POS[2]]}>
        <coneGeometry args={[0.32, 0.22, 6]} />
        <meshLambertMaterial color={SHADOW} flatShading />
      </mesh>
      <mesh position={LAMP_POS}>
        <icosahedronGeometry args={[0.1, 0]} />
        <meshBasicMaterial color="#fff4d6" />
      </mesh>

      {/* 따뜻한 빛은 가로등 하나뿐. 지붕 밑 벤치까지 닿게 범위를 잡는다. 그림자는 끔(폰 성능) */}
      <pointLight position={LAMP_POS} color={LAMP} intensity={14} distance={12} decay={1.4} />
      {/* 아주 약한 푸른 달빛. 지붕·기둥 모서리가 밤하늘과 구분될 만큼만 */}
      <directionalLight position={[6, 10, 4]} color="#8fa4d8" intensity={0.35} />

      {/* 전구 후광과 바닥에 번지는 빛. 더해 그리기라 어두운 데서만 밝아 보인다 */}
      <sprite position={LAMP_POS} scale={1.6}>
        <spriteMaterial
          map={glow}
          color={LAMP}
          transparent
          opacity={0.55}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </sprite>
      {/* 낮은 카메라에서는 바닥 빛이 납작하게 눌려 보여서 카메라 쪽으로 길게 늘인다 */}
      <mesh position={[LAMP_POS[0] + 0.6, 0.07, 1.6]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[6, 9]} />
        <meshBasicMaterial
          map={glow}
          color={LAMP}
          transparent
          opacity={0.45}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
