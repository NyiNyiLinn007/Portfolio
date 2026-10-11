import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import type { Project } from '@/types/portfolio'
import { getMaterials } from './materials'
import { ROOM } from './layout'
import { Glow, Occluder } from './primitives'

const CATEGORY_COLORS: Record<Project['category'], string> = {
  backend: '#22d3ee',
  frontend: '#a78bfa',
  mobile: '#60a5fa',
  experimental: '#f472b6',
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let line = ''
  for (const word of words) {
    const test = line ? `${line} ${word}` : word
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line)
      line = word
    } else line = test
  }
  if (line) lines.push(line)
  return lines
}

function drawWall(ctx: CanvasRenderingContext2D, w: number, h: number, projects: Project[], highlight: number) {
  const bg = ctx.createLinearGradient(0, 0, w, h)
  bg.addColorStop(0, '#080d22')
  bg.addColorStop(1, '#140b30')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, w, h)

  // Subtle grid
  ctx.strokeStyle = 'rgba(99,102,241,0.07)'
  ctx.lineWidth = 1
  for (let x = 0; x < w; x += 32) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, h)
    ctx.stroke()
  }
  for (let y = 0; y < h; y += 32) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(w, y)
    ctx.stroke()
  }

  ctx.fillStyle = '#e0f2fe'
  ctx.font = '700 44px "Segoe UI", system-ui, sans-serif'
  ctx.fillText('PROJECTS', 48, 78)
  ctx.fillStyle = '#22d3ee'
  ctx.fillRect(48, 94, 72, 4)
  ctx.fillStyle = '#94a3b8'
  ctx.font = '500 20px "Segoe UI", system-ui, sans-serif'
  ctx.textAlign = 'right'
  ctx.fillText(`${projects.length} builds · click to explore`, w - 48, 78)
  ctx.textAlign = 'left'

  const shown = projects.slice(0, 6)
  const cols = 3
  const gap = 24
  const cardW = (w - 96 - gap * (cols - 1)) / cols
  const cardH = 196
  shown.forEach((p, i) => {
    const col = i % cols
    const row = Math.floor(i / cols)
    const x = 48 + col * (cardW + gap)
    const y = 128 + row * (cardH + gap)
    const color = CATEGORY_COLORS[p.category]
    const active = i === highlight

    ctx.save()
    if (active) {
      ctx.shadowColor = color
      ctx.shadowBlur = 24
    }
    ctx.fillStyle = active ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)'
    ctx.beginPath()
    ctx.roundRect(x, y, cardW, cardH, 16)
    ctx.fill()
    ctx.restore()
    ctx.strokeStyle = active ? color : 'rgba(148,163,184,0.25)'
    ctx.lineWidth = active ? 2.5 : 1.5
    ctx.beginPath()
    ctx.roundRect(x, y, cardW, cardH, 16)
    ctx.stroke()

    // Cover strip
    const cover = ctx.createLinearGradient(x, y, x + cardW, y + 56)
    cover.addColorStop(0, color + '55')
    cover.addColorStop(1, 'rgba(139,92,246,0.15)')
    ctx.fillStyle = cover
    ctx.beginPath()
    ctx.roundRect(x + 10, y + 10, cardW - 20, 50, 10)
    ctx.fill()

    ctx.fillStyle = color
    ctx.font = '700 15px "Segoe UI", system-ui, sans-serif'
    ctx.fillText(p.category.toUpperCase(), x + 22, y + 41)
    if (p.isSample) {
      ctx.fillStyle = 'rgba(251,191,36,0.9)'
      ctx.font = '600 13px "Segoe UI", system-ui, sans-serif'
      ctx.textAlign = 'right'
      ctx.fillText('SAMPLE', x + cardW - 22, y + 41)
      ctx.textAlign = 'left'
    }

    ctx.fillStyle = '#f8fafc'
    ctx.font = '700 23px "Segoe UI", system-ui, sans-serif'
    wrapText(ctx, p.name, cardW - 40)
      .slice(0, 2)
      .forEach((line, li) => ctx.fillText(line, x + 20, y + 96 + li * 28))

    ctx.fillStyle = '#94a3b8'
    ctx.font = '500 15px "Segoe UI", system-ui, sans-serif'
    ctx.fillText(p.tech.slice(0, 3).join(' · '), x + 20, y + cardH - 22)
  })
}

export function ProjectWall({ projects, animate }: { projects: Project[]; animate: boolean }) {
  const m = getMaterials()
  const { texture, ctx } = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 576
    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    tex.anisotropy = 8
    return { texture: tex, ctx: canvas.getContext('2d')! }
  }, [])
  const screenMat = useMemo(() => new THREE.MeshBasicMaterial({ map: texture, toneMapped: false }), [texture])
  const highlight = useRef(-1)

  useEffect(() => {
    drawWall(ctx, 1024, 576, projects, 0)
    highlight.current = 0
    texture.needsUpdate = true
  }, [ctx, texture, projects])

  useEffect(
    () => () => {
      texture.dispose()
      screenMat.dispose()
    },
    [texture, screenMat],
  )

  // Only redraw when the highlighted card changes (every ~2.4 s).
  useFrame(({ clock }) => {
    if (!animate) return
    const next = Math.floor(clock.elapsedTime / 2.4) % Math.min(6, projects.length)
    if (next !== highlight.current) {
      highlight.current = next
      drawWall(ctx, 1024, 576, projects, next)
      texture.needsUpdate = true
    }
  })

  return (
    <group position={[-ROOM.W + 0.035, 1.62, -0.8]} rotation={[0, Math.PI / 2, 0]}>
      <Glow position={[0, 0, -0.02]} scale={[3.8, 2.4]} color="#7c3aed" opacity={0.3} />
      <RoundedBox args={[2.62, 1.48, 0.05]} radius={0.015} smoothness={2} material={m.plasticBlack} castShadow />
      <mesh position={[0, 0, 0.0255]} material={screenMat} userData={{ noHighlight: true }}>
        <planeGeometry args={[2.54, 1.4]} />
      </mesh>
      <mesh position={[0, -0.76, 0.02]} material={m.ledCyan} userData={{ noHighlight: true }}>
        <boxGeometry args={[2.3, 0.006, 0.006]} />
      </mesh>
    </group>
  )
}

/** Low media console under the project wall (non-interactive). */
export function MediaConsole() {
  const m = getMaterials()
  return (
    <Occluder>
      <group position={[-ROOM.W + 0.22, 0, -0.8]} rotation={[0, Math.PI / 2, 0]}>
        <RoundedBox args={[1.9, 0.42, 0.4]} radius={0.015} smoothness={2} position={[0, 0.25, 0]} material={m.woodDark} castShadow receiveShadow />
        {[-0.95 + 0.06, 0.95 - 0.06].map((x) => (
          <mesh key={x} position={[x, 0.02, 0]} material={m.metalDark}>
            <boxGeometry args={[0.04, 0.04, 0.34]} />
          </mesh>
        ))}
        {[-0.47, 0.47].map((x) => (
          <mesh key={x} position={[x, 0.25, 0.201]} material={m.trim}>
            <boxGeometry args={[0.9, 0.38, 0.004]} />
          </mesh>
        ))}
        {/* Game console */}
        <RoundedBox args={[0.34, 0.06, 0.24]} radius={0.01} smoothness={2} position={[-0.45, 0.49, 0]} material={m.plasticWhite} castShadow />
        <mesh position={[-0.45, 0.49, 0.121]} material={m.ledBlue}>
          <boxGeometry args={[0.2, 0.004, 0.002]} />
        </mesh>
        {/* Speaker */}
        <RoundedBox args={[0.12, 0.2, 0.12]} radius={0.02} smoothness={2} position={[0.7, 0.56, 0]} material={m.plasticGrey} castShadow />
        <mesh position={[0.7, 0.58, 0.061]} material={m.rubber}>
          <circleGeometry args={[0.04, 24]} />
        </mesh>
        {/* Book stack */}
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[0.25, 0.475 + i * 0.03, 0]} rotation={[0, i * 0.15, 0]} material={i === 1 ? m.fabricAccent : m.ceramicDark} castShadow>
            <boxGeometry args={[0.24, 0.028, 0.17]} />
          </mesh>
        ))}
      </group>
    </Occluder>
  )
}
