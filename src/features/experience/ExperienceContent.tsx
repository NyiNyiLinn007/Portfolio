import { useMemo, useState } from 'react'
import { Award, Briefcase, Flag, GraduationCap } from 'lucide-react'
import { usePortfolio } from '@/app/PortfolioProvider'
import type { TimelineKind } from '@/types/portfolio'
import { SampleBadge } from '@/components/ui/ProjectCard'

const KIND_META: Record<TimelineKind, { label: string; Icon: typeof Briefcase; className: string }> = {
  work: { label: 'Experience', Icon: Briefcase, className: 'text-cyan-300 border-cyan-300/30 bg-cyan-400/10' },
  education: { label: 'Education', Icon: GraduationCap, className: 'text-violet-300 border-violet-300/30 bg-violet-400/10' },
  certification: { label: 'Certification', Icon: Award, className: 'text-amber-300 border-amber-300/30 bg-amber-400/10' },
  milestone: { label: 'Milestone', Icon: Flag, className: 'text-emerald-300 border-emerald-300/30 bg-emerald-400/10' },
}

type Filter = 'all' | 'work' | 'learning'

export function ExperienceContent() {
  const { experience, education } = usePortfolio()
  const [filter, setFilter] = useState<Filter>('all')
  const entries = useMemo(() => {
    const all = [...experience, ...education]
    if (filter === 'work') return all.filter((e) => e.kind === 'work')
    if (filter === 'learning') return all.filter((e) => e.kind !== 'work')
    return all
  }, [experience, education, filter])

  return (
    <div>
      <div className="mb-5 flex gap-2" role="group" aria-label="Filter timeline">
        {(
          [
            ['all', 'Everything'],
            ['work', 'Work'],
            ['learning', 'Learning'],
          ] as [Filter, string][]
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            aria-pressed={filter === id}
            onClick={() => setFilter(id)}
            className={`min-h-9 rounded-full border px-3.5 text-sm font-medium transition ${
              filter === id ? 'border-cyan-300/50 bg-cyan-400/15 text-cyan-100' : 'border-slate-400/15 text-slate-400 hover:text-slate-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <ol className="relative space-y-5 border-l border-slate-400/15 pl-6">
        {entries.map((e) => {
          const meta = KIND_META[e.kind]
          return (
            <li key={e.id} className="relative">
              <span className={`absolute top-0.5 -left-[38px] flex size-7 items-center justify-center rounded-full border ${meta.className}`}>
                <meta.Icon className="size-3.5" aria-hidden="true" />
              </span>
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs text-slate-400">{e.period}</span>
                  <span className="text-[11px] text-slate-500">· {meta.label}</span>
                  {e.isSample && <SampleBadge />}
                </div>
                <h3 className="mt-1.5 font-semibold text-white">{e.title}</h3>
                <p className="text-sm text-cyan-200/80">
                  {e.organization}
                  {e.location ? ` · ${e.location}` : ''}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">{e.description}</p>
                {e.tags && e.tags.length > 0 && (
                  <ul className="mt-3 flex flex-wrap gap-1.5">
                    {e.tags.map((t) => (
                      <li key={t} className="chip !text-[11px]">
                        {t}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
