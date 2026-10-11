import { useEffect, useRef, useState } from 'react'
import { MousePointerClick } from 'lucide-react'
import { SECTIONS } from '@/data/sections'
import { useAppStore } from '@/store/useAppStore'
import { useCoarsePointer } from '@/hooks/useMediaQuery'

/**
 * Small label that follows the pointer while hovering a 3D object.
 * Position is written directly to the DOM (no React re-render per mouse move).
 */
export function Tooltip() {
  const hovered = useAppStore((s) => s.hovered)
  const activeSection = useAppStore((s) => s.activeSection)
  const coarse = useCoarsePointer()
  const ref = useRef<HTMLDivElement>(null)
  const [overCanvas, setOverCanvas] = useState(false)

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const el = ref.current
      if (!el) return
      setOverCanvas(e.target instanceof HTMLCanvasElement)
      const w = el.offsetWidth || 180
      const h = el.offsetHeight || 48
      const x = Math.min(e.clientX + 16, window.innerWidth - w - 8)
      const y = e.clientY + 18 + h > window.innerHeight - 8 ? e.clientY - h - 14 : e.clientY + 18
      el.style.transform = `translate3d(${Math.max(8, x)}px, ${Math.max(8, y)}px, 0)`
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  const meta = hovered ? SECTIONS[hovered] : null
  const visible = !!meta && !coarse && overCanvas && activeSection !== hovered

  return (
    <div ref={ref} className="pointer-events-none fixed top-0 left-0 z-50" aria-hidden="true">
      <div
        className={`glass-subtle flex items-center gap-2.5 rounded-xl px-3 py-2 shadow-glow transition-[opacity,scale] duration-150 ${
          visible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        <MousePointerClick className="size-4 text-cyan-300" />
        <div className="leading-tight">
          <p className="text-[13px] font-semibold text-white">{meta?.object}</p>
          <p className="text-[11px] text-slate-400">{meta?.title}</p>
        </div>
      </div>
    </div>
  )
}
