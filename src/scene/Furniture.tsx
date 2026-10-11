import { RoundedBox } from '@react-three/drei'
import { getMaterials } from './materials'
import { FakeShadow, Glow } from './primitives'

/** Ergonomic gaming chair, swivelled away from the desk as if someone just stood up. */
export function GamingChair() {
  const m = getMaterials()
  return (
    <group position={[-1.1, 0, -2.5]} rotation={[0, Math.PI - 0.55, 0]}>
      {/* Five-star base with casters */}
      {Array.from({ length: 5 }, (_, i) => {
        const a = (i / 5) * Math.PI * 2
        return (
          <group key={i} rotation={[0, a, 0]}>
            <mesh position={[0, 0.08, 0.16]} rotation={[0.08, 0, 0]} material={m.metalDark} castShadow>
              <boxGeometry args={[0.05, 0.035, 0.32]} />
            </mesh>
            <mesh position={[0, 0.03, 0.31]} material={m.rubber}>
              <sphereGeometry args={[0.03, 12, 10]} />
            </mesh>
          </group>
        )
      })}
      <mesh position={[0, 0.1, 0]} material={m.metalDark}>
        <cylinderGeometry args={[0.06, 0.07, 0.05, 20]} />
      </mesh>
      <mesh position={[0, 0.27, 0]} material={m.metalSatin} castShadow>
        <cylinderGeometry args={[0.025, 0.025, 0.3, 14]} />
      </mesh>
      <mesh position={[0, 0.2, 0]} material={m.plasticBlack}>
        <cylinderGeometry args={[0.04, 0.045, 0.14, 14]} />
      </mesh>
      {/* Seat */}
      <RoundedBox args={[0.54, 0.1, 0.52]} radius={0.04} smoothness={3} position={[0, 0.47, 0]} material={m.leather} castShadow receiveShadow />
      {[-1, 1].map((s) => (
        <RoundedBox key={s} args={[0.08, 0.06, 0.48]} radius={0.025} smoothness={2} position={[s * 0.24, 0.53, 0]} material={m.fabricAccent} castShadow />
      ))}
      {/* Backrest */}
      <group position={[0, 0.94, -0.26]} rotation={[-0.14, 0, 0]}>
        <RoundedBox args={[0.52, 0.82, 0.1]} radius={0.045} smoothness={3} material={m.leather} castShadow receiveShadow />
        {[-1, 1].map((s) => (
          <RoundedBox key={s} args={[0.07, 0.74, 0.03]} radius={0.012} smoothness={2} position={[s * 0.16, -0.02, 0.05]} material={m.fabricAccent} />
        ))}
        <RoundedBox args={[0.28, 0.12, 0.07]} radius={0.03} smoothness={2} position={[0, 0.29, 0.07]} material={m.fabricDark} castShadow />
        <RoundedBox args={[0.3, 0.14, 0.07]} radius={0.035} smoothness={2} position={[0, -0.22, 0.07]} material={m.fabricDark} />
      </group>
      {/* Armrests */}
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 0.31, 0, -0.02]}>
          <mesh position={[0, 0.58, 0]} material={m.metalDark} castShadow>
            <boxGeometry args={[0.035, 0.2, 0.05]} />
          </mesh>
          <RoundedBox args={[0.075, 0.035, 0.27]} radius={0.015} smoothness={2} position={[0, 0.69, 0.02]} material={m.plasticBlack} castShadow />
        </group>
      ))}
      <FakeShadow position={[0, 0.006, 0]} scale={[0.95, 0.95]} opacity={0.5} />
    </group>
  )
}

export function Beanbag() {
  const m = getMaterials()
  return (
    <group position={[3.05, 0, 1.05]}>
      <mesh position={[0, 0.26, 0]} scale={[0.5, 0.3, 0.48]} material={m.beanbag} castShadow receiveShadow>
        <sphereGeometry args={[1, 32, 20]} />
      </mesh>
      <mesh position={[-0.1, 0.42, 0.18]} scale={[0.3, 0.16, 0.24]} rotation={[0.3, 0, 0]} material={m.beanbag} castShadow>
        <sphereGeometry args={[1, 24, 16]} />
      </mesh>
      {/* Game controller left on the beanbag */}
      <group position={[0.05, 0.56, 0.12]} rotation={[0.25, 0.6, 0]}>
        <RoundedBox args={[0.14, 0.03, 0.08]} radius={0.012} smoothness={2} material={m.plasticBlack} castShadow />
        <mesh position={[0, 0.016, 0.0]} material={m.ledBlue}>
          <boxGeometry args={[0.04, 0.003, 0.005]} />
        </mesh>
      </group>
      <FakeShadow position={[0, 0.006, 0]} scale={[1.3, 1.25]} opacity={0.55} />
    </group>
  )
}

export function FloorLamp() {
  const m = getMaterials()
  return (
    <group position={[-3.5, 0, 1.35]}>
      <mesh position={[0, 0.015, 0]} material={m.metalDark} castShadow>
        <cylinderGeometry args={[0.16, 0.17, 0.03, 32]} />
      </mesh>
      <mesh position={[0, 0.8, 0]} material={m.metalSatin} castShadow>
        <cylinderGeometry args={[0.012, 0.012, 1.55, 12]} />
      </mesh>
      <mesh position={[0, 1.62, 0]} castShadow>
        <cylinderGeometry args={[0.17, 0.23, 0.3, 32, 1, true]} />
        <meshStandardMaterial color="#f1dcc0" emissive="#ffae5e" emissiveIntensity={0.9} roughness={0.9} side={2} />
      </mesh>
      <Glow position={[0.02, 1.6, 0]} rotation={[0, Math.PI / 2, 0]} scale={[1.6, 1.4]} color="#ffb070" opacity={0.25} />
      <FakeShadow position={[0, 0.006, 0]} scale={[0.6, 0.6]} />
    </group>
  )
}
