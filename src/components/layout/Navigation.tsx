import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Gauge, Home, ListTree, Menu, Settings, Volume2, VolumeX, X } from 'lucide-react'
import { usePortfolio } from '@/app/PortfolioProvider'
import { SECTION_LIST, SECTIONS, type SectionId } from '@/data/sections'
import { SECTION_REGISTRY } from '@/features/sectionRegistry'
import { useAppStore } from '@/store/useAppStore'
import { ambientSound } from '@/audio/ambientSound'

const PRIMARY: SectionId[] = ['about', 'projects', 'skills', 'experience', 'contact']

function useDismiss(open: boolean, close: () => void, ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close()
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onDown)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onDown)
    }
  }, [open, close, ref])
}

function SoundToggle() {
  const soundOn = useAppStore((s) => s.soundOn)
  const setSoundOn = useAppStore((s) => s.setSoundOn)
  if (!ambientSound.supported) return null
  const toggle = async () => {
    if (soundOn) {
      ambientSound.stop()
      setSoundOn(false)
    } else {
      const ok = await ambientSound.start()
      setSoundOn(ok)
    }
  }
  return (
    <button type="button" className="icon-btn" onClick={toggle} aria-pressed={soundOn} aria-label={soundOn ? 'Mute ambient sound' : 'Play ambient sound'} title={soundOn ? 'Mute ambient sound' : 'Play ambient sound (rain & synth)'}>
      {soundOn ? <Volume2 className="size-5 text-cyan-300" aria-hidden="true" /> : <VolumeX className="size-5" aria-hidden="true" />}
    </button>
  )
}

function SettingsMenu() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const quality = useAppStore((s) => s.quality)
  const setQuality = useAppStore((s) => s.setQuality)
  useDismiss(open, () => setOpen(false), ref)
  return (
    <div className="relative" ref={ref}>
      <button type="button" className="icon-btn" aria-expanded={open} aria-haspopup="true" aria-controls="visual-settings" onClick={() => setOpen((o) => !o)} aria-label="Visual settings">
        <Settings className="size-5" aria-hidden="true" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            id="visual-settings"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.16 }}
            className="glass absolute top-13 right-0 z-50 w-72 rounded-2xl p-4"
          >
            <p className="flex items-center gap-2 text-sm font-semibold text-white">
              <Gauge className="size-4 text-cyan-300" aria-hidden="true" /> Visual quality
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2" role="radiogroup" aria-label="Visual quality">
              {(
                [
                  ['high', 'High', 'Shadows, particles, reflections'],
                  ['low', 'Reduced', 'Faster on older devices'],
                ] as const
              ).map(([id, label, desc]) => (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={quality === id}
                  onClick={() => setQuality(id)}
                  className={`rounded-xl border p-2.5 text-left transition ${quality === id ? 'border-cyan-300/50 bg-cyan-400/10' : 'border-slate-400/15 hover:border-slate-300/30'}`}
                >
                  <span className="block text-sm font-medium text-white">{label}</span>
                  <span className="block text-[11px] leading-snug text-slate-400">{desc}</span>
                </button>
              ))}
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-slate-500">Animations automatically respect your system’s “reduce motion” setting.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function Navigation() {
  const data = usePortfolio()
  const showIntro = useAppStore((s) => s.showIntro)
  const openSection = useAppStore((s) => s.openSection)
  const activeSection = useAppStore((s) => s.activeSection)
  const phase = useAppStore((s) => s.phase)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  useDismiss(menuOpen, () => setMenuOpen(false), menuRef)

  const go = (id: SectionId) => {
    setMenuOpen(false)
    openSection(id)
  }

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-30 px-3 pt-3 sm:px-4 sm:pt-4">
      <nav id="main-nav" tabIndex={-1} aria-label="Main" className="glass-subtle pointer-events-auto mx-auto flex h-14 items-center gap-2 rounded-2xl pr-2 pl-2 sm:pl-3">
        <button type="button" onClick={showIntro} className="flex items-center gap-2.5 rounded-xl px-1 py-1" aria-label={`${data.name} — home`}>
          <span className="flex size-9 items-center justify-center rounded-xl bg-linear-to-br from-cyan-400 via-sky-500 to-violet-500 text-sm font-bold text-night-950">{data.initials}</span>
          <span className="hidden text-left leading-tight sm:block">
            <span className="block text-sm font-semibold text-white">The Developer Room</span>
            <span className="block text-[11px] text-slate-400">{data.role}</span>
          </span>
        </button>

        <ul className="mx-auto hidden items-center gap-1 lg:flex">
          <li>
            <button type="button" onClick={showIntro} className={`rounded-lg px-3 py-2 text-sm font-medium transition ${phase === 'intro' ? 'text-white' : 'text-slate-400 hover:text-white'}`} aria-current={phase === 'intro' ? 'page' : undefined}>
              Home
            </button>
          </li>
          {PRIMARY.map((id) => (
            <li key={id}>
              <button
                type="button"
                onClick={() => go(id)}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${activeSection === id ? 'bg-white/5 text-cyan-200' : 'text-slate-400 hover:text-white'}`}
                aria-current={activeSection === id ? 'true' : undefined}
              >
                {SECTIONS[id].navLabel}
              </button>
            </li>
          ))}
        </ul>

        <div className="ml-auto flex items-center gap-1.5 lg:ml-0">
          <SoundToggle />
          <SettingsMenu />
          <Link to="/classic" className="icon-btn hidden sm:inline-flex" aria-label="Open the classic, accessible portfolio view" title="Classic view">
            <ListTree className="size-5" aria-hidden="true" />
          </Link>
          <div className="relative lg:hidden" ref={menuRef}>
            <button type="button" className="icon-btn" aria-expanded={menuOpen} aria-controls="mobile-menu" aria-label={menuOpen ? 'Close menu' : 'Open menu'} onClick={() => setMenuOpen((o) => !o)}>
              {menuOpen ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
            </button>
            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  id="mobile-menu"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  className="glass absolute top-13 right-0 z-50 w-[min(18rem,calc(100vw-1.5rem))] rounded-2xl p-2"
                >
                  <ul>
                    <li>
                      <button
                        type="button"
                        className="flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-medium text-slate-200 hover:bg-white/5"
                        onClick={() => {
                          setMenuOpen(false)
                          showIntro()
                        }}
                      >
                        <Home className="size-4.5 text-slate-400" aria-hidden="true" /> Home
                      </button>
                    </li>
                    {SECTION_LIST.map((s) => {
                      const Icon = SECTION_REGISTRY[s.id].Icon
                      return (
                        <li key={s.id}>
                          <button type="button" className="flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-medium text-slate-200 hover:bg-white/5" onClick={() => go(s.id)}>
                            <Icon className="size-4.5 text-cyan-300" aria-hidden="true" />
                            <span className="flex-1">{s.title}</span>
                            <span className="text-[11px] text-slate-500">{s.object}</span>
                          </button>
                        </li>
                      )
                    })}
                    <li className="mt-1 border-t border-white/5 pt-1">
                      <Link to="/classic" className="flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-medium text-slate-200 hover:bg-white/5">
                        <ListTree className="size-4.5 text-slate-400" aria-hidden="true" /> Classic view
                      </Link>
                    </li>
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </nav>
    </header>
  )
}
