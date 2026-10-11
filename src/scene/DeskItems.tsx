import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { getMaterials } from './materials'
import { canvasTexture, radialTexture } from './textures'
import { DESK } from './layout'
import { FakeShadow } from './primitives'

const TOP = DESK.height

const notebookLabel = () =>
  canvasTexture('notebook-label', 256, 128, (ctx, w, h) => {
    ctx.fillStyle = '#ece6d6'
    ctx.beginPath()
    ctx.roundRect(8, 8, w - 16, h - 16, 10)
    ctx.fill()
    ctx.fillStyle = '#312e81'
    ctx.font = '700 34px "Segoe UI", system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('JOURNEY', w / 2, 62)
    ctx.font = '500 20px "Segoe UI", system-ui, sans-serif'
    ctx.fillStyle = '#6366f1'
    ctx.fillText('dev log · vol. 3', w / 2, 94)
  })

/** Closed developer notebook with a pen — opens the Experience timeline. */
export function Notebook() {
  const m = getMaterials()
  const labelMat = useMemo(() => new THREE.MeshStandardMaterial({ map: notebookLabel(), roughness: 0.8 }), [])
  useEffect(() => () => labelMat.dispose(), [labelMat])
  return (
    <group position={[0.3, TOP, -3.3]} rotation={[0, -0.28, 0]}>
      <RoundedBox args={[0.2, 0.012, 0.27]} radius={0.003} smoothness={1} position={[0.003, 0.009, 0]} material={m.paper} castShadow receiveShadow />
      <RoundedBox args={[0.21, 0.006, 0.28]} radius={0.002} smoothness={1} position={[0, 0.003, 0]} material={m.notebookCover} />
      <RoundedBox args={[0.21, 0.006, 0.28]} radius={0.002} smoothness={1} position={[0, 0.018, 0]} material={m.notebookCover} castShadow />
      <mesh position={[0, 0.0215, -0.03]} rotation={[-Math.PI / 2, 0, 0]} material={labelMat}>
        <planeGeometry args={[0.13, 0.065]} />
      </mesh>
      {/* Elastic band */}
      <mesh position={[0.08, 0.012, 0]} material={m.rubber}>
        <boxGeometry args={[0.008, 0.026, 0.282]} />
      </mesh>
      {/* Pen */}
      <group position={[0.14, 0.008, 0.02]} rotation={[Math.PI / 2, 0, 0.12]}>
        <mesh material={m.metalSatin} castShadow>
          <cylinderGeometry args={[0.005, 0.005, 0.14, 10]} />
        </mesh>
        <mesh position={[0, 0.078, 0]} material={m.plasticBlack}>
          <coneGeometry args={[0.005, 0.016, 10]} />
        </mesh>
      </group>
      <FakeShadow position={[0, 0.001, 0]} scale={[0.32, 0.38]} opacity={0.4} />
    </group>
  )
}

/** Steaming coffee mug on a coaster — opens Fun Facts. */
export function CoffeeMug({ animate }: { animate: boolean }) {
  const m = getMaterials()
  const steamRefs = useRef<(THREE.Mesh | null)[]>([])
  const mugMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#3b2d8f', roughness: 0.3, metalness: 0.05 }), [])
  const steamMats = useMemo(
    () =>
      [0, 1, 2].map(
        () =>
          new THREE.MeshBasicMaterial({
            map: radialTexture(),
            color: '#dbe4ff',
            transparent: true,
            opacity: 0.1,
            depthWrite: false,
          }),
      ),
    [],
  )
  useEffect(
    () => () => {
      mugMat.dispose()
      steamMats.forEach((s) => s.dispose())
    },
    [mugMat, steamMats],
  )

  useFrame(({ clock, camera }) => {
    const t = clock.elapsedTime
    steamRefs.current.forEach((mesh, i) => {
      if (!mesh) return
      const p = animate ? (t * 0.35 + i / 3) % 1 : 0.3 + i * 0.2
      mesh.position.set(Math.sin(t * 1.2 + i * 2) * 0.012 * p, 0.13 + p * 0.16, 0)
      mesh.scale.setScalar(0.05 + p * 0.07)
      ;(mesh.material as THREE.MeshBasicMaterial).opacity = Math.sin(p * Math.PI) * 0.16
      mesh.quaternion.copy(camera.quaternion)
    })
  })

  return (
    <group position={[-1.85, TOP, -3.22]}>
      <mesh position={[0, 0.003, 0]} material={m.woodLight} receiveShadow>
        <cylinderGeometry args={[0.06, 0.06, 0.006, 32]} />
      </mesh>
      <mesh position={[0, 0.056, 0]} material={mugMat} castShadow>
        <cylinderGeometry args={[0.042, 0.038, 0.1, 32, 1, true]} />
      </mesh>
      <mesh position={[0, 0.056, 0]} material={m.ceramic}>
        <cylinderGeometry args={[0.039, 0.035, 0.099, 32, 1, true]} />
      </mesh>
      <mesh position={[0, 0.007, 0]} material={mugMat}>
        <cylinderGeometry args={[0.038, 0.038, 0.004, 32]} />
      </mesh>
      <mesh position={[0, 0.09, 0]} rotation={[-Math.PI / 2, 0, 0]} material={m.coffee}>
        <circleGeometry args={[0.038, 32]} />
      </mesh>
      <mesh position={[0.046, 0.058, 0]} rotation={[0, 0, -Math.PI / 2]} material={mugMat} castShadow>
        <torusGeometry args={[0.026, 0.0075, 10, 20, Math.PI]} />
      </mesh>
      {/* Printed accent ring */}
      <mesh position={[0, 0.075, 0]} material={m.ledCyan}>
        <cylinderGeometry args={[0.0425, 0.0425, 0.004, 32, 1, true]} />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh
          key={i}
          ref={(el) => {
            steamRefs.current[i] = el
          }}
          material={steamMats[i]}
          userData={{ noHighlight: true }}
          raycast={() => null}
        >
          <planeGeometry args={[1, 1.6]} />
        </mesh>
      ))}
    </group>
  )
}
