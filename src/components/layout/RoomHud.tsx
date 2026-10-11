import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Map as MapIcon, MousePointer2, RotateCcw, RotateCw, Undo2, X, ZoomIn, ZoomOut, Crosshair } from 'lucide-react'
import { SECTION_LIST, SECTIONS, type SectionId } from '@/data/sections'
import { SECTION_REGISTRY } from '@/features/sectionRegistry'
import { useAppStore, type CameraCommand } from '@/store/useAppStore'
import { useCoarsePointer, useIsDesktop } from '@/hooks/useMediaQuery'
import { MAP_POINTS, ROOM } from '@/scene/layout'

function isTypingTarget(el: EventTarget | null) {
  const t = el as HTMLElement | null
  return !!t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)
}

/** Top-down mini map of the room. Each marker is a real button. */
function RoomMap({ onClose }: { onClose: () => void }) {
  const openSection = useAppStore((s) => s.openSection)
  const hovered = useAppStore((s) => s.hovered)
  const size = 180
  const toMap = (x: number, z: number) => [((x + ROOM.W) / (ROOM.W * 2)) * size, ((z + ROOM.D) / (ROOM.D * 2)) * size] as const

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="glass rounded-2xl p-3" role="region" aria-label="Room map">
      <div className="mb-2 flex items-center justify-between">
        <p className="eyebrow">Room map</p>
        <button type="button" onClick={onClose} className="rounded-md p-1 text-slate-400 hover:text-white" aria-label="Hide room map">
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="absolute inset-0" aria-hidden="true">
          <rect x="1" y="1" width={size - 2} height={size - 2} rx="6" fill="rgb(13 21 48 / 0.6)" stroke="rgb(148 163 184 / 0.25)" />
          {/* window */}
          <line x1={toMap(-3, -4)[0]} y1="2" x2={toMap(1.4, -4)[0]} y2="2" stroke="#67e8f9" strokeWidth="3" strokeLinecap="round" />
          {/* desk */}
          <rect x={toMap(-2.2, -3.9)[0]} y={toMap(-2.2, -3.9)[1]} width={(2.8 / 8) * size} height={(0.85 / 8) * size} rx="2" fill="rgb(148 163 184 / 0.18)" />
          {/* rug */}
          <rect x={toMap(-2.1, -2.1)[0]} y={toMap(-2.1, -2.1)[1]} width={(3.4 / 8) * size} height={(2.4 / 8) * size} rx="4" fill="none" stroke="rgb(139 92 246 / 0.3)" strokeDasharray="3 3" />
          {/* bookshelf */}
          <rect x={toMap(3.6, -2.3)[0]} y={toMap(3.6, -2.3)[1]} width={(0.4 / 8) * size} height={(1.8 / 8) * size} rx="1" fill="rgb(148 163 184 / 0.18)" />
          {/* entry hint: camera */}
          <circle cx={toMap(0.6, 3.4)[0]} cy={toMap(0.6, 3.4)[1]} r="4" fill="none" stroke="rgb(148 163 184 / 0.6)" />
          <text x={toMap(0.6, 3.4)[0] + 8} y={toMap(0.6, 3.4)[1] + 3} fontSize="9" fill="rgb(148 163 184 / 0.8)">
            you
          </text>
        </svg>
        {SECTION_LIST.map((s) => {
          const [x, y] = toMap(...MAP_POINTS[s.id])
          const active = hovered === s.id
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => openSection(s.id)}
              className="group absolute -translate-x-1/2 -translate-y-1/2 p-1.5"
              style={{ left: x, top: Math.max(8, y) }}
              aria-label={`${s.object}: ${s.title}`}
              title={`${s.object} — ${s.title}`}
            >
              <span className={`block size-3 rounded-full border-2 transition ${active ? 'scale-125 border-white bg-cyan-300' : 'border-cyan-200/80 bg-cyan-400/60 group-hover:scale-125 group-hover:bg-cyan-300'}`} />
            </button>
          )
        })}
      </div>
    </motion.div>
  )
}

export function RoomHud() {
  const phase = useAppStore((s) => s.phase)
  const activeSection = useAppStore((s) => s.activeSection)
  const openSection = useAppStore((s) => s.openSection)
  const closeSection = useAppStore((s) => s.closeSection)
  const send = useAppStore((s) => s.sendCameraCommand)
  const isDesktop = useIsDesktop()
  const coarse = useCoarsePointer()
  const [hintVisible, setHintVisible] = useState(true)
  const [mapOpen, setMapOpen] = useState(false)
  const inRoom = phase === 'room'

  // Auto-hide the instruction after a while or once something is opened.
  useEffect(() => {
    if (!inRoom) return
    const id = window.setTimeout(() => setHintVisible(false), 12000)
    return () => window.clearTimeout(id)
  }, [inRoom])
  useEffect(() => {
    if (activeSection) setHintVisible(false)
  }, [activeSection])

  // Keyboard camera shortcuts (only when no panel is open and the user isn't typing).
  useEffect(() => {
    if (!inRoom) return
    const onKey = (e: KeyboardEvent) => {
      if (useAppStore.getState().activeSection || isTypingTarget(e.target) || e.metaKey || e.ctrlKey || e.altKey) return
      const map: Record<string, CameraCommand> = {
        ArrowLeft: 'rotate-left',
        ArrowRight: 'rotate-right',
        '+': 'zoom-in',
        '=': 'zoom-in',
        '-': 'zoom-out',
        r: 'reset',
        R: 'reset',
      }
      const cmd = map[e.key]
      if (cmd) {
        e.preventDefault()
        send(cmd)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [inRoom, send])

  const showControls = inRoom && !activeSection

  const cameraButtons: { cmd: CameraCommand; label: string; Icon: typeof RotateCcw }[] = [
    { cmd: 'rotate-left', label: 'Rotate view left', Icon: RotateCcw },
    { cmd: 'zoom-out', label: 'Zoom out', Icon: ZoomOut },
    { cmd: 'reset', label: 'Reset camera view', Icon: Crosshair },
    { cmd: 'zoom-in', label: 'Zoom in', Icon: ZoomIn },
    { cmd: 'rotate-right', label: 'Rotate view right', Icon: RotateCw },
  ]

  return (
    <>
      {/* Return to Room (desktop, while a panel is open) */}
      <AnimatePresence>
        {inRoom && activeSection && isDesktop && (
          <motion.button
            key="return"
            type="button"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            onClick={closeSection}
            className="btn-secondary glass-subtle pointer-events-auto fixed top-22 left-4 z-30"
          >
            <Undo2 className="size-4" aria-hidden="true" /> Return to Room
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showControls && (
          <motion.div
            key="hud"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.35 }}
            className="pointer-events-none fixed inset-x-0 bottom-0 z-20 flex flex-col gap-2 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-4 lg:flex-row lg:items-end lg:justify-between"
          >
            <div className="flex min-w-0 flex-col gap-2">
              <AnimatePresence>
                {hintVisible && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    className="glass-subtle pointer-events-auto flex max-w-md items-start gap-3 self-start rounded-2xl p-3 pr-2"
                    role="note"
                  >
                    <MousePointer2 className="mt-0.5 size-4 shrink-0 text-cyan-300" aria-hidden="true" />
                    <p className="text-xs leading-relaxed text-slate-300">
                      <span className="font-semibold text-white">Explore the room.</span>{' '}
                      {coarse ? 'Drag to look around, pinch to zoom and tap glowing objects.' : 'Drag to look around, scroll to zoom and click the glowing objects.'}{' '}
                      <span className="hidden text-slate-500 lg:inline">Keys: ← → rotate · +/− zoom · R reset.</span>
                    </p>
                    <button type="button" onClick={() => setHintVisible(false)} className="rounded-md p-1 text-slate-500 hover:text-white" aria-label="Dismiss instructions">
                      <X className="size-3.5" aria-hidden="true" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Object guide — every interactive object is reachable without the 3D scene */}
              <nav aria-label="Objects in the room" className="pointer-events-auto -mx-3 overflow-x-auto px-3 sm:mx-0 sm:px-0">
                <ul className="flex w-max gap-1.5">
                  {SECTION_LIST.map((s) => {
                    const Icon = SECTION_REGISTRY[s.id].Icon
                    return (
                      <li key={s.id}>
                        <button
                          type="button"
                          onClick={() => openSection(s.id as SectionId)}
                          onMouseEnter={() => useAppStore.getState().setHovered(s.id)}
                          onMouseLeave={() => useAppStore.getState().setHovered(null)}
                          className="glass-subtle group flex min-h-11 items-center gap-2 rounded-xl px-3 text-left transition hover:border-cyan-300/40"
                          aria-label={`${s.title} — ${s.object}`}
                        >
                          <Icon className="size-4 text-cyan-300" aria-hidden="true" />
                          <span className="leading-tight">
                            <span className="block text-xs font-semibold text-slate-100">{s.navLabel}</span>
                            <span className="hidden text-[10px] text-slate-500 xl:block">{SECTIONS[s.id].object}</span>
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </nav>
            </div>

            <div className="flex items-end justify-center gap-2 lg:justify-end">
              <AnimatePresence>{mapOpen && isDesktop && <RoomMap onClose={() => setMapOpen(false)} />}</AnimatePresence>
              <div className="glass-subtle pointer-events-auto flex items-center gap-1 rounded-2xl p-1.5" role="toolbar" aria-label="Camera controls">
                {cameraButtons.map(({ cmd, label, Icon }) => (
                  <button key={cmd} type="button" onClick={() => send(cmd)} className="flex size-11 items-center justify-center rounded-xl text-slate-300 transition hover:bg-white/8 hover:text-white active:scale-95" aria-label={label} title={label}>
                    <Icon className="size-5" aria-hidden="true" />
                  </button>
                ))}
                {isDesktop && (
                  <button
                    type="button"
                    onClick={() => setMapOpen((o) => !o)}
                    aria-pressed={mapOpen}
                    className={`flex size-11 items-center justify-center rounded-xl transition hover:bg-white/8 ${mapOpen ? 'text-cyan-300' : 'text-slate-300 hover:text-white'}`}
                    aria-label={mapOpen ? 'Hide room map' : 'Show room map'}
                    title="Room map"
                  >
                    <MapIcon className="size-5" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
