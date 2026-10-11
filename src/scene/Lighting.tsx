import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { Quality } from '@/store/useAppStore'

/**
 * Lighting rig. Only the moonlight casts shadows on "high" (plus the desk lamp),
 * keeping shadow-map renders to a minimum.
 */
export function Lighting({ quality, reducedMotion }: { quality: Quality; reducedMotion: boolean }) {
  const high = quality === 'high'
  const moonTarget = useMemo(() => new THREE.Object3D(), [])
  const lampTarget = useMemo(() => new THREE.Object3D(), [])
  const monitorLight = useRef<THREE.PointLight>(null)

  useEffect(() => {
    moonTarget.position.set(0.5, 0, -1.5)
    lampTarget.position.set(0.12, 0.76, -3.28)
    moonTarget.updateMatrixWorld()
    lampTarget.updateMatrixWorld()
  }, [moonTarget, lampTarget])

  // Gentle flicker of the screen glow, like changing screen content.
  useFrame(({ clock }) => {
    if (reducedMotion || !monitorLight.current) return
    const t = clock.elapsedTime
    monitorLight.current.intensity = 2.4 + Math.sin(t * 1.7) * 0.15 + Math.sin(t * 5.3) * 0.08
  })

  return (
    <>
      <primitive object={moonTarget} />
      <primitive object={lampTarget} />
      <hemisphereLight args={['#4a5aa8', '#0a0b14', 0.75]} />
      <ambientLight color="#2b3570" intensity={0.4} />

      {/* Moonlight through the window */}
      <directionalLight
        position={[-3.5, 8, -14]}
        target={moonTarget}
        color="#8fb0ff"
        intensity={high ? 1.05 : 0.5}
        castShadow={high}
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
        shadow-camera-left={-7}
        shadow-camera-right={7}
        shadow-camera-top={7}
        shadow-camera-bottom={-7}
        shadow-camera-near={4}
        shadow-camera-far={30}
      />

      {/* Desk lamp */}
      <spotLight
        position={[0.22, 1.02, -3.36]}
        target={lampTarget}
        color="#ffb36b"
        intensity={6}
        angle={0.85}
        penumbra={0.85}
        distance={4}
        decay={2}
        castShadow={high}
        shadow-mapSize={[512, 512]}
        shadow-bias={-0.0008}
      />

      {/* Monitor glow */}
      <pointLight ref={monitorLight} position={[-0.8, 1.15, -3.15]} color="#4fc3ff" intensity={2.4} distance={3.5} decay={2} />
      {/* LED cove accents */}
      <pointLight position={[-3.2, 2.85, -3.2]} color="#7c4dff" intensity={6} distance={7} decay={1.6} />
      <pointLight position={[3.2, 2.85, 0.2]} color="#3b82f6" intensity={high ? 5 : 6} distance={7} decay={1.6} />
      {/* Warm floor lamp */}
      <pointLight position={[-3.45, 1.6, 1.35]} color="#ffad66" intensity={4} distance={5.5} decay={1.8} />
      {/* Warm bookshelf reading light */}
      <pointLight position={[3.3, 2.1, -1.4]} color="#ffbf80" intensity={2.2} distance={3} decay={2} />
      {high && (
        <>
          {/* Project wall backlight & door neon */}
          <pointLight position={[-3.6, 1.7, -0.8]} color="#8b5cf6" intensity={2.2} distance={3} decay={2} />
          <pointLight position={[2.85, 2.45, -3.65]} color="#22d3ee" intensity={1.2} distance={2.5} decay={2} />
        </>
      )}
    </>
  )
}
