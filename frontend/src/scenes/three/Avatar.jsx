// 머리 큰 로우폴리 캐릭터(T22.3). 기본 도형만, 외부 모델 없음.
// 옷 색만 props로 받아서 2단계(T26) 다른 사람 아바타에 그대로 쓴다. 앞은 -z(가만히 있을 때 정류장 쪽).
// 밤이라 가로등 빛을 받으면 보이도록 옷·얼굴을 밝은 색으로 두고, 가로등을 등져도 형태가 묻히지 않게
// 제 색을 아주 조금 스스로 낸다(GLOW)
const SKIN = "#f3d6bd";
const HAIR = "#3b2a2a";
const PANTS = "#2e3658";
const EYE = "#1a1420";
const GLOW = 0.22;

function Part({ position, rotation, children, color }) {
  return (
    <mesh position={position} rotation={rotation}>
      {children}
      <meshLambertMaterial color={color} emissive={color} emissiveIntensity={GLOW} flatShading />
    </mesh>
  );
}

export default function Avatar({ color = "#9cc3e6" }) {
  return (
    <group>
      {/* 다리 */}
      <Part position={[-0.08, 0.13, 0]} color={PANTS}>
        <cylinderGeometry args={[0.055, 0.06, 0.26, 6]} />
      </Part>
      <Part position={[0.08, 0.13, 0]} color={PANTS}>
        <cylinderGeometry args={[0.055, 0.06, 0.26, 6]} />
      </Part>

      {/* 몸통: 아래가 넓은 원뿔대 */}
      <Part position={[0, 0.44, 0]} color={color}>
        <cylinderGeometry args={[0.15, 0.23, 0.38, 8]} />
      </Part>

      {/* 팔: 몸통 옆으로 살짝 벌어진 캡슐 */}
      <Part position={[-0.24, 0.42, 0]} rotation={[0, 0, -0.3]} color={color}>
        <capsuleGeometry args={[0.05, 0.18, 2, 6]} />
      </Part>
      <Part position={[0.24, 0.42, 0]} rotation={[0, 0, 0.3]} color={color}>
        <capsuleGeometry args={[0.05, 0.18, 2, 6]} />
      </Part>

      {/* 머리: 몸보다 크게 */}
      <Part position={[0, 0.9, 0]} color={SKIN}>
        <icosahedronGeometry args={[0.3, 1]} />
      </Part>

      {/* 머리카락: 정수리를 덮는 반구 + 뒤통수를 덮는 반구. 뒤에서 보면 머리카락만 보인다 */}
      <Part position={[0, 0.94, 0.02]} color={HAIR}>
        <sphereGeometry args={[0.32, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </Part>
      <Part position={[0, 0.9, 0.03]} rotation={[Math.PI / 2, 0, 0]} color={HAIR}>
        <sphereGeometry args={[0.315, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </Part>

      {/* 눈: 얼굴 앞(-z) */}
      <Part position={[-0.1, 0.88, -0.27]} color={EYE}>
        <sphereGeometry args={[0.035, 6, 4]} />
      </Part>
      <Part position={[0.1, 0.88, -0.27]} color={EYE}>
        <sphereGeometry args={[0.035, 6, 4]} />
      </Part>
    </group>
  );
}
