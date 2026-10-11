import { useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { mulberry32 } from '@/utils/math'

const vertex = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  attribute float aSeed;
  varying float vAlpha;
  void main() {
    vec3 p = position;
    p.x += sin(uTime * 0.15 + aSeed * 12.0) * 0.25;
    p.y += sin(uTime * 0.1 + aSeed * 7.0) * 0.18;
    p.z += cos(uTime * 0.12 + aSeed * 9.0) * 0.25;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = (3.0 + aSeed * 3.0) * uPixelRatio * (1.0 / -mv.z);
    vAlpha = 0.25 + 0.5 * fract(aSeed * 13.7);
  }
`
const fragment = /* glsl */ `
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d) * vAlpha;
    gl_FragColor = vec4(0.75, 0.85, 1.0, a * 0.55);
  }
`

/** Slowly drifting dust motes — positions animated on the GPU, only a time uniform changes per frame. */
export function DustParticles({ count = 220 }: { count?: number }) {
  const geometry = useMemo(() => {
    const rand = mulberry32(8)
    const pos = new Float32Array(count * 3)
    const seed = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (rand() * 2 - 1) * 3.6
      pos[i * 3 + 1] = 0.3 + rand() * 2.7
      pos[i * 3 + 2] = -3.8 + rand() * 7
      seed[i] = rand()
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
    return g
  }, [count])
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: vertex,
        fragmentShader: fragment,
        uniforms: { uTime: { value: 0 }, uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) * 4 } },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [],
  )
  useEffect(
    () => () => {
      geometry.dispose()
      material.dispose()
    },
    [geometry, material],
  )
  useFrame((_, dt) => {
    material.uniforms.uTime.value += dt
  })
  return <points geometry={geometry} material={material} raycast={() => null} />
}
