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
      {/* 바닥 */}
      <mesh rotation-x={-Math.PI / 2}>
        <planeGeometry args={[60, 60]} />
        <meshLambertMaterial color="#141c38" />
      </mesh>

      {/* 정류장: 지붕, 뒤판, 기둥 둘 */}
      <Block position={[0.6, 2.6, 0]} size={[3.6, 0.14, 1.5]} />
      <Block position={[0.6, 1.5, -0.65]} size={[3.4, 2.1, 0.06]} color="#18213c" />
      <Block position={[-1.1, 1.3, 0.6]} size={[0.1, 2.6, 0.1]} />
      <Block position={[2.3, 1.3, 0.6]} size={[0.1, 2.6, 0.1]} />

      {/* 전광판 틀. 글자는 HTML로 올린다(스크린리더·글자 크기) */}
      <Block position={[0.6, 2.95, 0.55]} size={[1.5, 0.42, 0.08]} />

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

      {/* 빛은 가로등 하나뿐. 그림자는 끔(폰 성능) */}
      <pointLight position={LAMP_POS} color={LAMP} intensity={9} distance={9} decay={1.6} />

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
      <mesh position={[LAMP_POS[0] + 0.3, 0.01, LAMP_POS[2]]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[4.5, 4.5]} />
        <meshBasicMaterial
          map={glow}
          color={LAMP}
          transparent
          opacity={0.35}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
