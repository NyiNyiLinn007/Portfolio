import { useMemo, useState } from 'react'
import { ArrowLeft, CheckCircle2, ExternalLink } from 'lucide-react'
import { usePortfolio } from '@/app/PortfolioProvider'
import type { Project, ProjectCategory } from '@/types/portfolio'
import { CATEGORY_META, ProjectCard, ProjectCover, SampleBadge } from '@/components/ui/ProjectCard'
import { SocialIcon, externalLinkProps, isSafeUrl } from '@/components/ui/SocialIcon'

export type ProjectFilter = 'all' | ProjectCategory
const FILTERS: { id: ProjectFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'backend', label: 'Backend' },
  { id: 'frontend', label: 'Frontend' },
  { id: 'mobile', label: 'Mobile' },
  { id: 'experimental', label: 'Experimental' },
]

export function filterProjects(projects: Project[], filter: ProjectFilter) {
  return filter === 'all' ? projects : projects.filter((p) => p.category === filter)
}

export function ProjectsContent({ columns = 'sm:grid-cols-2' }: { columns?: string }) {
  const { projects } = usePortfolio()
  const [filter, setFilter] = useState<ProjectFilter>('all')
  const [selected, setSelected] = useState<Project | null>(null)
  const visible = useMemo(() => filterProjects(projects, filter), [projects, filter])

  if (selected) return <ProjectDetail project={selected} onBack={() => setSelected(null)} />

  return (
    <div>
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1" role="group" aria-label="Filter projects by category">
        {FILTERS.map((f) => {
          const count = filterProjects(projects, f.id).length
          const active = filter === f.id
          const empty = count === 0 && f.id !== 'all'
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              aria-pressed={active}
              disabled={empty}
              title={empty ? `No ${f.label.toLowerCase()} projects yet` : undefined}
              className={`inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${
                active ? 'border-cyan-300/50 bg-cyan-400/15 text-cyan-100' : 'border-slate-400/15 bg-white/[0.03] text-slate-400 enabled:hover:text-slate-200'
              }`}
            >
              {f.label}
              <span className={`text-[11px] ${active ? 'text-cyan-200/80' : 'text-slate-500'}`}>{count}</span>
            </button>
          )
        })}
      </div>

      <p className="mt-3 text-xs text-slate-500" aria-live="polite">
        Showing {visible.length} of {projects.length} projects
      </p>

      {visible.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-dashed border-slate-400/20 p-6 text-center text-sm text-slate-400">No projects in this category yet.</p>
      ) : (
        <ul className={`mt-3 grid gap-3 ${columns}`}>
          {visible.map((p) => (
            <li key={p.id}>
              <ProjectCard project={p} onOpen={setSelected} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function ProjectDetail({ project, onBack }: { project: Project; onBack: () => void }) {
  const meta = CATEGORY_META[project.category]
  const github = isSafeUrl(project.githubUrl) ? project.githubUrl : null
  const live = isSafeUrl(project.liveUrl) ? project.liveUrl : null
  return (
    <article aria-labelledby="project-detail-title">
      <button type="button" onClick={onBack} className="btn-ghost -ml-3 !min-h-9 !px-3">
        <ArrowLeft className="size-4" aria-hidden="true" /> All projects
      </button>
      <ProjectCover project={project} className="mt-2 h-40" />
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${meta.className}`}>
          <meta.Icon className="size-3" aria-hidden="true" />
          {meta.label}
        </span>
        {project.isSample && <SampleBadge />}
        {project.year && <span className="text-xs text-slate-500">{project.year}</span>}
      </div>
      <h3 id="project-detail-title" className="mt-2 text-xl font-semibold text-white">
        {project.name}
      </h3>
      <p className="mt-2 text-[15px] leading-relaxed text-slate-300">{project.description}</p>

      {project.isSample && (
        <p className="mt-3 rounded-xl border border-amber-300/20 bg-amber-400/5 p-3 text-xs text-amber-100/90">
          This is a fictional sample project used as demo content.
          {import.meta.env.DEV && (
            <>
              {' '}Replace it in <code className="font-mono">src/data/portfolio.ts</code>.
            </>
          )}
        </p>
      )}

      <h4 className="mt-5 text-sm font-semibold text-white">Highlights</h4>
      <ul className="mt-2 space-y-2">
        {project.highlights.map((h) => (
          <li key={h} className="flex gap-2.5 text-sm text-slate-300">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-cyan-300" aria-hidden="true" />
            {h}
          </li>
        ))}
      </ul>

      <h4 className="mt-5 text-sm font-semibold text-white">Technology stack</h4>
      <ul className="mt-2 flex flex-wrap gap-1.5">
        {project.tech.map((t) => (
          <li key={t} className="chip">
            {t}
          </li>
        ))}
      </ul>

      <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
        {github && (
          <a {...externalLinkProps(github)} className="btn-secondary flex-1">
            <SocialIcon platform="github" className="size-4" /> Source code
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        )}
        {live && (
          <a {...externalLinkProps(live)} className="btn-primary flex-1">
            <ExternalLink className="size-4" aria-hidden="true" /> Live demo
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        )}
      </div>
      {import.meta.env.DEV && !github && !live && (
        <p className="mt-4 text-xs text-slate-500">No public repository or live demo is configured for this project.</p>
      )}
    </article>
  )
}
