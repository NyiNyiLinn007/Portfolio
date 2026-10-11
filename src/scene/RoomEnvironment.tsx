import { useMemo } from 'react'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { getMaterials } from './materials'
import { canvasTexture, neonSignTexture, rugTexture } from './textures'
import { DOOR, ROOM, WINDOW } from './layout'
import { Glow } from './primitives'

const { W, D, H, wallThickness: T } = ROOM

/** Axis-aligned box defined by its min/max corners. */
function Slab({ min, max, material, cast = true }: { min: [number, number, number]; max: [number, number, number]; material: THREE.Material; cast?: boolean }) {
  const size: [number, number, number] = [max[0] - min[0], max[1] - min[1], max[2] - min[2]]
  const pos: [number, number, number] = [(min[0] + max[0]) / 2, (min[1] + max[1]) / 2, (min[2] + max[2]) / 2]
  return (
    <mesh position={pos} castShadow={cast} receiveShadow>
      <boxGeometry args={size} />
      <primitive object={material} attach="material" />
    </mesh>
  )
}

const washTexture = () =>
  canvasTexture(
    'wash',
    4,
    128,
    (ctx, w, h) => {
      const g = ctx.createLinearGradient(0, 0, 0, h)
      g.addColorStop(0, 'rgba(255,255,255,1)')
      g.addColorStop(0.25, 'rgba(255,255,255,0.35)')
      g.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, w, h)
    },
    { srgb: false },
  )

/** Vertical light wash on a wall below the LED cove. */
function Wash({ position, rotation, width, color, opacity = 0.35 }: { position: [number, number, number]; rotation: [number, number, number]; width: number; color: string; opacity?: number }) {
  const mat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: washTexture(),
        color,
        transparent: true,
        opacity,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
      }),
    [color, opacity],
  )
  return (
    <mesh position={position} rotation={rotation} material={mat} raycast={() => null} renderOrder={2}>
      <planeGeometry args={[width, 1.1]} />
    </mesh>
  )
}

export function RoomEnvironment() {
  const m = getMaterials()
  const rugMat = useMemo(() => new THREE.MeshStandardMaterial({ map: rugTexture(), roughness: 1 }), [])
  const backZ0 = -D - T
  const backZ1 = -D

  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={m.floor}>
        <planeGeometry args={[W * 2, D * 2]} />
      </mesh>
      {/* Rug */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-0.4, 0.004, -0.9]} receiveShadow material={rugMat}>
        <planeGeometry args={[3.4, 2.4]} />
      </mesh>
      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, H, 0]} material={m.ceiling}>
        <planeGeometry args={[W * 2, D * 2]} />
      </mesh>

      {/* Back wall — built around the window and door openings */}
      <Slab min={[-W - T, 0, backZ0]} max={[WINDOW.x0, H, backZ1]} material={m.wall} />
      <Slab min={[WINDOW.x0, 0, backZ0]} max={[WINDOW.x1, WINDOW.y0, backZ1]} material={m.wall} />
      <Slab min={[WINDOW.x0, WINDOW.y1, backZ0]} max={[WINDOW.x1, H, backZ1]} material={m.wall} />
      <Slab min={[WINDOW.x1, 0, backZ0]} max={[DOOR.x0, H, backZ1]} material={m.wall} />
      <Slab min={[DOOR.x0, DOOR.height, backZ0]} max={[DOOR.x1, H, backZ1]} material={m.wall} />
      <Slab min={[DOOR.x1, 0, backZ0]} max={[W + T, H, backZ1]} material={m.wall} />
      {/* Side and front walls */}
      <Slab min={[-W - T, 0, -D - T]} max={[-W, H, D + T]} material={m.wall} />
      <Slab min={[W, 0, -D - T]} max={[W + T, H, D + T]} material={m.wall} />
      <Slab min={[-W - T, 0, D]} max={[W + T, H, D + T]} material={m.wall} cast={false} />

      {/* Baseboards */}
      <Slab min={[-W, 0, -D]} max={[DOOR.x0, 0.09, -D + 0.02]} material={m.trim} cast={false} />
      <Slab min={[DOOR.x1, 0, -D]} max={[W, 0.09, -D + 0.02]} material={m.trim} cast={false} />
      <Slab min={[-W, 0, -D]} max={[-W + 0.02, 0.09, D]} material={m.trim} cast={false} />
      <Slab min={[W - 0.02, 0, -D]} max={[W, 0.09, D]} material={m.trim} cast={false} />
      <Slab min={[-W, 0, D - 0.02]} max={[W, 0.09, D]} material={m.trim} cast={false} />

      {/* Ceiling LED cove */}
      <Slab min={[-W, H - 0.07, -D]} max={[W, H - 0.05, -D + 0.04]} material={m.ledViolet} cast={false} />
      <Slab min={[-W, H - 0.07, -D]} max={[-W + 0.04, H - 0.05, D]} material={m.ledViolet} cast={false} />
      <Slab min={[W - 0.04, H - 0.07, -D]} max={[W, H - 0.05, D]} material={m.ledBlue} cast={false} />
      <Wash position={[0, H - 0.62, -D + 0.01]} rotation={[0, 0, 0]} width={W * 2} color="#7c4dff" opacity={0.22} />
      <Wash position={[-W + 0.01, H - 0.62, 0]} rotation={[0, Math.PI / 2, 0]} width={D * 2} color="#7c4dff" opacity={0.2} />
      <Wash position={[W - 0.01, H - 0.62, 0]} rotation={[0, -Math.PI / 2, 0]} width={D * 2} color="#3b82f6" opacity={0.2} />
    </group>
  )
}

/** Window frame, sill and glass — wrapped as the "Social Profiles" interactive object. */
export function WindowFrame() {
  const m = getMaterials()
  const { x0, x1, y0, y1 } = WINDOW
  const width = x1 - x0
  const height = y1 - y0
  const cx = (x0 + x1) / 2
  const cy = (y0 + y1) / 2
  const z = -D - T / 2
  const mullions = [x0 + width * 0.25, x0 + width * 0.5, x0 + width * 0.75]

  return (
    <group>
      {/* Glass */}
      <mesh position={[cx, cy, z]} material={m.windowGlass}>
        <planeGeometry args={[width, height]} />
      </mesh>
      {/* Frame */}
      <mesh position={[cx, y1 - 0.03, z + 0.02]} material={m.glassFrame} castShadow>
        <boxGeometry args={[width, 0.06, T + 0.04]} />
      </mesh>
      <mesh position={[x0 + 0.03, cy, z + 0.02]} material={m.glassFrame} castShadow>
        <boxGeometry args={[0.06, height, T + 0.04]} />
      </mesh>
      <mesh position={[x1 - 0.03, cy, z + 0.02]} material={m.glassFrame} castShadow>
        <boxGeometry args={[0.06, height, T + 0.04]} />
      </mesh>
      {mullions.map((x) => (
        <mesh key={x} position={[x, cy, z]} material={m.glassFrame} castShadow>
          <boxGeometry args={[0.035, height, 0.05]} />
        </mesh>
      ))}
      {/* Sill */}
      <RoundedBox args={[width + 0.12, 0.05, 0.3]} radius={0.015} smoothness={2} position={[cx, y0 - 0.005, -D + 0.07]} material={m.plasticWhite} castShadow receiveShadow />
    </group>
  )
}

/** Door with neon "CONTACT" sign — wrapped as the "Contact Me" interactive object. */
export function Door() {
  const m = getMaterials()
  const width = DOOR.x1 - DOOR.x0
  const cx = (DOOR.x0 + DOOR.x1) / 2
  const signMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: neonSignTexture('CONTACT', '#22d3ee'),
        transparent: true,
        depthWrite: false,
        toneMapped: false,
        blending: THREE.AdditiveBlending,
      }),
    [],
  )
  const doorPanelMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#1c2236', roughness: 0.55, metalness: 0.15 }), [])
  const inlayMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#242c45', roughness: 0.5, metalness: 0.2 }), [])

  return (
    <group>
      {/* Casing */}
      <mesh position={[DOOR.x0 - 0.035, DOOR.height / 2, -D + 0.015]} material={m.trim} castShadow>
        <boxGeometry args={[0.07, DOOR.height + 0.07, 0.03]} />
      </mesh>
      <mesh position={[DOOR.x1 + 0.035, DOOR.height / 2, -D + 0.015]} material={m.trim} castShadow>
        <boxGeometry args={[0.07, DOOR.height + 0.07, 0.03]} />
      </mesh>
      <mesh position={[cx, DOOR.height + 0.035, -D + 0.015]} material={m.trim} castShadow>
        <boxGeometry args={[width + 0.14, 0.07, 0.03]} />
      </mesh>
      {/* Door leaf */}
      <RoundedBox args={[width - 0.02, DOOR.height - 0.01, 0.045]} radius={0.01} smoothness={2} position={[cx, DOOR.height / 2, -D - 0.03]} material={doorPanelMat} receiveShadow />
      <mesh position={[cx, 1.5, -D - 0.005]} material={inlayMat}>
        <boxGeometry args={[width - 0.26, 0.75, 0.01]} />
      </mesh>
      <mesh position={[cx, 0.55, -D - 0.005]} material={inlayMat}>
        <boxGeometry args={[width - 0.26, 0.75, 0.01]} />
      </mesh>
      {/* Handle */}
      <mesh position={[DOOR.x1 - 0.12, 1.02, -D + 0.01]} rotation={[Math.PI / 2, 0, 0]} material={m.metalSatin}>
        <cylinderGeometry args={[0.025, 0.025, 0.04, 16]} />
      </mesh>
      <mesh position={[DOOR.x1 - 0.17, 1.02, -D + 0.035]} material={m.metalSatin}>
        <boxGeometry args={[0.12, 0.018, 0.018]} />
      </mesh>
      {/* Hallway light leaking under the door */}
      <mesh position={[cx, 0.004, -D + 0.04]} rotation={[-Math.PI / 2, 0, 0]} material={m.ledWarm} userData={{ noHighlight: true }}>
        <planeGeometry args={[width - 0.06, 0.012]} />
      </mesh>
      <Glow position={[cx, 0.006, -D + 0.12]} rotation={[-Math.PI / 2, 0, 0]} scale={[width + 0.4, 0.35]} color="#ffb070" opacity={0.25} />
      {/* Neon sign */}
      <mesh position={[cx, DOOR.height + 0.33, -D + 0.02]} material={signMat} userData={{ noHighlight: true }}>
        <planeGeometry args={[0.96, 0.24]} />
      </mesh>
      <Glow position={[cx, DOOR.height + 0.33, -D + 0.012]} scale={[1.6, 0.7]} color="#22d3ee" opacity={0.18} />
    </group>
  )
}
