import { ArrowUpRight, Boxes, Cpu, FlaskConical, Server, Smartphone } from 'lucide-react'
import type { Project, ProjectCategory } from '@/types/portfolio'
import { assetUrl } from '@/utils/assetUrl'

export const CATEGORY_META: Record<ProjectCategory, { label: string; className: string; gradient: string; Icon: typeof Server }> = {
  backend: { label: 'Backend', className: 'text-cyan-300 border-cyan-300/30 bg-cyan-400/10', gradient: 'from-cyan-500/40 via-sky-600/25 to-night-800', Icon: Server },
  frontend: { label: 'Frontend', className: 'text-violet-300 border-violet-300/30 bg-violet-400/10', gradient: 'from-violet-500/40 via-indigo-600/25 to-night-800', Icon: Boxes },
  mobile: { label: 'Mobile', className: 'text-sky-300 border-sky-300/30 bg-sky-400/10', gradient: 'from-sky-500/40 via-blue-600/25 to-night-800', Icon: Smartphone },
  experimental: { label: 'Experimental', className: 'text-pink-300 border-pink-300/30 bg-pink-400/10', gradient: 'from-pink-500/35 via-fuchsia-600/20 to-night-800', Icon: FlaskConical },
}

/** Screenshot if configured, otherwise a generated gradient cover (no large placeholder images). */
export function ProjectCover({ project, className = 'h-32' }: { project: Project; className?: string }) {
  const meta = CATEGORY_META[project.category]
  if (project.image) {
    return <img src={assetUrl(project.image)} alt={`Screenshot of ${project.name}`} loading="lazy" className={`w-full rounded-xl object-cover ${className}`} />
  }
  return (
    <div className={`relative w-full overflow-hidden rounded-xl bg-linear-to-br ${meta.gradient} ${className}`} aria-hidden="true">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.07)_1px,transparent_1px)] bg-[size:18px_18px]" />
      <meta.Icon className="absolute right-4 bottom-3 size-12 text-white/15" strokeWidth={1.25} />
      <Cpu className="absolute top-3 left-4 size-4 text-white/30" />
      <span className="absolute top-3 left-10 font-mono text-[10px] tracking-widest text-white/40 uppercase">{project.tech[0]}</span>
    </div>
  )
}

export function SampleBadge() {
  return (
    <span className="inline-flex items-center rounded-full border border-amber-300/30 bg-amber-400/10 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-amber-200 uppercase" title="Fictional sample entry — replace with real content">
      Sample
    </span>
  )
}

export function ProjectCard({ project, onOpen }: { project: Project; onOpen: (p: Project) => void }) {
  const meta = CATEGORY_META[project.category]
  const extra = project.tech.length - 4
  return (
    <article className="group relative flex flex-col rounded-2xl border border-white/8 bg-white/[0.03] p-3 transition hover:border-cyan-300/30 hover:bg-white/[0.05]">
      <ProjectCover project={project} />
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${meta.className}`}>
          <meta.Icon className="size-3" aria-hidden="true" />
          {meta.label}
        </span>
        {project.isSample && <SampleBadge />}
        {project.year && !project.isSample && <span className="text-[11px] text-slate-500">{project.year}</span>}
      </div>
      <h3 className="mt-2 text-base font-semibold text-white">{project.name}</h3>
      <p className="mt-1 line-clamp-2 text-sm text-slate-400">{project.summary}</p>
      <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Technologies">
        {project.tech.slice(0, 4).map((t) => (
          <li key={t} className="chip !py-0.5 !text-[11px]">
            {t}
          </li>
        ))}
        {extra > 0 && <li className="chip !py-0.5 !text-[11px]">+{extra}</li>}
      </ul>
      <button
        type="button"
        onClick={() => onOpen(project)}
        className="mt-3 inline-flex items-center gap-1 self-start rounded-lg text-sm font-medium text-cyan-300 hover:text-cyan-200 after:absolute after:inset-0 after:rounded-2xl after:content-['']"
        aria-label={`View details for ${project.name}`}
      >
        View details <ArrowUpRight className="size-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
      </button>
    </article>
  )
}
