import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import * as THREE from 'three'
import { useAppStore } from '@/store/useAppStore'
import { useReducedMotion } from '@/hooks/useMediaQuery'
import { DeveloperRoom } from './DeveloperRoom'
import { CameraController } from './CameraController'
import { INTRO_VIEW } from './layout'
import { disposeTextures } from './textures'
import { disposeMaterials } from './materials'
import { disposeShadowMaterials } from './primitives'

/** Marks the scene as ready after shaders compile and the first frame has actually rendered. */
function SceneReady() {
  const gl = useThree((s) => s.gl)
  const scene = useThree((s) => s.scene)
  const camera = useThree((s) => s.camera)
  const markLoaded = useAppStore((s) => s.markLoaded)
  const compiled = useRef(false)
  const frames = useRef(0)

  useEffect(() => {
    let cancelled = false
    const compile = gl.compileAsync ? gl.compileAsync(scene, camera) : Promise.resolve(gl.compile(scene, camera))
    compile
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) compiled.current = true
      })
    return () => {
      cancelled = true
    }
  }, [gl, scene, camera])

  useFrame(() => {
    if (!compiled.current || frames.current > 2) return
    frames.current++
    if (frames.current === 2) markLoaded('compiled')
  })
  return null
}

const maxDpr = (high: boolean) => Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, high ? 2 : 1.25)

/** Lazily loaded 3D experience (its own chunk, so the UI shell paints instantly). */
export default function Experience() {
  const quality = useAppStore((s) => s.quality)
  const markLoaded = useAppStore((s) => s.markLoaded)
  const setWebGL = useAppStore((s) => s.setWebGL)
  const reducedMotion = useReducedMotion()
  const high = quality === 'high'
  const [dpr, setDpr] = useState(() => maxDpr(high))

  useEffect(() => {
    markLoaded('module')
  }, [markLoaded])

  useEffect(() => {
    setDpr(maxDpr(high))
  }, [high])

  // Free GPU resources when leaving the 3D route.
  useEffect(
    () => () => {
      disposeTextures()
      disposeMaterials()
      disposeShadowMaterials()
    },
    [],
  )

  return (
    <Canvas
      shadows
      dpr={dpr}
      gl={{ antialias: true, powerPreference: 'high-performance', stencil: false }}
      camera={{ fov: 52, near: 0.05, far: 450, position: INTRO_VIEW.position }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 1.15
        gl.shadowMap.type = THREE.PCFSoftShadowMap
        markLoaded('renderer')
        let lostTimer: number | undefined
        gl.domElement.addEventListener('webglcontextlost', () => {
          // Give the browser a moment to restore the context before falling back.
          lostTimer = window.setTimeout(() => setWebGL('failed'), 4000)
        })
        gl.domElement.addEventListener('webglcontextrestored', () => window.clearTimeout(lostTimer))
      }}
      aria-hidden="true"
      tabIndex={-1}
    >
      <color attach="background" args={['#04060d']} />
      <PerformanceMonitor
        flipflops={3}
        onDecline={() => setDpr(1)}
        onIncline={() => setDpr(maxDpr(high))}
        onFallback={() => setDpr(1)}
      />
      <Suspense fallback={null}>
        <DeveloperRoom quality={quality} reducedMotion={reducedMotion} />
        <SceneReady />
      </Suspense>
      <CameraController reducedMotion={reducedMotion} />
    </Canvas>
  )
}
