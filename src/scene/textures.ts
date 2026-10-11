import * as THREE from 'three'
import { mulberry32 } from '@/utils/math'

/**
 * Procedurally generated canvas textures. Everything is drawn at runtime, so the
 * room needs no image downloads. Textures are cached and can be disposed together.
 */
const cache = new Map<string, THREE.Texture>()

type Draw = (ctx: CanvasRenderingContext2D, w: number, h: number) => void

interface TexOptions {
  repeat?: [number, number]
  srgb?: boolean
  anisotropy?: number
}

export function canvasTexture(key: string, w: number, h: number, draw: Draw, opts: TexOptions = {}): THREE.CanvasTexture {
  const existing = cache.get(key)
  if (existing) return existing as THREE.CanvasTexture
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!
  draw(ctx, w, h)
  const tex = new THREE.CanvasTexture(canvas)
  if (opts.srgb !== false) tex.colorSpace = THREE.SRGBColorSpace
  if (opts.repeat) {
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping
    tex.repeat.set(...opts.repeat)
  }
  tex.anisotropy = opts.anisotropy ?? 4
  cache.set(key, tex)
  return tex
}

export function disposeTextures() {
  cache.forEach((t) => t.dispose())
  cache.clear()
}

/* -------------------------------------------------------------------------- */
/*  Surfaces                                                                  */
/* -------------------------------------------------------------------------- */

export const woodFloorTexture = () =>
  canvasTexture(
    'wood-floor',
    1024,
    1024,
    (ctx, w, h) => {
      const rand = mulberry32(7)
      const rowH = 64
      for (let y = 0; y < h; y += rowH) {
        let x = -Math.floor(rand() * 400)
        while (x < w) {
          const len = 260 + Math.floor(rand() * 300)
          const l = 15 + rand() * 7
          const hue = 24 + rand() * 8
          ctx.fillStyle = `hsl(${hue}, ${28 + rand() * 12}%, ${l}%)`
          ctx.fillRect(x, y, len, rowH)
          // Grain
          for (let g = 0; g < 14; g++) {
            ctx.strokeStyle = `rgba(${rand() > 0.5 ? '0,0,0' : '255,220,180'}, ${0.03 + rand() * 0.05})`
            ctx.lineWidth = 1 + rand() * 1.5
            ctx.beginPath()
            const gy = y + rand() * rowH
            ctx.moveTo(x, gy)
            ctx.bezierCurveTo(x + len * 0.3, gy + (rand() - 0.5) * 8, x + len * 0.7, gy + (rand() - 0.5) * 8, x + len, gy + (rand() - 0.5) * 4)
            ctx.stroke()
          }
          // Plank seam
          ctx.fillStyle = 'rgba(0,0,0,0.55)'
          ctx.fillRect(x, y, 2, rowH)
          x += len
        }
        ctx.fillStyle = 'rgba(0,0,0,0.6)'
        ctx.fillRect(0, y, w, 2)
      }
    },
    { repeat: [2, 2], anisotropy: 8 },
  )

export const wallTexture = () =>
  canvasTexture(
    'wall',
    256,
    256,
    (ctx, w, h) => {
      ctx.fillStyle = '#1a2240'
      ctx.fillRect(0, 0, w, h)
      const rand = mulberry32(3)
      for (let i = 0; i < 2600; i++) {
        const v = rand()
        ctx.fillStyle = v > 0.5 ? `rgba(255,255,255,${rand() * 0.035})` : `rgba(0,0,0,${rand() * 0.08})`
        ctx.fillRect(rand() * w, rand() * h, 1 + rand() * 2, 1 + rand() * 2)
      }
    },
    { repeat: [5, 3] },
  )

export const rugTexture = () =>
  canvasTexture('rug', 512, 512, (ctx, w, h) => {
    ctx.fillStyle = '#161a2b'
    ctx.fillRect(0, 0, w, h)
    const rand = mulberry32(11)
    for (let i = 0; i < 9000; i++) {
      ctx.fillStyle = `rgba(${rand() > 0.5 ? '120,140,220' : '0,0,0'}, ${rand() * 0.06})`
      ctx.fillRect(rand() * w, rand() * h, 1.5, 1.5)
    }
    ctx.strokeStyle = 'rgba(120, 110, 230, 0.55)'
    ctx.lineWidth = 6
    ctx.strokeRect(26, 26, w - 52, h - 52)
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)'
    ctx.lineWidth = 2
    ctx.strokeRect(44, 44, w - 88, h - 88)
    // Geometric motif
    ctx.strokeStyle = 'rgba(140, 150, 255, 0.18)'
    ctx.lineWidth = 2
    for (let i = 0; i < 6; i++) {
      const s = 60 + i * 30
      ctx.beginPath()
      ctx.moveTo(w / 2, h / 2 - s)
      ctx.lineTo(w / 2 + s, h / 2)
      ctx.lineTo(w / 2, h / 2 + s)
      ctx.lineTo(w / 2 - s, h / 2)
      ctx.closePath()
      ctx.stroke()
    }
  })

/** Soft radial gradient used for fake glows (additive) and contact shadows (multiply-like). */
export const radialTexture = () =>
  canvasTexture(
    'radial',
    128,
    128,
    (ctx, w, h) => {
      const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2)
      g.addColorStop(0, 'rgba(255,255,255,1)')
      g.addColorStop(0.35, 'rgba(255,255,255,0.45)')
      g.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, w, h)
    },
    { srgb: false },
  )

/* -------------------------------------------------------------------------- */
/*  Signs & art                                                               */
/* -------------------------------------------------------------------------- */

export const neonSignTexture = (text: string, color = '#22d3ee') =>
  canvasTexture(`neon-${text}-${color}`, 512, 128, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h)
    ctx.font = '600 64px "Segoe UI", system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.shadowColor = color
    ctx.shadowBlur = 28
    ctx.fillStyle = color
    ctx.fillText(text, w / 2, h / 2 + 2)
    ctx.shadowBlur = 8
    ctx.fillStyle = '#ffffff'
    ctx.globalAlpha = 0.85
    ctx.fillText(text, w / 2, h / 2 + 2)
  })

export const posterTexture = (variant: 'synth' | 'code' | 'orbit') =>
  canvasTexture(`poster-${variant}`, 256, 360, (ctx, w, h) => {
    if (variant === 'synth') {
      const g = ctx.createLinearGradient(0, 0, 0, h)
      g.addColorStop(0, '#120a2e')
      g.addColorStop(0.6, '#3b1466')
      g.addColorStop(1, '#0b1030')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, w, h)
      const sun = ctx.createLinearGradient(0, 80, 0, 220)
      sun.addColorStop(0, '#fbbf24')
      sun.addColorStop(1, '#ec4899')
      ctx.fillStyle = sun
      ctx.beginPath()
      ctx.arc(w / 2, 170, 70, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#120a2e'
      for (let i = 0; i < 6; i++) ctx.fillRect(40, 175 + i * 11, w - 80, 2 + i)
      ctx.strokeStyle = 'rgba(56,189,248,0.7)'
      ctx.lineWidth = 1.5
      for (let i = 0; i < 8; i++) {
        ctx.beginPath()
        ctx.moveTo(0, 250 + i * i * 2.2)
        ctx.lineTo(w, 250 + i * i * 2.2)
        ctx.stroke()
      }
      for (let i = -6; i <= 6; i++) {
        ctx.beginPath()
        ctx.moveTo(w / 2 + i * 8, 250)
        ctx.lineTo(w / 2 + i * 50, h)
        ctx.stroke()
      }
      ctx.fillStyle = '#f0abfc'
      ctx.font = '700 26px "Segoe UI", sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('SHIP IT', w / 2, 52)
    } else if (variant === 'code') {
      ctx.fillStyle = '#0b1222'
      ctx.fillRect(0, 0, w, h)
      ctx.strokeStyle = 'rgba(34,211,238,0.6)'
      ctx.lineWidth = 2
      ctx.strokeRect(12, 12, w - 24, h - 24)
      ctx.fillStyle = '#22d3ee'
      ctx.font = '700 72px Consolas, monospace'
      ctx.textAlign = 'center'
      ctx.fillText('</>', w / 2, 150)
      ctx.font = '500 18px Consolas, monospace'
      ctx.fillStyle = '#a5b4fc'
      ctx.fillText('while (alive) {', w / 2, 220)
      ctx.fillText('  learn();', w / 2, 246)
      ctx.fillText('  build();', w / 2, 272)
      ctx.fillText('}', w / 2, 298)
    } else {
      ctx.fillStyle = '#0a0f1f'
      ctx.fillRect(0, 0, w, h)
      ctx.strokeStyle = 'rgba(139,92,246,0.7)'
      ctx.lineWidth = 1.5
      for (let i = 1; i < 6; i++) {
        ctx.beginPath()
        ctx.ellipse(w / 2, h / 2, i * 22, i * 12, -0.4, 0, Math.PI * 2)
        ctx.stroke()
      }
      const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, 26)
      g.addColorStop(0, '#e0f2fe')
      g.addColorStop(1, '#3b82f6')
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(w / 2, h / 2, 18, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#c4b5fd'
      ctx.font = '600 16px "Segoe UI", sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('SYSTEMS THINKING', w / 2, h - 34)
    }
  })

export const hologramTexture = () =>
  canvasTexture('hologram', 128, 512, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h)
    g.addColorStop(0, 'rgba(139,92,246,0.9)')
    g.addColorStop(1, 'rgba(34,211,238,0.9)')
    ctx.fillStyle = 'rgba(8,12,30,0.6)'
    ctx.fillRect(0, 0, w, h)
    ctx.strokeStyle = g
    ctx.lineWidth = 4
    ctx.strokeRect(6, 6, w - 12, h - 12)
    ctx.fillStyle = g
    ctx.font = '800 64px "Segoe UI", sans-serif'
    ctx.textAlign = 'center'
    'CODE'.split('').forEach((c, i) => ctx.fillText(c, w / 2, 110 + i * 100))
  })
