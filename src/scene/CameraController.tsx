import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import * as THREE from 'three'
import { useAppStore } from '@/store/useAppStore'
import { clamp, damp } from '@/utils/math'
import { CAMERA_BOUNDS, DEFAULT_VIEW, INTRO_VIEW, ORBIT_LIMITS, SECTION_VIEWS, type CameraView } from './layout'
import { DESKTOP_BREAKPOINT, PANEL_WIDTH, SHEET_VISIBLE_FRACTION } from '@/utils/uiConstants'

function clampToBounds(v: THREE.Vector3) {
  v.x = clamp(v.x, CAMERA_BOUNDS.min[0], CAMERA_BOUNDS.max[0])
  v.y = clamp(v.y, CAMERA_BOUNDS.min[1], CAMERA_BOUNDS.max[1])
  v.z = clamp(v.z, CAMERA_BOUNDS.min[2], CAMERA_BOUNDS.max[2])
  return v
}

interface Viewport {
  width: number
  height: number
}

/** Visible area not covered by UI panels. */
function effectiveViewport(size: Viewport, panelOpen: boolean): Viewport {
  if (!panelOpen) return size
  if (size.width >= DESKTOP_BREAKPOINT) return { width: size.width - PANEL_WIDTH, height: size.height }
  return { width: size.width, height: size.height * SHEET_VISIBLE_FRACTION }
}

/** Backs the camera away from the target along the view direction until the object fits the free area. */
function fitView(view: CameraView, camera: THREE.PerspectiveCamera, size: Viewport, panelOpen: boolean) {
  const pos = new THREE.Vector3(...view.position)
  const target = new THREE.Vector3(...view.target)
  if (view.fitWidth) {
    const eff = effectiveViewport(size, panelOpen)
    const tanHalfV = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2)
    const tanHalfH = tanHalfV * (eff.width / size.height)
    const tanHalfVEff = tanHalfV * (eff.height / size.height)
    const neededW = (view.fitWidth * 0.55) / tanHalfH
    const neededH = (view.fitWidth * 0.6 * 0.55) / tanHalfVEff
    const needed = Math.max(neededW, neededH)
    const dir = pos.clone().sub(target)
    if (needed > dir.length()) pos.copy(target).add(dir.normalize().multiplyScalar(needed))
  }
  clampToBounds(pos)
  return { pos, target }
}

export function CameraController({ reducedMotion }: { reducedMotion: boolean }) {
  const controls = useRef<OrbitControlsImpl>(null)
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera
  const size = useThree((s) => s.size)
  const phase = useAppStore((s) => s.phase)
  const activeSection = useAppStore((s) => s.activeSection)
  const command = useAppStore((s) => s.cameraCommand)

  const goal = useRef({
    active: true,
    pos: new THREE.Vector3(...INTRO_VIEW.position),
    target: new THREE.Vector3(...INTRO_VIEW.target),
    speed: 2.4,
  })
  const offset = useRef({ x: 0, y: 0 })
  const introTime = useRef(0)
  const firstFrame = useRef(true)

  const setGoal = (pos: THREE.Vector3, target: THREE.Vector3, speed = 2.4, instant = false) => {
    const g = goal.current
    g.pos.copy(pos)
    g.target.copy(target)
    g.speed = speed
    g.active = true
    if (controls.current) controls.current.enabled = false
    if (instant || reducedMotion) {
      camera.position.copy(pos)
      controls.current?.target.copy(target)
      camera.lookAt(target)
    }
  }

  // Wider FOV on portrait screens so more of the room is visible.
  useEffect(() => {
    camera.fov = size.width < size.height ? 66 : 52
    camera.updateProjectionMatrix()
  }, [camera, size.width, size.height])

  // React to phase / section changes.
  useEffect(() => {
    if (phase !== 'room') return
    const view = activeSection ? SECTION_VIEWS[activeSection] : DEFAULT_VIEW
    const { pos, target } = fitView(view, camera, size, !!activeSection)
    setGoal(pos, target, activeSection ? 2.6 : 2.0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, activeSection])

  // Re-fit a focused object when the viewport changes (don't disturb free orbiting).
  useEffect(() => {
    if (phase !== 'room' || !activeSection) return
    const { pos, target } = fitView(SECTION_VIEWS[activeSection], camera, size, true)
    setGoal(pos, target, 4)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size.width, size.height])

  // HUD / keyboard camera commands.
  useEffect(() => {
    if (!command.type || !controls.current) return
    const state = useAppStore.getState()
    if (state.phase !== 'room') return
    if (command.type === 'reset') {
      const { pos, target } = fitView(DEFAULT_VIEW, camera, size, false)
      setGoal(pos, target, 2.2, command.instant)
      return
    }
    if (state.activeSection) return
    const target = controls.current.target.clone()
    const offsetVec = camera.position.clone().sub(target)
    const sph = new THREE.Spherical().setFromVector3(offsetVec)
    if (command.type === 'rotate-left') sph.theta -= 0.35
    if (command.type === 'rotate-right') sph.theta += 0.35
    if (command.type === 'zoom-in') sph.radius *= 0.8
    if (command.type === 'zoom-out') sph.radius *= 1.25
    sph.theta = clamp(sph.theta, ORBIT_LIMITS.minAzimuthAngle, ORBIT_LIMITS.maxAzimuthAngle)
    sph.radius = clamp(sph.radius, ORBIT_LIMITS.minDistance, ORBIT_LIMITS.maxDistance)
    const pos = clampToBounds(new THREE.Vector3().setFromSpherical(sph).add(target))
    setGoal(pos, target, 4)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [command.id])

  useFrame((_, rawDt) => {
    const c = controls.current
    if (!c) return
    const dt = Math.min(rawDt, 0.1)
    const state = useAppStore.getState()
    const g = goal.current

    if (firstFrame.current) {
      firstFrame.current = false
      camera.position.copy(g.pos)
      c.target.copy(g.target)
      camera.lookAt(g.target)
    }

    // Establishing shot: slow cinematic drift behind the intro overlay.
    if (state.phase !== 'room') {
      c.enabled = false
      introTime.current += reducedMotion ? 0 : dt
      const t = introTime.current
      const base = new THREE.Vector3(...INTRO_VIEW.position)
      const tgt = new THREE.Vector3(...INTRO_VIEW.target)
      const rel = base.sub(tgt)
      rel.applyAxisAngle(THREE.Object3D.DEFAULT_UP, Math.sin(t * 0.1) * 0.16)
      g.pos.copy(tgt).add(rel)
      g.pos.y += Math.sin(t * 0.17) * 0.06
      g.target.copy(tgt)
      g.speed = 1.5
      g.active = true
    }

    if (g.active) {
      const k = reducedMotion ? 1 : damp(g.speed, dt)
      camera.position.lerp(g.pos, k)
      c.target.lerp(g.target, k)
      camera.lookAt(c.target)
      const done = camera.position.distanceToSquared(g.pos) < 4e-4 && c.target.distanceToSquared(g.target) < 4e-4
      if (done && state.phase === 'room') {
        camera.position.copy(g.pos)
        c.target.copy(g.target)
        g.active = false
        if (!state.activeSection) {
          c.enabled = true
          c.update()
        }
      }
    } else if (c.enabled) {
      // Safety net: never let the camera leave the room interior.
      clampToBounds(camera.position)
    }

    // Shift the projection so the focused object is centred in the area not covered by the panel.
    const panelOpen = !!state.activeSection
    const desktop = size.width >= DESKTOP_BREAKPOINT
    const tx = panelOpen && desktop ? PANEL_WIDTH / 2 : 0
    const ty = panelOpen && !desktop ? (size.height * (1 - SHEET_VISIBLE_FRACTION)) / 2 : 0
    const o = offset.current
    const ko = reducedMotion ? 1 : damp(5, dt)
    o.x = THREE.MathUtils.lerp(o.x, tx, ko)
    o.y = THREE.MathUtils.lerp(o.y, ty, ko)
    if (Math.abs(o.x) > 0.5 || Math.abs(o.y) > 0.5) {
      camera.setViewOffset(size.width, size.height, o.x, o.y, size.width, size.height)
    } else if (camera.view?.enabled) {
      camera.clearViewOffset()
    }
  })

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enablePan={false}
      enableDamping
      dampingFactor={0.08}
      rotateSpeed={0.55}
      zoomSpeed={0.7}
      minDistance={ORBIT_LIMITS.minDistance}
      maxDistance={ORBIT_LIMITS.maxDistance}
      minPolarAngle={ORBIT_LIMITS.minPolarAngle}
      maxPolarAngle={ORBIT_LIMITS.maxPolarAngle}
      minAzimuthAngle={ORBIT_LIMITS.minAzimuthAngle}
      maxAzimuthAngle={ORBIT_LIMITS.maxAzimuthAngle}
    />
  )
}
