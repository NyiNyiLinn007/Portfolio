import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Compass, FastForward, LayoutGrid } from 'lucide-react'
import { usePortfolio } from '@/app/PortfolioProvider'
import { useAppStore } from '@/store/useAppStore'
import { useReducedMotion } from '@/hooks/useMediaQuery'
import { useTypewriter } from '@/hooks/useTypewriter'
import { SocialIcon, externalLinkProps, isSafeUrl } from '@/components/ui/SocialIcon'

const WELCOME = 'Welcome to my digital workspace.'

export function HeroOverlay() {
  const data = usePortfolio()
  const phase = useAppStore((s) => s.phase)
  const enterRoom = useAppStore((s) => s.enterRoom)
  const openSection = useAppStore((s) => s.openSection)
  const reducedMotion = useReducedMotion()
  const visible = phase === 'intro'
  const { output, done } = useTypewriter(WELCOME, { enabled: visible && !reducedMotion, startDelay: 500 })
  const socials = data.socialLinks.filter((l) => isSafeUrl(l.url))

  return (
    <AnimatePresence>
      {visible && (
        <motion.section
          key="hero"
          aria-labelledby="hero-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.45 } }}
          className="pointer-events-none fixed inset-0 z-20 flex items-end pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:items-center sm:pb-0"
        >
          {/* Readability gradient — kept to the left so the room stays the hero visual */}
          <div className="absolute inset-0 bg-linear-to-t from-night-950/95 via-night-950/50 to-transparent sm:bg-linear-to-r sm:from-night-950/90 sm:via-night-950/45 sm:to-transparent" aria-hidden="true" />

          <motion.div
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 12, opacity: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-auto relative mx-4 max-w-xl sm:ml-10 lg:ml-20"
          >
            <p className="eyebrow flex items-center gap-2" aria-label={WELCOME}>
              <span className="inline-block size-1.5 rounded-full bg-cyan-300 shadow-[0_0_10px_2px_rgb(34_211_238/0.6)]" aria-hidden="true" />
              <span aria-hidden="true">
                {output}
                {!done && <span className="typing-caret ml-0.5 inline-block h-3 w-[2px] translate-y-0.5 bg-cyan-300" />}
              </span>
            </p>
            <h1 id="hero-title" className="mt-4 text-4xl leading-[1.05] font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Hi, I&apos;m <span className="text-gradient">{data.name}</span>
            </h1>
            <p className="mt-3 text-lg font-medium text-slate-200 sm:text-xl">{data.role}</p>
            <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-slate-400 sm:text-base">{data.tagline}. Step inside and click around — every object in this room tells part of my story.</p>

            <div className="mt-7 flex flex-wrap gap-3">
              <button type="button" className="btn-primary !min-h-12 !px-6 text-base" onClick={() => enterRoom()}>
                <Compass className="size-5" aria-hidden="true" /> Explore Room
              </button>
              <button type="button" className="btn-secondary !min-h-12 !px-5" onClick={() => openSection('projects')}>
                <LayoutGrid className="size-4.5" aria-hidden="true" /> View Projects
              </button>
              <button type="button" className="btn-ghost !min-h-12" onClick={() => enterRoom({ instant: true })}>
                Skip Intro <FastForward className="size-4" aria-hidden="true" />
              </button>
            </div>

            {socials.length > 0 && (
              <ul className="mt-7 flex items-center gap-2" aria-label="Social profiles">
                {socials.map((s) => (
                  <li key={s.platform + s.label}>
                    <a {...externalLinkProps(s.url)} className="icon-btn" aria-label={s.label}>
                      <SocialIcon platform={s.platform} className="size-4.5" />
                    </a>
                  </li>
                ))}
                <li className="ml-2 hidden items-center gap-1 text-xs text-slate-500 sm:flex">
                  <ArrowRight className="size-3.5" aria-hidden="true" /> or explore the room to find them
                </li>
              </ul>
            )}
          </motion.div>
        </motion.section>
      )}
    </AnimatePresence>
  )
}
