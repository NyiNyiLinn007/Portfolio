import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { getMaterials } from './materials'
import { DESK } from './layout'
import { Glow } from './primitives'

type DrawFn = (ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => void

/**
 * Canvas-backed screen texture redrawn at a low, fixed rate (not every frame)
 * to keep CPU/GPU cost tiny. When `animate` is false it is drawn once.
 */
export function useScreenTexture(draw: DrawFn, { width = 512, height = 288, fps = 8, animate = true } = {}) {
  const { texture, ctx } = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const c = canvas.getContext('2d')!
    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    tex.anisotropy = 4
    return { texture: tex, ctx: c }
  }, [width, height])
  const drawRef = useRef(draw)
  drawRef.current = draw
  const acc = useRef(Infinity)
  const time = useRef(0)

  useEffect(() => {
    drawRef.current(ctx, width, height, 0)
    texture.needsUpdate = true
  }, [ctx, texture, width, height])

  useEffect(() => () => texture.dispose(), [texture])

  useFrame((_, dt) => {
    if (!animate) return
    time.current += dt
    acc.current += dt
    if (acc.current < 1 / fps) return
    acc.current = 0
    drawRef.current(ctx, width, height, time.current)
    texture.needsUpdate = true
  })

  return texture
}

const MONO = '"JetBrains Mono", "Cascadia Code", Consolas, monospace'

function windowChrome(ctx: CanvasRenderingContext2D, w: number, title: string) {
  ctx.fillStyle = '#0d1328'
  ctx.fillRect(0, 0, w, 26)
  ;['#f87171', '#fbbf24', '#34d399'].forEach((c, i) => {
    ctx.fillStyle = c
    ctx.beginPath()
    ctx.arc(16 + i * 16, 13, 4.5, 0, Math.PI * 2)
    ctx.fill()
  })
  ctx.fillStyle = '#8b9bc7'
  ctx.font = `13px ${MONO}`
  ctx.textAlign = 'center'
  ctx.fillText(title, w / 2, 17)
  ctx.textAlign = 'left'
}

const CODE_LINES: [string, string][] = [
  ['#c084fc', '@RestController'],
  ['#c084fc', '@RequestMapping("/api/projects")'],
  ['#7dd3fc', 'public class ProjectController {'],
  ['#e2e8f0', '  private final ProjectService service;'],
  ['#64748b', ''],
  ['#c084fc', '  @GetMapping'],
  ['#7dd3fc', '  public List<ProjectDto> findAll() {'],
  ['#e2e8f0', '    return service.findAll();'],
  ['#7dd3fc', '  }'],
  ['#64748b', ''],
  ['#c084fc', '  @PostMapping'],
  ['#7dd3fc', '  public ResponseEntity<ProjectDto> create('],
  ['#e2e8f0', '      @Valid @RequestBody ProjectRequest req) {'],
  ['#e2e8f0', '    var saved = service.create(req);'],
  ['#86efac', '    return ResponseEntity.status(CREATED)'],
  ['#86efac', '        .body(saved);'],
  ['#7dd3fc', '  }'],
  ['#7dd3fc', '}'],
  ['#64748b', '// ---- frontend ----'],
  ['#c084fc', 'export function Room() {'],
  ['#e2e8f0', '  const focus = useStore(s => s.focus)'],
  ['#86efac', '  return <Canvas shadows dpr={[1, 2]}>'],
  ['#e2e8f0', '    <DeveloperRoom focus={focus} />'],
  ['#86efac', '  </Canvas>'],
  ['#c084fc', '}'],
]

export function ComputerSetup({ name, role, animate }: { name: string; role: string; animate: boolean }) {
  const m = getMaterials()

  const codeTex = useScreenTexture(
    (ctx, w, h, t) => {
      ctx.fillStyle = '#070b18'
      ctx.fillRect(0, 0, w, h)
      windowChrome(ctx, w, 'ProjectController.java')
      const lineH = 17
      const scroll = (t * 9) % (CODE_LINES.length * lineH)
      ctx.save()
      ctx.beginPath()
      ctx.rect(0, 28, w, h - 28)
      ctx.clip()
      ctx.font = `13px ${MONO}`
      for (let pass = 0; pass < 2; pass++) {
        CODE_LINES.forEach(([color, text], i) => {
          const y = 46 + (i + pass * CODE_LINES.length) * lineH - scroll
          if (y < 20 || y > h + 10) return
          ctx.fillStyle = '#3b4a6b'
          ctx.fillText(String(i + 1).padStart(2, ' '), 10, y)
          ctx.fillStyle = color
          ctx.fillText(text, 40, y)
        })
      }
      ctx.restore()
      ctx.fillStyle = 'rgba(56,189,248,0.08)'
      ctx.fillRect(0, h - 22, w, 22)
      ctx.fillStyle = '#7dd3fc'
      ctx.font = `12px ${MONO}`
      ctx.fillText('main  ✓ 0 problems   UTF-8   Java 21', 10, h - 7)
    },
    { animate, fps: 10 },
  )

  const aboutTex = useScreenTexture(
    (ctx, w, h, t) => {
      const g = ctx.createLinearGradient(0, 0, w, h)
      g.addColorStop(0, '#070b1c')
      g.addColorStop(1, '#120a2c')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, w, h)
      windowChrome(ctx, w, '~/about-me — zsh')
      ctx.font = `14px ${MONO}`
      const lines: [string, string][] = [
        ['#22d3ee', '❯ whoami'],
        ['#f8fafc', name],
        ['#a78bfa', role],
        ['#22d3ee', '❯ cat focus.txt'],
        ['#cbd5e1', 'core banking · wallets · REST APIs'],
      ]
      lines.forEach(([c, text], i) => {
        ctx.fillStyle = c
        ctx.font = i === 1 ? `bold 20px ${MONO}` : `14px ${MONO}`
        ctx.fillText(text, 18, 56 + i * 30 + (i > 1 ? 4 : 0))
      })
      const cmd = '❯ open ./portfolio'
      const typed = cmd.slice(0, Math.min(cmd.length, Math.floor((t * 6) % (cmd.length + 14))))
      ctx.fillStyle = '#22d3ee'
      ctx.font = `14px ${MONO}`
      ctx.fillText(typed, 18, 220)
      if (Math.floor(t * 2) % 2 === 0) {
        const tw = ctx.measureText(typed).width
        ctx.fillRect(20 + tw, 208, 8, 15)
      }
      // CTA badge
      ctx.strokeStyle = 'rgba(34,211,238,0.6)'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.roundRect(w - 170, h - 44, 152, 28, 14)
      ctx.stroke()
      ctx.fillStyle = '#a5f3fc'
      ctx.font = `12px ${MONO}`
      ctx.fillText('click to learn more', w - 156, h - 25)
    },
    { animate, fps: 8 },
  )

  const statsTex = useScreenTexture(
    (ctx, w, h, t) => {
      ctx.fillStyle = '#060a17'
      ctx.fillRect(0, 0, w, h)
      windowChrome(ctx, w, 'dashboard — prod')
      ctx.font = `12px ${MONO}`
      ctx.fillStyle = '#94a3b8'
      ctx.fillText('REQUESTS / S', 16, 50)
      // Line chart
      ctx.strokeStyle = '#22d3ee'
      ctx.lineWidth = 2
      ctx.beginPath()
      for (let x = 0; x <= 300; x += 6) {
        const v = Math.sin((x + t * 60) * 0.03) * 18 + Math.sin((x + t * 40) * 0.11) * 8
        const y = 110 - v
        if (x === 0) ctx.moveTo(16 + x, y)
        else ctx.lineTo(16 + x, y)
      }
      ctx.stroke()
      ctx.lineTo(316, 150)
      ctx.lineTo(16, 150)
      ctx.closePath()
      ctx.fillStyle = 'rgba(34,211,238,0.08)'
      ctx.fill()
      // Bars
      ctx.fillStyle = '#94a3b8'
      ctx.fillText('CPU', 340, 50)
      for (let i = 0; i < 6; i++) {
        const v = 0.35 + 0.45 * (0.5 + 0.5 * Math.sin(t * 1.3 + i * 1.7))
        ctx.fillStyle = '#1e293b'
        ctx.fillRect(340 + i * 26, 60, 18, 90)
        ctx.fillStyle = i % 2 ? '#8b5cf6' : '#3b82f6'
        ctx.fillRect(340 + i * 26, 60 + 90 * (1 - v), 18, 90 * v)
      }
      // Status cards
      const cards: [string, string, string][] = [
        ['BUILD', 'passing', '#34d399'],
        ['TESTS', '128 ✓', '#34d399'],
        ['UPTIME', '99.98%', '#7dd3fc'],
      ]
      cards.forEach(([k, v, c], i) => {
        const x = 16 + i * 165
        ctx.fillStyle = 'rgba(148,163,184,0.08)'
        ctx.beginPath()
        ctx.roundRect(x, 175, 150, 80, 10)
        ctx.fill()
        ctx.fillStyle = '#64748b'
        ctx.font = `11px ${MONO}`
        ctx.fillText(k, x + 14, 200)
        ctx.fillStyle = c
        ctx.font = `bold 20px ${MONO}`
        ctx.fillText(v, x + 14, 234)
      })
    },
    { animate, fps: 6 },
  )

  const screenMats = useMemo(
    () => [codeTex, aboutTex, statsTex].map((map) => new THREE.MeshBasicMaterial({ map, toneMapped: false })),
    [codeTex, aboutTex, statsTex],
  )
  useEffect(() => () => screenMats.forEach((s) => s.dispose()), [screenMats])
  const noteMats = useMemo(
    () => [
      new THREE.MeshStandardMaterial({ color: '#fde68a', roughness: 0.9 }),
      new THREE.MeshStandardMaterial({ color: '#f9a8d4', roughness: 0.9 }),
    ],
    [],
  )
  useEffect(() => () => noteMats.forEach((n) => n.dispose()), [noteMats])

  const monitors: { x: number; z: number; rotY: number; mat: THREE.Material; notes?: boolean }[] = [
    { x: DESK.x - 0.665, z: DESK.z - 0.08, rotY: 0.42, mat: screenMats[0] },
    { x: DESK.x, z: DESK.z - 0.15, rotY: 0, mat: screenMats[1], notes: true },
    { x: DESK.x + 0.665, z: DESK.z - 0.08, rotY: -0.42, mat: screenMats[2] },
  ]
  const screenY = 1.13
  const top = DESK.height

  return (
    <group>
      {monitors.map((mon, i) => (
        <group key={i} position={[mon.x, screenY, mon.z]} rotation={[0, mon.rotY, 0]}>
          <RoundedBox args={[0.64, 0.375, 0.03]} radius={0.01} smoothness={2} material={m.plasticBlack} castShadow />
          <mesh position={[0, 0, 0.0155]} material={mon.mat} userData={{ noHighlight: true }}>
            <planeGeometry args={[0.614, 0.345]} />
          </mesh>
          <mesh position={[0, -0.02, -0.035]} material={m.plasticGrey} castShadow>
            <boxGeometry args={[0.28, 0.2, 0.04]} />
          </mesh>
          {/* Stand */}
          <mesh position={[0, -(screenY - top) / 2 - 0.05, -0.07]} material={m.metalSatin} castShadow>
            <boxGeometry args={[0.045, screenY - top - 0.1, 0.022]} />
          </mesh>
          <RoundedBox args={[0.24, 0.012, 0.17]} radius={0.005} smoothness={2} position={[0, top - screenY + 0.006, -0.04]} material={m.metalDark} castShadow />
          {mon.notes && (
            <>
              <mesh position={[0.27, -0.155, 0.0165]} rotation={[0, 0, 0.12]} material={noteMats[0]}>
                <planeGeometry args={[0.05, 0.05]} />
              </mesh>
              <mesh position={[0.225, -0.162, 0.017]} rotation={[0, 0, -0.08]} material={noteMats[1]}>
                <planeGeometry args={[0.045, 0.045]} />
              </mesh>
              {/* Webcam */}
              <RoundedBox args={[0.07, 0.022, 0.025]} radius={0.008} smoothness={2} position={[0, 0.2, 0]} material={m.plasticBlack} />
            </>
          )}
        </group>
      ))}
      {/* Screen light spilling onto the desk */}
      <Glow position={[DESK.x, top + 0.003, DESK.z + 0.05]} rotation={[-Math.PI / 2, 0, 0]} scale={[2.2, 0.8]} color="#38bdf8" opacity={0.14} />
    </group>
  )
}
