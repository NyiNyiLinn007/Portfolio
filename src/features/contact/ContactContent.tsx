import { Clock, Mail, Sparkles } from 'lucide-react'
import { usePortfolio } from '@/app/PortfolioProvider'
import { ContactForm } from '@/components/ui/ContactForm'

export function ContactContent() {
  const data = usePortfolio()
  return (
    <div className="space-y-5">
      <div className="grid gap-2.5 sm:grid-cols-2">
        <p className="flex items-start gap-2.5 rounded-xl border border-white/8 bg-white/[0.03] p-3 text-sm text-slate-300">
          <Sparkles className="mt-0.5 size-4 shrink-0 text-violet-300" aria-hidden="true" />
          {data.contact.availability}
        </p>
        <p className="flex items-start gap-2.5 rounded-xl border border-white/8 bg-white/[0.03] p-3 text-sm text-slate-300">
          <Clock className="mt-0.5 size-4 shrink-0 text-cyan-300" aria-hidden="true" />
          {data.contact.responseTime}
        </p>
      </div>
      <a href={`mailto:${data.email}`} className="group flex items-center gap-3 rounded-xl border border-cyan-300/20 bg-cyan-400/5 p-3 transition hover:bg-cyan-400/10">
        <Mail className="size-5 text-cyan-300" aria-hidden="true" />
        <span className="text-sm">
          <span className="block text-xs text-slate-400">Prefer email?</span>
          <span className="font-medium text-white group-hover:text-cyan-100">{data.email}</span>
        </span>
      </a>
      <ContactForm email={data.email} />
    </div>
  )
}
