import { useMemo, type ReactNode } from 'react'
import * as THREE from 'three'
import type { ThreeEvent } from '@react-three/fiber'
import { getMaterials, glowMaterial } from './materials'
import type { Vec3 } from './layout'

const stop = (e: ThreeEvent<PointerEvent | MouseEvent>) => e.stopPropagation()

/**
 * Wrap non-interactive geometry that sits in front of interactive objects.
 * R3F only raycasts objects with handlers, so without this the pointer would
 * "see through" a chair and highlight the monitor behind it.
 */
export function Occluder({ children }: { children: ReactNode }) {
  return (
    <group onPointerOver={stop} onClick={stop}>
      {children}
    </group>
  )
}

/** Shared unit plane geometry for glows/shadows. */
let planeGeo: THREE.PlaneGeometry | null = null
export const unitPlane = () => (planeGeo ??= new THREE.PlaneGeometry(1, 1))

interface GlowProps {
  position: Vec3
  rotation?: Vec3
  scale: [number, number]
  color: string
  opacity?: number
}

/** Additive radial sprite — cheap substitute for bloom around light sources. */
export function Glow({ position, rotation = [0, 0, 0], scale, color, opacity = 0.5 }: GlowProps) {
  const mat = useMemo(() => glowMaterial(color, opacity), [color, opacity])
  return (
    <mesh
      geometry={unitPlane()}
      material={mat}
      position={position}
      rotation={rotation}
      scale={[scale[0], scale[1], 1]}
      renderOrder={2}
      raycast={() => null}
    />
  )
}

const shadowCache = new Map<number, THREE.MeshBasicMaterial>()
function shadowMaterial(opacity?: number) {
  const base = getMaterials().contactShadow
  if (opacity === undefined) return base
  let m = shadowCache.get(opacity)
  if (!m) {
    m = base.clone()
    m.opacity = opacity
    shadowCache.set(opacity, m)
  }
  return m
}
export function disposeShadowMaterials() {
  shadowCache.forEach((m) => m.dispose())
  shadowCache.clear()
}

/** Soft dark blob on the floor/desk to ground objects (cheap ambient occlusion). */
export function FakeShadow({ position, scale, opacity }: { position: Vec3; scale: [number, number]; opacity?: number }) {
  const material = useMemo(() => shadowMaterial(opacity), [opacity])
  return (
    <mesh
      geometry={unitPlane()}
      material={material}
      position={position}
      rotation={[-Math.PI / 2, 0, 0]}
      scale={[scale[0], scale[1], 1]}
      renderOrder={1}
      raycast={() => null}
    />
  )
}
