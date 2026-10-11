import { useLayoutEffect, useMemo, useRef, type ReactNode } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { Billboard } from '@react-three/drei'
import * as THREE from 'three'
import type { SectionId } from '@/data/sections'
import { useAppStore } from '@/store/useAppStore'
import { HOTSPOTS } from './layout'
import { damp } from '@/utils/math'

const HIGHLIGHT = new THREE.Color('#38bdf8')

interface TrackedMaterial {
  mat: THREE.MeshStandardMaterial
  baseEmissive: THREE.Color
  baseIntensity: number
}

interface InteractiveObjectProps {
  id: SectionId
  children: ReactNode
  /** Disable the floating hotspot marker. */
  hideHotspot?: boolean
  reducedMotion: boolean
}

/**
 * Makes a group of meshes hoverable/clickable.
 *  - Hover: subtle emissive tint (animated in the frame loop — no React re-render), pointer cursor, tooltip via store.
 *  - Click: opens the section (ignored if the pointer was dragged, so orbiting never opens panels).
 */
export function InteractiveObject({ id, children, hideHotspot, reducedMotion }: InteractiveObjectProps) {
  const group = useRef<THREE.Group>(null)
  const hovered = useRef(false)
  const glow = useRef(0)
  const tracked = useRef<TrackedMaterial[]>([])
  const setHovered = useAppStore((s) => s.setHovered)
  const openSection = useAppStore((s) => s.openSection)

  // Give this object its own material instances so highlighting does not affect other objects sharing the palette.
  useLayoutEffect(() => {
    const root = group.current
    if (!root) return
    const clones = new Map<THREE.Material, THREE.MeshStandardMaterial>()
    root.traverse((obj) => {
      const mesh = obj as THREE.Mesh
      if (!mesh.isMesh || mesh.userData.noHighlight || Array.isArray(mesh.material)) return
      const mat = mesh.material as THREE.MeshStandardMaterial
      if (!mat.isMeshStandardMaterial) return
      let clone = clones.get(mat)
      if (!clone) {
        clone = mat.clone()
        clones.set(mat, clone)
      }
      mesh.material = clone
    })
    tracked.current = [...clones.values()].map((mat) => ({
      mat,
      baseEmissive: mat.emissive.clone(),
      baseIntensity: mat.emissiveIntensity,
    }))
    return () => {
      clones.forEach((c) => c.dispose())
      tracked.current = []
    }
  }, [])

  useFrame((_, dt) => {
    const state = useAppStore.getState()
    const target = hovered.current || state.hovered === id ? 1 : state.activeSection === id ? 0.35 : 0
    const prev = glow.current
    let next = reducedMotion ? target : THREE.MathUtils.lerp(prev, target, damp(10, dt))
    if (Math.abs(next - target) < 0.002) next = target
    glow.current = next
    if (next === prev) return
    for (const t of tracked.current) {
      t.mat.emissive.copy(t.baseEmissive).lerp(HIGHLIGHT, glow.current * 0.22)
      t.mat.emissiveIntensity = t.baseIntensity + glow.current * 0.5
    }
  })

  const handlers = useMemo(
    () => ({
      onPointerOver: (e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation()
        hovered.current = true
        setHovered(id)
        document.body.style.cursor = 'pointer'
      },
      onPointerOut: () => {
        hovered.current = false
        if (useAppStore.getState().hovered === id) setHovered(null)
        document.body.style.cursor = ''
      },
      onClick: (e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation()
        if (e.delta > 6) return // it was a drag, not a click
        openSection(id)
      },
    }),
    [id, openSection, setHovered],
  )

  // Reset cursor if unmounted while hovered.
  useLayoutEffect(
    () => () => {
      if (hovered.current) document.body.style.cursor = ''
    },
    [],
  )

  return (
    <group>
      <group ref={group} name={`interactive-${id}`} {...handlers}>
        {children}
      </group>
      {!hideHotspot && <Hotspot id={id} reducedMotion={reducedMotion} onClick={handlers.onClick} />}
    </group>
  )
}

/* -------------------------------------------------------------------------- */

let ringGeo: THREE.RingGeometry | null = null
let dotGeo: THREE.CircleGeometry | null = null
let hitGeo: THREE.CircleGeometry | null = null
const ringMat = new THREE.MeshBasicMaterial({ color: '#67e8f9', transparent: true, opacity: 0.9, depthWrite: false, toneMapped: false })
const dotMat = new THREE.MeshBasicMaterial({ color: '#e0f7ff', transparent: true, opacity: 0.95, depthWrite: false, toneMapped: false })
const hitMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })

/** Pulsing marker floating above each interactive object. Hidden while a panel is open. */
function Hotspot({ id, reducedMotion, onClick }: { id: SectionId; reducedMotion: boolean; onClick: (e: ThreeEvent<MouseEvent>) => void }) {
  const root = useRef<THREE.Group>(null)
  const ring = useRef<THREE.Mesh>(null)
  const offset = useMemo(() => Math.random() * Math.PI * 2, [])
  const ringMaterial = useMemo(() => ringMat.clone(), [])
  useLayoutEffect(() => () => ringMaterial.dispose(), [ringMaterial])
  ringGeo ??= new THREE.RingGeometry(0.05, 0.062, 40)
  dotGeo ??= new THREE.CircleGeometry(0.022, 24)
  hitGeo ??= new THREE.CircleGeometry(0.09, 16)

  useFrame(({ clock }, dt) => {
    const s = useAppStore.getState()
    const visible = s.phase === 'room' && s.activeSection === null
    const g = root.current
    if (!g) return
    const targetScale = visible ? 1 : 0
    const sc = THREE.MathUtils.lerp(g.scale.x, targetScale, damp(8, dt))
    g.scale.setScalar(sc < 0.01 && !visible ? 0 : sc)
    g.visible = g.scale.x > 0.001
    if (ring.current && !reducedMotion) {
      const t = clock.elapsedTime * 1.6 + offset
      const p = (Math.sin(t) + 1) / 2
      ring.current.scale.setScalar(1 + p * 0.45)
      ;(ring.current.material as THREE.MeshBasicMaterial).opacity = 0.9 - p * 0.55
    }
  })

  return (
    <Billboard position={HOTSPOTS[id]}>
      <group ref={root} scale={0}>
        <mesh ref={ring} geometry={ringGeo} material={ringMaterial} renderOrder={5} raycast={() => null} />
        <mesh geometry={dotGeo} material={dotMat} renderOrder={5} raycast={() => null} />
        <mesh
          geometry={hitGeo}
          material={hitMat}
          onClick={(e) => {
            if (root.current?.visible) onClick(e)
          }}
          onPointerOver={(e) => {
            if (!root.current?.visible) return
            e.stopPropagation()
            useAppStore.getState().setHovered(id)
            document.body.style.cursor = 'pointer'
          }}
          onPointerOut={() => {
            if (useAppStore.getState().hovered === id) useAppStore.getState().setHovered(null)
            document.body.style.cursor = ''
          }}
        />
      </group>
    </Billboard>
  )
}
