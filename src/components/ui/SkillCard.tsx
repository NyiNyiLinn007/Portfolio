import { Database, Handshake, Layout, Server, Wrench } from 'lucide-react'
import type { SkillCategory, SkillCategoryId } from '@/types/portfolio'

const ICONS: Record<SkillCategoryId, typeof Server> = {
  backend: Server,
  frontend: Layout,
  database: Database,
  tools: Wrench,
  soft: Handshake,
}

const ACCENTS: Record<SkillCategoryId, string> = {
  backend: 'text-cyan-300 bg-cyan-400/10 border-cyan-300/25',
  frontend: 'text-violet-300 bg-violet-400/10 border-violet-300/25',
  database: 'text-sky-300 bg-sky-400/10 border-sky-300/25',
  tools: 'text-emerald-300 bg-emerald-400/10 border-emerald-300/25',
  soft: 'text-amber-300 bg-amber-400/10 border-amber-300/25',
}

/** Skill category card. Levels are only shown if explicitly configured — no invented percentages. */
export function SkillCard({ category }: { category: SkillCategory }) {
  const Icon = ICONS[category.id]
  return (
    <section className="rounded-2xl border border-white/8 bg-white/[0.03] p-4" aria-labelledby={`skill-${category.id}`}>
      <div className="flex items-center gap-3">
        <span className={`flex size-9 items-center justify-center rounded-xl border ${ACCENTS[category.id]}`}>
          <Icon className="size-4.5" aria-hidden="true" />
        </span>
        <div>
          <h3 id={`skill-${category.id}`} className="font-semibold text-white">
            {category.title}
          </h3>
          <p className="text-xs text-slate-400">{category.description}</p>
        </div>
      </div>
      <ul className="mt-4 space-y-2">
        {category.skills.map((skill) => (
          <li key={skill.name} className="flex items-start justify-between gap-3 rounded-xl border border-white/5 bg-night-950/40 px-3 py-2">
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-100">{skill.name}</p>
              {skill.detail && <p className="text-xs text-slate-400">{skill.detail}</p>}
            </div>
            {skill.level && <span className="chip shrink-0 !text-[10px]">{skill.level}</span>}
          </li>
        ))}
      </ul>
    </section>
  )
}
