import { useEffect, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Box, MapPin } from 'lucide-react'
import { usePortfolio } from '@/app/PortfolioProvider'
import { SECTION_LIST, type SectionId } from '@/data/sections'
import { SECTION_REGISTRY } from '@/features/sectionRegistry'
import { SocialIcon, externalLinkProps, isSafeUrl } from '@/components/ui/SocialIcon'
import { AboutContent } from '@/features/about/AboutContent'
import { ProjectsContent } from '@/features/projects/ProjectsContent'
import { SkillsContent } from '@/features/skills/SkillsContent'

const anchor = (id: SectionId) => (id === 'funfacts' ? 'fun-facts' : id)

/**
 * Conventional, fully accessible version of the portfolio. Same content as the 3D room,
 * reachable with keyboard and screen readers, and used as the WebGL fallback.
 */
export default function ClassicPortfolio({ notice }: { notice?: ReactNode }) {
  const data = usePortfolio()
  const location = useLocation()
  const socials = data.socialLinks.filter((l) => isSafeUrl(l.url))

  useEffect(() => {
    document.title = `${data.name} — ${data.role} | Portfolio`
    if (location.hash) {
      const el = document.getElementById(location.hash.slice(1))
      if (el) requestAnimationFrame(() => el.scrollIntoView({ block: 'start' }))
    } else {
      window.scrollTo(0, 0)
    }
  }, [location.hash, data.name, data.role])

  const renderContent = (id: SectionId) => {
    if (id === 'about') return <AboutContent showProfileLink={false} />
    if (id === 'projects') return <ProjectsContent columns="sm:grid-cols-2 lg:grid-cols-3" />
    if (id === 'skills') return <SkillsContent columns="md:grid-cols-2" />
    const { Content } = SECTION_REGISTRY[id]
    return <Content />
  }

  return (
    <div className="min-h-full bg-night-950 bg-[radial-gradient(ellipse_at_top,rgb(59_130_246/0.12),transparent_55%)]">
      <a href="#main" className="sr-only-focusable fixed top-3 left-3 z-50 rounded-lg bg-cyan-400 px-4 py-2 font-semibold text-night-950">
        Skip to content
      </a>
      <header className="sticky top-0 z-40 border-b border-white/5 bg-night-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
          <Link to="/" className="flex items-center gap-2.5" aria-label="Back to the 3D developer room">
            <span className="flex size-9 items-center justify-center rounded-xl bg-linear-to-br from-cyan-400 via-sky-500 to-violet-500 text-sm font-bold text-night-950">{data.initials}</span>
            <span className="hidden font-semibold text-white sm:block">{data.name}</span>
          </Link>
          <nav aria-label="Sections" className="ml-auto hidden md:block">
            <ul className="flex gap-1">
              {SECTION_LIST.map((s) => (
                <li key={s.id}>
                  <a href={`#${anchor(s.id)}`} className="rounded-lg px-2.5 py-2 text-sm text-slate-400 hover:text-white">
                    {s.navLabel}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          {!notice && (
            <Link to="/" className="btn-primary ml-auto !min-h-10 md:ml-2">
              <Box className="size-4" aria-hidden="true" /> Enter 3D Room
            </Link>
          )}
        </div>
      </header>

      <main id="main" className="mx-auto max-w-6xl px-4 pb-24">
        {notice && <div className="pt-6">{notice}</div>}

        <section className="py-14 sm:py-20" aria-labelledby="classic-title">
          <p className="eyebrow">Portfolio</p>
          <h1 id="classic-title" className="mt-3 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            {data.name}
          </h1>
          <p className="text-gradient mt-2 text-xl font-semibold">{data.role}</p>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-300">{data.intro}</p>
          <p className="mt-3 flex items-center gap-1.5 text-sm text-slate-500">
            <MapPin className="size-4" aria-hidden="true" /> {data.location}
          </p>
          {socials.length > 0 && (
            <ul className="mt-6 flex gap-2" aria-label="Social profiles">
              {socials.map((s) => (
                <li key={s.platform + s.label}>
                  <a {...externalLinkProps(s.url)} className="icon-btn" aria-label={s.label}>
                    <SocialIcon platform={s.platform} className="size-4.5" />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>

        {SECTION_LIST.map((s) => {
          const Icon = SECTION_REGISTRY[s.id].Icon
          return (
            <section key={s.id} id={anchor(s.id)} aria-labelledby={`${s.id}-heading`} className="scroll-mt-24 border-t border-white/5 py-12">
              <div className="mb-6 flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-400/10 text-cyan-300">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="eyebrow">{s.object}</p>
                  <h2 id={`${s.id}-heading`} className="text-2xl font-semibold text-white">
                    {s.title}
                  </h2>
                </div>
              </div>
              <div className={s.id === 'projects' || s.id === 'skills' ? '' : 'max-w-3xl'}>{renderContent(s.id)}</div>
            </section>
          )
        })}
      </main>

      <footer className="border-t border-white/5 py-8 text-center text-sm text-slate-500">
        <p>
          © {new Date().getFullYear()} {data.name}. Built with React, Three.js &amp; React Three Fiber.{' '}
          <Link to="/" className="text-cyan-300 hover:text-cyan-200">
            Explore the 3D room →
          </Link>
        </p>
      </footer>
    </div>
  )
}
