import { BookOpen, Coffee, Heart, Quote, Rocket } from 'lucide-react'
import type { ReactNode } from 'react'
import { usePortfolio } from '@/app/PortfolioProvider'

function FactCard({ icon, title, items, accent }: { icon: ReactNode; title: string; items: string[]; accent: string }) {
  return (
    <section className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
      <h3 className="flex items-center gap-2 font-semibold text-white">
        <span className={`flex size-8 items-center justify-center rounded-lg border ${accent}`}>{icon}</span>
        {title}
      </h3>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item} className="flex gap-2.5 text-sm text-slate-300">
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-slate-400/60" aria-hidden="true" />
            {item}
          </li>
        ))}
      </ul>
    </section>
  )
}

export function FunFactsContent() {
  const { funFacts } = usePortfolio()
  return (
    <div className="space-y-3">
      {funFacts.coffeeOrder && (
        <p className="flex items-start gap-3 rounded-2xl border border-amber-300/15 bg-linear-to-br from-amber-400/10 to-transparent p-4 text-sm text-amber-50/90">
          <Coffee className="mt-0.5 size-5 shrink-0 text-amber-300" aria-hidden="true" />
          <span>
            <span className="font-semibold text-amber-200">Current mug: </span>
            {funFacts.coffeeOrder}
          </span>
        </p>
      )}
      <FactCard icon={<Heart className="size-4" aria-hidden="true" />} title="Favourite dev activities" items={funFacts.favoriteActivities} accent="text-pink-300 border-pink-300/25 bg-pink-400/10" />
      <FactCard icon={<Rocket className="size-4" aria-hidden="true" />} title="Currently learning" items={funFacts.learningGoals} accent="text-cyan-300 border-cyan-300/25 bg-cyan-400/10" />
      <FactCard icon={<BookOpen className="size-4" aria-hidden="true" />} title="Coding philosophy" items={funFacts.philosophy} accent="text-violet-300 border-violet-300/25 bg-violet-400/10" />
      {funFacts.quote && (
        <figure className="relative overflow-hidden rounded-2xl border border-violet-300/20 bg-linear-to-br from-violet-500/15 via-night-800/40 to-cyan-500/10 p-5">
          <Quote className="absolute top-3 right-3 size-10 text-white/10" aria-hidden="true" />
          <blockquote className="text-lg leading-snug font-medium text-white">“{funFacts.quote.text}”</blockquote>
          <figcaption className="mt-2 text-sm text-slate-400">— {funFacts.quote.author}</figcaption>
        </figure>
      )}
    </div>
  )
}
