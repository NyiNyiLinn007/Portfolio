import { Link } from 'react-router-dom'
import { Download, FileWarning, MapPin, Sparkles, Target, UserRound } from 'lucide-react'
import { usePortfolio } from '@/app/PortfolioProvider'
import { assetUrl } from '@/utils/assetUrl'

export function AboutContent({ showProfileLink = true }: { showProfileLink?: boolean }) {
  const data = usePortfolio()
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-linear-to-br from-cyan-400/30 via-sky-500/20 to-violet-500/30 text-xl font-bold text-white ring-1 ring-white/10">
          {data.photo ? <img src={assetUrl(data.photo)} alt={`Portrait of ${data.name}`} width={64} height={64} className="size-full object-cover" /> : data.initials}
        </div>
        <div className="min-w-0">
          <p className="text-lg font-semibold text-white">{data.name}</p>
          <p className="text-gradient font-medium">{data.role}</p>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
            <MapPin className="size-3.5" aria-hidden="true" /> {data.location}
          </p>
        </div>
      </div>

      <div className="space-y-3 text-[15px] leading-relaxed text-slate-300">
        {data.biography.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      <section aria-labelledby="about-interests">
        <h3 id="about-interests" className="mb-2.5 flex items-center gap-2 text-sm font-semibold text-white">
          <Sparkles className="size-4 text-violet-300" aria-hidden="true" /> Professional interests
        </h3>
        <ul className="flex flex-wrap gap-2">
          {data.interests.map((i) => (
            <li key={i} className="chip">
              {i}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="about-goals">
        <h3 id="about-goals" className="mb-2.5 flex items-center gap-2 text-sm font-semibold text-white">
          <Target className="size-4 text-cyan-300" aria-hidden="true" /> Current goals
        </h3>
        <ul className="space-y-2">
          {data.currentGoals.map((g) => (
            <li key={g} className="flex gap-2.5 text-sm text-slate-300">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-cyan-300" aria-hidden="true" />
              {g}
            </li>
          ))}
        </ul>
      </section>

      <div className="flex flex-col gap-2.5 sm:flex-row">
        {showProfileLink && (
          <Link to="/classic#about" className="btn-secondary flex-1">
            <UserRound className="size-4" aria-hidden="true" /> View Full Profile
          </Link>
        )}
        {data.resumePath ? (
          <a href={assetUrl(data.resumePath)} download className="btn-primary flex-1">
            <Download className="size-4" aria-hidden="true" /> Download Resume
          </a>
        ) : (
          import.meta.env.DEV && (
            <button type="button" className="btn-secondary flex-1" disabled aria-describedby="resume-config-note">
              <Download className="size-4" aria-hidden="true" /> Download Resume
            </button>
          )
        )}
      </div>
      {import.meta.env.DEV && !data.resumePath && (
        <p id="resume-config-note" className="-mt-3 flex gap-2 rounded-xl border border-amber-300/20 bg-amber-400/5 p-3 text-xs text-amber-100/90">
          <FileWarning className="size-4 shrink-0 text-amber-300" aria-hidden="true" />
          <span>
            Resume not configured yet. Add a PDF to <code className="font-mono text-amber-200">public/</code> and set{' '}
            <code className="font-mono text-amber-200">resumePath</code> in <code className="font-mono text-amber-200">src/data/portfolio.ts</code> to enable this button.
          </span>
        </p>
      )}
    </div>
  )
}
