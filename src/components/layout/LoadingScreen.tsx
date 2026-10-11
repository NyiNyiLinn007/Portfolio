import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { usePortfolio } from '@/app/PortfolioProvider'
import { LOAD_STEP_LABELS, LOAD_STEPS, selectLoadProgress, useAppStore } from '@/store/useAppStore'

const SLOW_THRESHOLD_MS = 15000

/**
 * Minimal loading screen. Progress reflects real milestones (engine chunk loaded,
 * renderer created, scene built, shaders compiled + first frame) — it never fakes progress.
 * If initialisation is unusually slow, the visitor can continue or switch to the classic view.
 */
export function LoadingScreen() {
  const data = usePortfolio()
  const phase = useAppStore((s) => s.phase)
  const progress = useAppStore(selectLoadProgress)
  const loaded = useAppStore((s) => s.loaded)
  const introSeen = useAppStore((s) => s.introSeen)
  const setPhase = useAppStore((s) => s.setPhase)
  const [slow, setSlow] = useState(false)
  const visible = phase === 'loading'
  const complete = progress >= 1
  const current = LOAD_STEPS.find((s) => !loaded[s])

  useEffect(() => {
    if (!visible) return
    const id = window.setTimeout(() => setSlow(true), SLOW_THRESHOLD_MS)
    return () => window.clearTimeout(id)
  }, [visible])

  useEffect(() => {
    if (!visible || !complete) return
    const id = window.setTimeout(() => setPhase(introSeen ? 'room' : 'intro'), 450)
    return () => window.clearTimeout(id)
  }, [visible, complete, introSeen, setPhase])

  const pct = Math.round(progress * 100)

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.8, ease: 'easeInOut' } }}
          className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-night-950"
          role="status"
          aria-live="polite"
          aria-label={`Loading the developer room: ${pct}%`}
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgb(59_130_246/0.12),transparent_60%)]" aria-hidden="true" />
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.6 }} className="relative flex flex-col items-center">
            <div className="relative flex size-20 items-center justify-center">
              <span className="animate-pulse-ring absolute inset-0 rounded-3xl border border-cyan-300/40" aria-hidden="true" />
              <span className="flex size-20 items-center justify-center rounded-3xl border border-white/10 bg-night-850 text-2xl font-bold">
                <span className="text-gradient">{data.initials}</span>
              </span>
            </div>
            <p className="mt-6 font-mono text-xs tracking-[0.3em] text-slate-400 uppercase">The Developer Room</p>

            <div className="mt-6 h-1 w-56 overflow-hidden rounded-full bg-white/8" aria-hidden="true">
              <motion.div className="h-full rounded-full bg-linear-to-r from-cyan-400 via-sky-500 to-violet-500" initial={{ width: '4%' }} animate={{ width: `${Math.max(4, pct)}%` }} transition={{ duration: 0.5, ease: 'easeOut' }} />
            </div>
            <p className="mt-3 h-4 font-mono text-[11px] text-slate-500">{complete ? 'Ready' : current ? `${LOAD_STEP_LABELS[current]}… ${pct}%` : `${pct}%`}</p>

            {slow && !complete && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-6 flex flex-col items-center gap-3 text-center">
                <p className="max-w-xs text-sm text-slate-400">This is taking longer than usual — your device may be busy compiling 3D graphics.</p>
                <div className="flex gap-2">
                  <button type="button" className="btn-secondary" onClick={() => setPhase(introSeen ? 'room' : 'intro')}>
                    Continue anyway
                  </button>
                  <Link to="/classic" className="btn-ghost">
                    Use classic view
                  </Link>
                </div>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
