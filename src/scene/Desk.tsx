import { useEffect, useMemo, useRef } from 'react'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { getMaterials } from './materials'
import { DESK } from './layout'
import { FakeShadow, Glow } from './primitives'

const TOP = DESK.height

/** Desk frame, drawer unit and under-desk LED. */
export function Desk() {
  const m = getMaterials()
  const halfW = DESK.width / 2
  const legH = TOP - 0.045
  return (
    <group>
      <RoundedBox
        args={[DESK.width, 0.045, DESK.depth]}
        radius={0.015}
        smoothness={3}
        position={[DESK.x, TOP - 0.0225, DESK.z]}
        material={m.woodWalnut}
        castShadow
        receiveShadow
      />
      {/* Side frames */}
      {[-1, 1].map((side) => {
        const x = DESK.x + side * (halfW - 0.12)
        return (
          <group key={side} position={[x, 0, DESK.z]}>
            {[-1, 1].map((f) => (
              <mesh key={f} position={[0, legH / 2, f * (DESK.depth / 2 - 0.08)]} material={m.metalDark} castShadow>
                <boxGeometry args={[0.05, legH, 0.05]} />
              </mesh>
            ))}
            <mesh position={[0, 0.02, 0]} material={m.metalDark} castShadow>
              <boxGeometry args={[0.06, 0.04, DESK.depth - 0.06]} />
            </mesh>
            <mesh position={[0, legH - 0.03, 0]} material={m.metalDark}>
              <boxGeometry args={[0.05, 0.04, DESK.depth - 0.12]} />
            </mesh>
          </group>
        )
      })}
      {/* Rear cross bar & cable tray */}
      <mesh position={[DESK.x, TOP - 0.12, DESK.z - DESK.depth / 2 + 0.1]} material={m.metalDark}>
        <boxGeometry args={[DESK.width - 0.3, 0.06, 0.12]} />
      </mesh>
      {/* Drawer unit */}
      <group position={[DESK.x - halfW + 0.42, 0, DESK.z + 0.02]}>
        <RoundedBox args={[0.46, 0.6, 0.62]} radius={0.012} smoothness={2} position={[0, 0.32, 0]} material={m.woodDark} castShadow receiveShadow />
        {[0.48, 0.3, 0.12].map((y) => (
          <group key={y}>
            <mesh position={[0, y + 0.02, 0.315]} material={m.trim}>
              <boxGeometry args={[0.42, 0.005, 0.005]} />
            </mesh>
            <mesh position={[0, y + 0.07, 0.318]} material={m.metalSatin}>
              <boxGeometry args={[0.12, 0.012, 0.012]} />
            </mesh>
          </group>
        ))}
      </group>
      {/* Under-desk LED strip */}
      <mesh position={[DESK.x, TOP - 0.05, DESK.z + DESK.depth / 2 - 0.03]} material={m.ledCyan}>
        <boxGeometry args={[DESK.width - 0.3, 0.008, 0.008]} />
      </mesh>
      <Glow position={[DESK.x, 0.008, DESK.z + 0.25]} rotation={[-Math.PI / 2, 0, 0]} scale={[3.2, 1.4]} color="#22d3ee" opacity={0.14} />
      <FakeShadow position={[DESK.x, 0.006, DESK.z]} scale={[3.4, 1.4]} opacity={0.45} />
    </group>
  )
}

/** Mechanical keyboard with instanced keycaps, mouse and mousepad. */
export function KeyboardAndMouse() {
  const m = getMaterials()
  const keysRef = useRef<THREE.InstancedMesh>(null)
  const ROWS = 5
  const COLS = 15
  const keyGeo = useMemo(() => new THREE.BoxGeometry(0.023, 0.012, 0.023), [])
  const keyMat = useMemo(() => new THREE.MeshStandardMaterial({ roughness: 0.55, metalness: 0.05 }), [])

  useEffect(() => {
    const mesh = keysRef.current
    if (!mesh) return
    const mtx = new THREE.Matrix4()
    const base = new THREE.Color('#1f2433')
    const accentViolet = new THREE.Color('#5b3fd9')
    const accentCyan = new THREE.Color('#1cb5cf')
    let i = 0
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        mtx.makeTranslation(-0.1925 + c * 0.0275, 0, -0.055 + r * 0.0275)
        mesh.setMatrixAt(i, mtx)
        const isAccent = (r === 0 && c === 0) || (r === 2 && c === 14) || (r === 4 && (c === 0 || c === 14))
        const isWasd = (r === 1 && c === 2) || (r === 2 && c >= 1 && c <= 3)
        mesh.setColorAt(i, isAccent ? accentViolet : isWasd ? accentCyan : base)
        i++
      }
    }
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  }, [])

  useEffect(
    () => () => {
      keyGeo.dispose()
      keyMat.dispose()
    },
    [keyGeo, keyMat],
  )

  return (
    <group>
      {/* Mousepad with LED edge */}
      <mesh position={[DESK.x + 0.2, TOP + 0.0005, DESK.z + 0.28]} rotation={[-Math.PI / 2, 0, 0]} material={m.ledViolet}>
        <planeGeometry args={[1.012, 0.392]} />
      </mesh>
      <RoundedBox args={[1.0, 0.004, 0.38]} radius={0.002} smoothness={1} position={[DESK.x + 0.2, TOP + 0.002, DESK.z + 0.28]} material={m.fabricDark} receiveShadow />
      {/* Keyboard */}
      <group position={[DESK.x, TOP + 0.004, DESK.z + 0.27]}>
        <RoundedBox args={[0.44, 0.022, 0.155]} radius={0.006} smoothness={2} position={[0, 0.011, 0]} material={m.metalDark} castShadow receiveShadow />
        <instancedMesh ref={keysRef} args={[keyGeo, keyMat, ROWS * COLS]} position={[0, 0.028, -0.004]} castShadow />
        <Glow position={[0, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[0.62, 0.3]} color="#8b5cf6" opacity={0.35} />
      </group>
      {/* Mouse */}
      <group position={[DESK.x + 0.55, TOP + 0.004, DESK.z + 0.3]} rotation={[0, -0.12, 0]}>
        <mesh position={[0, 0.016, 0]} scale={[0.032, 0.018, 0.056]} material={m.plasticBlack} castShadow>
          <sphereGeometry args={[1, 20, 14]} />
        </mesh>
        <mesh position={[0, 0.03, -0.018]} material={m.ledCyan}>
          <boxGeometry args={[0.004, 0.004, 0.018]} />
        </mesh>
      </group>
    </group>
  )
}

/** Articulated desk lamp. The actual light lives in Lighting.tsx. */
export function DeskLamp() {
  const m = getMaterials()
  return (
    <group position={[0.42, TOP, -3.72]} rotation={[0, -0.5, 0]}>
      <mesh position={[0, 0.01, 0]} material={m.metalDark} castShadow>
        <cylinderGeometry args={[0.075, 0.08, 0.02, 32]} />
      </mesh>
      <mesh position={[0, 0.211, 0.059]} rotation={[0.3, 0, 0]} material={m.metalSatin} castShadow>
        <cylinderGeometry args={[0.009, 0.009, 0.4, 12]} />
      </mesh>
      <mesh position={[0, 0.402, 0.118]} material={m.metalDark}>
        <sphereGeometry args={[0.018, 16, 12]} />
      </mesh>
      <mesh position={[0, 0.35, 0.27]} rotation={[1.9, 0, 0]} material={m.metalSatin} castShadow>
        <cylinderGeometry args={[0.008, 0.008, 0.32, 12]} />
      </mesh>
      <group position={[0, 0.3, 0.421]} rotation={[0.25, 0, 0]}>
        <mesh position={[0, -0.02, 0]} material={m.metalDark} castShadow>
          <cylinderGeometry args={[0.028, 0.07, 0.1, 32, 1, true]} />
        </mesh>
        <mesh position={[0, -0.06, 0]} rotation={[Math.PI / 2, 0, 0]} material={m.ledWarm}>
          <circleGeometry args={[0.05, 24]} />
        </mesh>
        <Glow position={[0, -0.075, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[0.4, 0.4]} color="#ffb36b" opacity={0.5} />
      </group>
      <Glow position={[0, 0.003, 0.36]} rotation={[-Math.PI / 2, 0, 0]} scale={[0.9, 0.75]} color="#ffb36b" opacity={0.22} />
    </group>
  )
}

/** Headphones resting on a stand. */
export function Headphones() {
  const m = getMaterials()
  return (
    <group position={[-2.05, TOP, -3.7]} rotation={[0, 0.5, 0]}>
      <mesh position={[0, 0.006, 0]} material={m.metalDark} castShadow>
        <cylinderGeometry args={[0.06, 0.065, 0.012, 24]} />
      </mesh>
      <mesh position={[0, 0.15, 0]} material={m.metalSatin} castShadow>
        <cylinderGeometry args={[0.008, 0.008, 0.28, 12]} />
      </mesh>
      <mesh position={[0, 0.29, 0]} material={m.metalDark}>
        <boxGeometry args={[0.07, 0.012, 0.03]} />
      </mesh>
      <group position={[0, 0.215, 0]}>
        <mesh rotation={[0, 0, 0]} material={m.leather} castShadow>
          <torusGeometry args={[0.085, 0.012, 10, 32, Math.PI]} />
        </mesh>
        {[-1, 1].map((s) => (
          <group key={s} position={[s * 0.085, -0.02, 0]}>
            <mesh rotation={[0, 0, Math.PI / 2]} material={m.plasticBlack} castShadow>
              <cylinderGeometry args={[0.045, 0.045, 0.03, 24]} />
            </mesh>
            <mesh position={[s * 0.016, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={m.ledViolet}>
              <torusGeometry args={[0.035, 0.003, 6, 24]} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  )
}

/** Small lived-in items: phone, succulent. */
export function DeskClutter() {
  const m = getMaterials()
  return (
    <group>
      {/* Phone */}
      <group position={[-1.38, TOP + 0.005, -3.17]} rotation={[0, 0.35, 0]}>
        <RoundedBox args={[0.075, 0.009, 0.155]} radius={0.004} smoothness={2} material={m.plasticBlack} castShadow />
        <mesh position={[0, 0.0048, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.066, 0.142]} />
          <meshStandardMaterial color="#0b1530" emissive="#1e3a8a" emissiveIntensity={0.35} roughness={0.2} />
        </mesh>
      </group>
      {/* Succulent */}
      <group position={[0.55, TOP, -3.15]}>
        <mesh position={[0, 0.035, 0]} material={m.ceramic} castShadow>
          <cylinderGeometry args={[0.04, 0.032, 0.07, 20]} />
        </mesh>
        {Array.from({ length: 7 }, (_, i) => {
          const a = (i / 7) * Math.PI * 2
          return (
            <mesh key={i} position={[Math.cos(a) * 0.018, 0.08, Math.sin(a) * 0.018]} rotation={[Math.sin(a) * 0.6, 0, -Math.cos(a) * 0.6]} material={m.leaf}>
              <sphereGeometry args={[0.018, 8, 6]} />
            </mesh>
          )
        })}
      </group>
    </group>
  )
}

/** PC tower with tempered-glass side and RGB fans. */
export function PCTower() {
  const m = getMaterials()
  const glass = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: '#0b1020', roughness: 0.05, transparent: true, opacity: 0.35, metalness: 0.2 }),
    [],
  )
  useEffect(() => () => glass.dispose(), [glass])
  return (
    <group position={[1.0, 0, -3.55]}>
      <RoundedBox args={[0.22, 0.48, 0.46]} radius={0.01} smoothness={2} position={[0, 0.25, 0]} material={m.plasticBlack} castShadow receiveShadow />
      <mesh position={[-0.112, 0.26, 0]} material={glass}>
        <boxGeometry args={[0.004, 0.42, 0.4]} />
      </mesh>
      {[0.36, 0.16].map((y) => (
        <mesh key={y} position={[-0.09, y, 0.1]} rotation={[0, Math.PI / 2, 0]} material={y > 0.2 ? m.ledViolet : m.ledCyan}>
          <torusGeometry args={[0.055, 0.006, 8, 28]} />
        </mesh>
      ))}
      <mesh position={[0.06, 0.25, 0.231]} material={m.ledCyan}>
        <boxGeometry args={[0.006, 0.38, 0.004]} />
      </mesh>
      <Glow position={[-0.25, 0.005, 0.0]} rotation={[-Math.PI / 2, 0, 0]} scale={[0.7, 0.7]} color="#8b5cf6" opacity={0.25} />
      <FakeShadow position={[0, 0.005, 0]} scale={[0.5, 0.7]} />
    </group>
  )
}
