import { useEffect, useMemo, useRef } from 'react'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { mulberry32 } from '@/utils/math'
import { getMaterials } from './materials'
import { ROOM } from './layout'
import { FakeShadow, Glow } from './primitives'

const WIDTH = 1.8
const HEIGHT = 2.2
const DEPTH = 0.38
const SHELVES = [0.06, 0.5, 0.94, 1.38, 1.82]
const BOOK_COLORS = ['#1e3a8a', '#0f766e', '#7f1d1d', '#e7dcc6', '#4c1d95', '#334155', '#155e75', '#9a3412', '#1f2937', '#a16207', '#6d28d9', '#0e7490']

interface BookInstance {
  matrix: THREE.Matrix4
  color: THREE.Color
}

/** Lays out books per shelf, leaving gaps for decorative objects. */
function layoutBooks(): BookInstance[] {
  const rand = mulberry32(2024)
  const books: BookInstance[] = []
  const q = new THREE.Quaternion()
  const euler = new THREE.Euler()
  const reserved: Record<number, [number, number][]> = {
    1: [[0.35, 0.86]], // plant
    2: [[-0.86, -0.4]], // horizontal stack + trophy
    3: [[0.1, 0.5]], // framed photo
  }

  SHELVES.forEach((shelfY, s) => {
    let x = -WIDTH / 2 + 0.04
    const end = WIDTH / 2 - 0.04
    while (x < end - 0.03) {
      const blocked = reserved[s]?.find(([a, b]) => x >= a && x < b)
      if (blocked) {
        x = blocked[1] + 0.01
        continue
      }
      const w = 0.025 + rand() * 0.03
      const h = 0.24 + rand() * 0.13
      const d = 0.18 + rand() * 0.07
      if (x + w > end) break
      const nextBlock = reserved[s]?.find(([a]) => a > x && a < x + w)
      if (nextBlock) {
        x = nextBlock[1] + 0.01
        continue
      }
      // Occasionally lean a book against its neighbour
      const lean = rand() > 0.93 ? 0.22 : 0
      euler.set(0, 0, lean)
      q.setFromEuler(euler)
      const pos = new THREE.Vector3(x + w / 2 + (lean ? 0.03 : 0), shelfY + 0.012 + h / 2 - (lean ? 0.01 : 0), -DEPTH / 2 + 0.02 + d / 2)
      books.push({
        matrix: new THREE.Matrix4().compose(pos, q, new THREE.Vector3(w, h, d)),
        color: new THREE.Color(BOOK_COLORS[Math.floor(rand() * BOOK_COLORS.length)]),
      })
      x += w + (lean ? 0.06 : 0.002 + rand() * 0.004)
      if (rand() > 0.9) x += 0.05 + rand() * 0.06 // natural gaps
    }
  })

  // Horizontal stack on shelf 2
  for (let i = 0; i < 4; i++) {
    const w = 0.3 - i * 0.02
    const pos = new THREE.Vector3(-0.68, SHELVES[2] + 0.012 + 0.02 + i * 0.04, -0.02)
    euler.set(0, (rand() - 0.5) * 0.2, 0)
    q.setFromEuler(euler)
    books.push({ matrix: new THREE.Matrix4().compose(pos, q, new THREE.Vector3(w, 0.038, 0.22)), color: new THREE.Color(BOOK_COLORS[(i * 3) % BOOK_COLORS.length]) })
  }
  return books
}

export function Bookshelf() {
  const m = getMaterials()
  const booksRef = useRef<THREE.InstancedMesh>(null)
  const books = useMemo(layoutBooks, [])
  const bookGeo = useMemo(() => new THREE.BoxGeometry(1, 1, 1), [])
  const bookMat = useMemo(() => new THREE.MeshStandardMaterial({ roughness: 0.75 }), [])
  const goldMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#d4a64a', metalness: 0.9, roughness: 0.3 }), [])
  const photoMat = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 128
    canvas.height = 96
    const ctx = canvas.getContext('2d')!
    const g = ctx.createLinearGradient(0, 0, 128, 96)
    g.addColorStop(0, '#1d4ed8')
    g.addColorStop(0.5, '#7c3aed')
    g.addColorStop(1, '#f472b6')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 128, 96)
    ctx.fillStyle = 'rgba(15,23,42,0.85)'
    ctx.beginPath()
    ctx.moveTo(0, 96)
    ctx.lineTo(40, 50)
    ctx.lineTo(70, 75)
    ctx.lineTo(100, 40)
    ctx.lineTo(128, 70)
    ctx.lineTo(128, 96)
    ctx.fill()
    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    return new THREE.MeshStandardMaterial({ map: tex, roughness: 0.4 })
  }, [])

  useEffect(() => {
    const mesh = booksRef.current
    if (!mesh) return
    books.forEach((b, i) => {
      mesh.setMatrixAt(i, b.matrix)
      mesh.setColorAt(i, b.color)
    })
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    mesh.computeBoundingSphere()
  }, [books])

  useEffect(
    () => () => {
      bookGeo.dispose()
      bookMat.dispose()
      goldMat.dispose()
      photoMat.map?.dispose()
      photoMat.dispose()
    },
    [bookGeo, bookMat, goldMat, photoMat],
  )

  const panel = 0.025
  return (
    <group position={[ROOM.W - DEPTH / 2 - 0.005, 0, -1.4]} rotation={[0, -Math.PI / 2, 0]}>
      {/* Carcass */}
      <mesh position={[-WIDTH / 2 + panel / 2, HEIGHT / 2, 0]} material={m.woodDark} castShadow receiveShadow>
        <boxGeometry args={[panel, HEIGHT, DEPTH]} />
      </mesh>
      <mesh position={[WIDTH / 2 - panel / 2, HEIGHT / 2, 0]} material={m.woodDark} castShadow receiveShadow>
        <boxGeometry args={[panel, HEIGHT, DEPTH]} />
      </mesh>
      <mesh position={[0, HEIGHT / 2, -DEPTH / 2 + 0.006]} material={m.woodDark} receiveShadow>
        <boxGeometry args={[WIDTH, HEIGHT, 0.012]} />
      </mesh>
      <RoundedBox args={[WIDTH + 0.02, 0.035, DEPTH + 0.02]} radius={0.008} smoothness={2} position={[0, HEIGHT, 0]} material={m.woodDark} castShadow />
      {SHELVES.map((y, i) => (
        <group key={y}>
          <mesh position={[0, y, 0]} material={m.woodDark} castShadow receiveShadow>
            <boxGeometry args={[WIDTH - panel * 2, 0.024, DEPTH]} />
          </mesh>
          {/* Warm under-shelf LED (not on the bottom shelf) */}
          {i > 0 && (
            <mesh position={[0, y - 0.014, DEPTH / 2 - 0.03]} material={m.ledWarm} userData={{ noHighlight: true }}>
              <boxGeometry args={[WIDTH - 0.12, 0.004, 0.006]} />
            </mesh>
          )}
          {i > 0 && <Glow position={[0, y - 0.22, -DEPTH / 2 + 0.014]} scale={[WIDTH * 0.9, 0.5]} color="#ffb36b" opacity={0.12} />}
        </group>
      ))}

      <instancedMesh ref={booksRef} args={[bookGeo, bookMat, books.length]} castShadow receiveShadow />

      {/* Plant on shelf 1 */}
      <group position={[0.6, SHELVES[1] + 0.012, 0]}>
        <mesh position={[0, 0.07, 0]} material={m.ceramic} castShadow>
          <cylinderGeometry args={[0.075, 0.06, 0.14, 24]} />
        </mesh>
        {Array.from({ length: 9 }, (_, i) => {
          const a = (i / 9) * Math.PI * 2
          return (
            <mesh key={i} position={[Math.cos(a) * 0.05, 0.19 + (i % 3) * 0.03, Math.sin(a) * 0.05]} material={i % 2 ? m.leaf : m.leafDark} castShadow>
              <icosahedronGeometry args={[0.06, 0]} />
            </mesh>
          )
        })}
      </group>
      {/* Trophy on stack */}
      <group position={[-0.68, SHELVES[2] + 0.18, -0.02]}>
        <mesh position={[0, 0.0, 0]} material={m.plasticBlack}>
          <boxGeometry args={[0.08, 0.03, 0.08]} />
        </mesh>
        <mesh position={[0, 0.05, 0]} material={goldMat}>
          <cylinderGeometry args={[0.01, 0.014, 0.07, 12]} />
        </mesh>
        <mesh position={[0, 0.11, 0]} material={goldMat}>
          <cylinderGeometry args={[0.045, 0.02, 0.07, 20]} />
        </mesh>
      </group>
      {/* Framed photo on shelf 3 */}
      <group position={[0.3, SHELVES[3] + 0.13, -0.08]} rotation={[-0.12, 0, 0]}>
        <mesh material={m.plasticBlack} castShadow>
          <boxGeometry args={[0.26, 0.2, 0.015]} />
        </mesh>
        <mesh position={[0, 0, 0.008]} material={photoMat}>
          <planeGeometry args={[0.22, 0.16]} />
        </mesh>
      </group>
      <FakeShadow position={[0, 0.006, 0.05]} scale={[WIDTH + 0.4, 0.8]} opacity={0.5} />
    </group>
  )
}
