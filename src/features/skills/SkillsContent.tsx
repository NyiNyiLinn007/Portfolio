import { usePortfolio } from '@/app/PortfolioProvider'
import { SkillCard } from '@/components/ui/SkillCard'

export function SkillsContent({ columns = '' }: { columns?: string }) {
  const { skills } = usePortfolio()
  return (
    <div>
      <p className="mb-4 text-sm text-slate-400">The tools on my shelf — grouped by where they live in the stack.</p>
      <div className={`grid gap-3 ${columns}`}>
        {skills.map((c) => (
          <SkillCard key={c.id} category={c} />
        ))}
      </div>
    </div>
  )
}
