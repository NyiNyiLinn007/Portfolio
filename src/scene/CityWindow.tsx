import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { mulberry32 } from '@/utils/math'
import { hologramTexture } from './textures'
import { Glow } from './primitives'

const GROUND_Y = -46
const FOG_COLOR = new THREE.Color('#1a1c4a')

/* -------------------------------------------------------------------------- */
/*  Building shader: procedural windows, per-instance variation, slow blinking */
/* -------------------------------------------------------------------------- */

const buildingVertex = /* glsl */ `
  varying vec3 vWorld;
  varying vec3 vNormalW;
  varying vec3 vCenter;
  varying float vLocalY;
  varying float vSeed;
  void main() {
    vec4 world = modelMatrix * instanceMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    vNormalW = normalize(mat3(modelMatrix) * mat3(instanceMatrix) * normal);
    vCenter = (modelMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
    vLocalY = position.y;
    vSeed = fract(sin(dot(instanceMatrix[3].xz, vec2(12.9898, 78.233))) * 43758.5453);
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`

const buildingFragment = /* glsl */ `
  uniform float uTime;
  uniform vec3 uFogColor;
  uniform vec3 uBase;
  varying vec3 vWorld;
  varying vec3 vNormalW;
  varying vec3 vCenter;
  varying float vLocalY;
  varying float vSeed;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

  void main() {
    vec3 n = normalize(vNormalW);
    vec3 col = uBase * (0.55 + 0.45 * vLocalY);

    if (abs(n.y) < 0.5) {
      float faceCoord = abs(n.z) > 0.5 ? vWorld.x - vCenter.x : vWorld.z - vCenter.z;
      vec2 cell = vec2(faceCoord / 1.25, (vWorld.y - vCenter.y) / 1.6);
      vec2 id = floor(cell);
      vec2 f = fract(cell);
      float win = step(0.22, f.x) * step(f.x, 0.78) * step(0.28, f.y) * step(f.y, 0.78);
      float r = hash(id + vSeed * 91.0 + n.xz * 13.0);
      float lit = step(0.6, r);
      // Slow, sparse blinking: a few windows switch state every few seconds.
      float phase = floor(uTime * 0.12 + r * 31.0);
      float toggle = step(0.94, hash(id * 1.31 + phase + vSeed));
      lit = abs(lit - toggle);
      float tint = hash(id * 1.7 + vSeed * 7.0);
      vec3 warm = vec3(1.0, 0.68, 0.36);
      vec3 cool = vec3(0.42, 0.78, 1.0);
      vec3 violet = vec3(0.66, 0.5, 1.0);
      vec3 wc = tint < 0.55 ? warm : (tint < 0.85 ? cool : violet);
      col += win * lit * wc * (0.55 + 0.6 * hash(id + 3.1));
      col += win * (1.0 - lit) * vec3(0.02, 0.035, 0.07);
      // Rooftop accent stripe on some towers
      float stripe = step(0.985, vLocalY) * step(0.7, vSeed);
      col += stripe * vec3(0.25, 0.75, 1.0);
    } else {
      col = uBase * 0.9;
    }

    float d = length(vWorld - cameraPosition);
    float fog = smoothstep(25.0, 150.0, d) * 0.85;
    fog = max(fog, smoothstep(-18.0, -46.0, vWorld.y) * 0.9);
    col = mix(col, uFogColor, fog);
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`

const skyVertex = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`
const skyFragment = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vec3 top = vec3(0.0012, 0.0018, 0.005);
    vec3 mid = vec3(0.008, 0.009, 0.035);
    vec3 horizon = vec3(0.032, 0.017, 0.105);
    float y = vUv.y;
    vec3 col = mix(horizon, mid, smoothstep(0.3, 0.5, y));
    col = mix(col, top, smoothstep(0.5, 0.82, y));
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`

interface Building {
  x: number
  z: number
  w: number
  d: number
  h: number
}

function generateCity(count: number): Building[] {
  const rand = mulberry32(42)
  const buildings: Building[] = []
  let attempts = 0
  while (buildings.length < count && attempts < count * 20) {
    attempts++
    const z = -22 - Math.pow(rand(), 0.75) * 120
    const spread = 34 + Math.abs(z) * 1.0
    const x = (rand() * 2 - 1) * spread
    const w = 4 + rand() * 9
    const d = 4 + rand() * 9
    // Most rooftops sit below the room's eye level (~y=0 → h≈46); a few landmark towers rise above.
    let h = 18 + Math.pow(rand(), 2.6) * 78
    if (z > -50) h = Math.min(h, 24 + rand() * 14)
    // Keep a lower "canyon" right in front of the window so the skyline reads in depth.
    if (z > -70 && x > -22 && x < 16) h = Math.min(h, 20 + rand() * 14)
    // Avoid overlapping footprints.
    const overlaps = buildings.some((b) => Math.abs(b.x - x) < (b.w + w) / 2 + 1.2 && Math.abs(b.z - z) < (b.d + d) / 2 + 1.2)
    if (overlaps) continue
    buildings.push({ x, z, w, d, h })
  }
  return buildings
}

export function CityWindow({ quality, reducedMotion }: { quality: 'high' | 'low'; reducedMotion: boolean }) {
  const count = quality === 'high' ? 240 : 130
  const buildings = useMemo(() => generateCity(count), [count])
  const meshRef = useRef<THREE.InstancedMesh>(null)

  const geometry = useMemo(() => new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0), [])
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: buildingVertex,
        fragmentShader: buildingFragment,
        uniforms: {
          uTime: { value: 0 },
          uFogColor: { value: FOG_COLOR },
          uBase: { value: new THREE.Color('#0d1430') },
        },
      }),
    [],
  )

  useEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return
    const m = new THREE.Matrix4()
    const q = new THREE.Quaternion()
    buildings.forEach((b, i) => {
      m.compose(new THREE.Vector3(b.x, GROUND_Y, b.z), q, new THREE.Vector3(b.w, b.h, b.d))
      mesh.setMatrixAt(i, m)
    })
    mesh.instanceMatrix.needsUpdate = true
  }, [buildings])

  useEffect(
    () => () => {
      geometry.dispose()
      material.dispose()
    },
    [geometry, material],
  )

  useFrame((_, dt) => {
    if (!reducedMotion) material.uniforms.uTime.value += dt
  })

  const tallest = useMemo(() => [...buildings].sort((a, b) => b.h - a.h).slice(0, 14), [buildings])

  return (
    <group>
      <Sky />
      <Stars count={quality === 'high' ? 700 : 350} />
      {/* Moon */}
      <mesh position={[-70, 58, -170]}>
        <circleGeometry args={[5.5, 48]} />
        <meshBasicMaterial color="#eef2ff" toneMapped={false} />
      </mesh>
      <Glow position={[-70, 58, -171]} scale={[60, 60]} color="#8aa8ff" opacity={0.35} />
      {/* City light haze near the ground */}
      <Glow position={[0, -22, -150]} scale={[520, 70]} color="#6d3df2" opacity={0.35} />
      <Glow position={[30, -28, -110]} scale={[260, 40]} color="#22d3ee" opacity={0.12} />

      <instancedMesh ref={meshRef} args={[geometry, material, buildings.length]} frustumCulled={false} />
      <AviationLights buildings={tallest} reducedMotion={reducedMotion} />
      {quality === 'high' && !reducedMotion && <FlyingTraffic />}
      <Hologram reducedMotion={reducedMotion} />
    </group>
  )
}

function Sky() {
  const material = useMemo(() => new THREE.ShaderMaterial({ vertexShader: skyVertex, fragmentShader: skyFragment, depthWrite: false }), [])
  useEffect(() => () => material.dispose(), [material])
  return (
    <mesh position={[0, 40, -190]} material={material}>
      <planeGeometry args={[700, 300]} />
    </mesh>
  )
}

function Stars({ count }: { count: number }) {
  const geometry = useMemo(() => {
    const rand = mulberry32(5)
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (rand() * 2 - 1) * 320
      positions[i * 3 + 1] = 15 + Math.pow(rand(), 0.7) * 170
      positions[i * 3 + 2] = -180 + rand() * 6
      const b = 0.35 + rand() * 0.65
      colors[i * 3] = b * (0.8 + rand() * 0.2)
      colors[i * 3 + 1] = b * 0.9
      colors[i * 3 + 2] = b
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    return g
  }, [count])
  const material = useMemo(() => new THREE.PointsMaterial({ size: 1.6, sizeAttenuation: false, vertexColors: true, transparent: true, depthWrite: false, toneMapped: false }), [])
  useEffect(
    () => () => {
      geometry.dispose()
      material.dispose()
    },
    [geometry, material],
  )
  return <points geometry={geometry} material={material} />
}

function AviationLights({ buildings, reducedMotion }: { buildings: Building[]; reducedMotion: boolean }) {
  const ref = useRef<THREE.InstancedMesh>(null)
  const geometry = useMemo(() => new THREE.SphereGeometry(0.35, 8, 8), [])
  const material = useMemo(() => new THREE.MeshBasicMaterial({ color: '#ff3b5c', toneMapped: false, transparent: true }), [])
  useEffect(() => {
    const mesh = ref.current
    if (!mesh) return
    const m = new THREE.Matrix4()
    buildings.forEach((b, i) => {
      m.makeTranslation(b.x, GROUND_Y + b.h + 0.6, b.z)
      mesh.setMatrixAt(i, m)
    })
    mesh.instanceMatrix.needsUpdate = true
  }, [buildings])
  useEffect(
    () => () => {
      geometry.dispose()
      material.dispose()
    },
    [geometry, material],
  )
  useFrame(({ clock }) => {
    if (reducedMotion) return
    const t = clock.elapsedTime
    material.opacity = 0.25 + 0.75 * Math.pow(Math.max(0, Math.sin(t * 2.2)), 6)
  })
  return <instancedMesh ref={ref} args={[geometry, material, buildings.length]} frustumCulled={false} />
}

/** Small glowing vehicles crossing the skyline — instance matrices updated in the frame loop. */
function FlyingTraffic() {
  const COUNT = 18
  const ref = useRef<THREE.InstancedMesh>(null)
  const lanes = useMemo(() => {
    const rand = mulberry32(99)
    return Array.from({ length: COUNT }, () => ({
      x: (rand() * 2 - 1) * 90,
      y: -16 + rand() * 20,
      z: -30 - rand() * 60,
      speed: (rand() > 0.5 ? 1 : -1) * (7 + rand() * 10),
    }))
  }, [])
  const geometry = useMemo(() => new THREE.BoxGeometry(1.4, 0.22, 0.5), [])
  const material = useMemo(() => new THREE.MeshBasicMaterial({ toneMapped: false }), [])
  useEffect(() => {
    const mesh = ref.current
    if (!mesh) return
    const palette = ['#7dd3fc', '#fde68a', '#c4b5fd', '#ff6b8b']
    lanes.forEach((_, i) => mesh.setColorAt(i, new THREE.Color(palette[i % palette.length]).multiplyScalar(1.4)))
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  }, [lanes])
  useEffect(
    () => () => {
      geometry.dispose()
      material.dispose()
    },
    [geometry, material],
  )
  const tmp = useMemo(() => new THREE.Matrix4(), [])
  useFrame((_, dt) => {
    const mesh = ref.current
    if (!mesh) return
    lanes.forEach((l, i) => {
      l.x += l.speed * dt
      if (l.x > 100) l.x = -100
      if (l.x < -100) l.x = 100
      tmp.makeTranslation(l.x, l.y, l.z)
      mesh.setMatrixAt(i, tmp)
    })
    mesh.instanceMatrix.needsUpdate = true
  })
  return <instancedMesh ref={ref} args={[geometry, material, COUNT]} frustumCulled={false} />
}

function Hologram({ reducedMotion }: { reducedMotion: boolean }) {
  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: hologramTexture(),
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
        side: THREE.DoubleSide,
      }),
    [],
  )
  useEffect(() => () => material.dispose(), [material])
  useFrame(({ clock }) => {
    if (reducedMotion) return
    const t = clock.elapsedTime
    material.opacity = 0.7 + Math.sin(t * 3) * 0.08 + (Math.sin(t * 37) > 0.97 ? -0.4 : 0)
  })
  return (
    <group position={[-30, -6, -44]}>
      <mesh material={material}>
        <planeGeometry args={[5, 20]} />
      </mesh>
      <Glow position={[0, 0, -0.2]} scale={[16, 30]} color="#8b5cf6" opacity={0.18} />
    </group>
  )
}
