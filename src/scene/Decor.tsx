import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { mulberry32 } from '@/utils/math'
import { getMaterials } from './materials'
import { posterTexture } from './textures'
import { ROOM, WINDOW } from './layout'
import { FakeShadow } from './primitives'

/** Tall snake plant in the corner. */
function SnakePlant({ position }: { position: [number, number, number] }) {
  const m = getMaterials()
  const leaves = useMemo(() => {
    const rand = mulberry32(17)
    return Array.from({ length: 13 }, (_, i) => ({
      angle: (i / 13) * Math.PI * 2 + rand() * 0.4,
      tilt: 0.08 + rand() * 0.22,
      height: 0.6 + rand() * 0.55,
      r: 0.02 + rand() * 0.07,
      mat: rand() > 0.5 ? m.leaf : m.leafDark,
    }))
  }, [m])
  return (
    <group position={position}>
      <mesh position={[0, 0.2, 0]} material={m.ceramicDark} castShadow receiveShadow>
        <cylinderGeometry args={[0.21, 0.16, 0.4, 32]} />
      </mesh>
      <mesh position={[0, 0.39, 0]} rotation={[-Math.PI / 2, 0, 0]} material={m.soil}>
        <circleGeometry args={[0.19, 24]} />
      </mesh>
      {leaves.map((l, i) => (
        <group key={i} position={[Math.cos(l.angle) * l.r, 0.39, Math.sin(l.angle) * l.r]} rotation={[Math.sin(l.angle) * l.tilt, l.angle, -Math.cos(l.angle) * l.tilt]}>
          <mesh position={[0, l.height / 2, 0]} scale={[1, 1, 0.22]} material={l.mat} castShadow>
            <coneGeometry args={[0.045, l.height, 6]} />
          </mesh>
        </group>
      ))}
      <FakeShadow position={[0, 0.006, 0]} scale={[0.75, 0.75]} />
    </group>
  )
}

/** Shared leaf shape for the broad-leaf plant. */
let leafGeo: THREE.ShapeGeometry | null = null
function getLeafGeometry() {
  if (leafGeo) return leafGeo
  const s = new THREE.Shape()
  s.moveTo(0, 0)
  s.bezierCurveTo(0.13, 0.05, 0.15, 0.27, 0, 0.38)
  s.bezierCurveTo(-0.15, 0.27, -0.13, 0.05, 0, 0)
  leafGeo = new THREE.ShapeGeometry(s, 8)
  return leafGeo
}

function BroadLeafPlant({ position }: { position: [number, number, number] }) {
  const m = getMaterials()
  const leaves = useMemo(() => {
    const rand = mulberry32(31)
    return Array.from({ length: 11 }, (_, i) => ({
      yaw: (i / 11) * Math.PI * 2 + rand() * 0.3,
      stem: 0.35 + rand() * 0.45,
      pitch: 0.5 + rand() * 0.5,
      mat: i % 3 === 0 ? m.leafDark : m.leaf,
    }))
  }, [m])
  return (
    <group position={position}>
      <mesh position={[0, 0.17, 0]} material={m.terracotta} castShadow receiveShadow>
        <cylinderGeometry args={[0.18, 0.13, 0.34, 28]} />
      </mesh>
      <mesh position={[0, 0.335, 0]} rotation={[-Math.PI / 2, 0, 0]} material={m.soil}>
        <circleGeometry args={[0.165, 24]} />
      </mesh>
      {leaves.map((l, i) => (
        <group key={i} position={[0, 0.33, 0]} rotation={[0, l.yaw, 0]}>
          <group rotation={[0, 0, -0.35]}>
            <mesh position={[0, l.stem / 2, 0]} material={m.leafDark}>
              <cylinderGeometry args={[0.006, 0.008, l.stem, 5]} />
            </mesh>
            <mesh position={[0, l.stem, 0]} rotation={[-l.pitch, 0, 0]} geometry={getLeafGeometry()} material={l.mat} castShadow />
          </group>
        </group>
      ))}
      <FakeShadow position={[0, 0.006, 0]} scale={[0.8, 0.8]} />
    </group>
  )
}

function Poster({ variant, position, rotation, size = [0.5, 0.7] }: { variant: 'synth' | 'code' | 'orbit'; position: [number, number, number]; rotation: [number, number, number]; size?: [number, number] }) {
  const m = getMaterials()
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ map: posterTexture(variant), roughness: 0.6 }), [variant])
  useEffect(() => () => mat.dispose(), [mat])
  return (
    <group position={position} rotation={rotation}>
      <mesh material={m.plasticBlack} castShadow>
        <boxGeometry args={[size[0] + 0.04, size[1] + 0.04, 0.02]} />
      </mesh>
      <mesh position={[0, 0, 0.011]} material={mat}>
        <planeGeometry args={size} />
      </mesh>
    </group>
  )
}

/** Analog wall clock that shows the visitor's real local time. */
function WallClock({ position }: { position: [number, number, number] }) {
  const m = getMaterials()
  const hour = useRef<THREE.Group>(null)
  const minute = useRef<THREE.Group>(null)
  const second = useRef<THREE.Group>(null)
  const last = useRef(-1)
  useFrame(() => {
    const now = new Date()
    const s = now.getSeconds()
    if (s === last.current) return
    last.current = s
    const mins = now.getMinutes() + s / 60
    const hrs = (now.getHours() % 12) + mins / 60
    if (second.current) second.current.rotation.z = -(s / 60) * Math.PI * 2
    if (minute.current) minute.current.rotation.z = -(mins / 60) * Math.PI * 2
    if (hour.current) hour.current.rotation.z = -(hrs / 12) * Math.PI * 2
  })
  return (
    <group position={position}>
      <mesh rotation={[Math.PI / 2, 0, 0]} material={m.plasticBlack} castShadow>
        <cylinderGeometry args={[0.19, 0.19, 0.03, 48]} />
      </mesh>
      <mesh position={[0, 0, 0.016]} material={m.ceramicDark}>
        <circleGeometry args={[0.17, 48]} />
      </mesh>
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2
        return (
          <mesh key={i} position={[Math.sin(a) * 0.145, Math.cos(a) * 0.145, 0.018]} rotation={[0, 0, -a]} material={i % 3 === 0 ? m.ledCyan : m.plasticWhite}>
            <planeGeometry args={[0.008, i % 3 === 0 ? 0.03 : 0.018]} />
          </mesh>
        )
      })}
      <group ref={hour} position={[0, 0, 0.02]}>
        <mesh position={[0, 0.04, 0]} material={m.plasticWhite}>
          <planeGeometry args={[0.012, 0.09]} />
        </mesh>
      </group>
      <group ref={minute} position={[0, 0, 0.022]}>
        <mesh position={[0, 0.06, 0]} material={m.plasticWhite}>
          <planeGeometry args={[0.008, 0.13]} />
        </mesh>
      </group>
      <group ref={second} position={[0, 0, 0.024]}>
        <mesh position={[0, 0.055, 0]} material={m.ledViolet}>
          <planeGeometry args={[0.003, 0.14]} />
        </mesh>
      </group>
    </group>
  )
}

function WallShelf() {
  const m = getMaterials()
  return (
    <group position={[-ROOM.W + 0.13, 1.45, 1.75]} rotation={[0, Math.PI / 2, 0]}>
      <RoundedBox args={[0.9, 0.03, 0.24]} radius={0.008} smoothness={2} material={m.woodWalnut} castShadow receiveShadow />
      {/* Mini figure */}
      <group position={[-0.3, 0.015, 0]}>
        <mesh position={[0, 0.05, 0]} material={m.fabricAccent} castShadow>
          <capsuleGeometry args={[0.025, 0.05, 4, 12]} />
        </mesh>
        <mesh position={[0, 0.12, 0]} material={m.ceramic} castShadow>
          <sphereGeometry args={[0.03, 16, 12]} />
        </mesh>
      </group>
      {/* Rubik-style cube */}
      <mesh position={[-0.08, 0.045, 0.02]} rotation={[0, 0.5, 0]} material={m.ledBlue} castShadow>
        <boxGeometry args={[0.06, 0.06, 0.06]} />
      </mesh>
      {/* Retro camera */}
      <group position={[0.22, 0.05, 0]}>
        <RoundedBox args={[0.14, 0.08, 0.06]} radius={0.01} smoothness={2} material={m.plasticBlack} castShadow />
        <mesh position={[0, 0, 0.04]} rotation={[Math.PI / 2, 0, 0]} material={m.metalSatin}>
          <cylinderGeometry args={[0.025, 0.028, 0.03, 20]} />
        </mesh>
      </group>
    </group>
  )
}

/** Window sill details. */
function SillItems() {
  const m = getMaterials()
  return (
    <group position={[WINDOW.x1 - 0.35, WINDOW.y0 + 0.02, -ROOM.D + 0.08]}>
      <mesh position={[0, 0.04, 0]} material={m.terracotta} castShadow>
        <cylinderGeometry args={[0.045, 0.035, 0.08, 16]} />
      </mesh>
      <mesh position={[0, 0.13, 0]} material={m.leafYellow} castShadow>
        <capsuleGeometry args={[0.025, 0.08, 4, 10]} />
      </mesh>
      <mesh position={[0.02, 0.12, 0]} rotation={[0, 0, -0.9]} material={m.leafYellow}>
        <capsuleGeometry args={[0.013, 0.04, 4, 8]} />
      </mesh>
    </group>
  )
}

export function Decor() {
  return (
    <group>
      <SnakePlant position={[-3.5, 0, -3.5]} />
      <BroadLeafPlant position={[3.55, 0, 0.0]} />
      <Poster variant="code" position={[-3.5, 2.05, -ROOM.D + 0.012]} rotation={[0, 0, 0]} size={[0.44, 0.62]} />
      <Poster variant="synth" position={[1.89, 1.42, -ROOM.D + 0.012]} rotation={[0, 0, 0]} size={[0.5, 0.7]} />
      <Poster variant="orbit" position={[-ROOM.W + 0.012, 1.75, 2.75]} rotation={[0, Math.PI / 2, 0]} />
      <Poster variant="code" position={[ROOM.W - 0.012, 1.7, 2.2]} rotation={[0, -Math.PI / 2, 0]} />
      <WallClock position={[1.89, 2.38, -ROOM.D + 0.018]} />
      <WallShelf />
      <SillItems />
    </group>
  )
}
