import { ArrowUpRight, Settings2 } from 'lucide-react'
import { usePortfolio } from '@/app/PortfolioProvider'
import { SocialIcon, externalLinkProps, isSafeUrl } from '@/components/ui/SocialIcon'

export function SocialContent() {
  const { socialLinks } = usePortfolio()
  return (
    <div>
      <p className="mb-4 text-sm text-slate-400">The city never sleeps — and neither do these feeds. Find me around the web:</p>
      <ul className="space-y-2.5">
        {socialLinks.map((link) => {
          const configured = isSafeUrl(link.url)
          const inner = (
            <>
              <span className={`flex size-11 shrink-0 items-center justify-center rounded-xl border ${configured ? 'border-cyan-300/25 bg-cyan-400/10 text-cyan-200' : 'border-slate-400/15 bg-white/5 text-slate-500'}`}>
                <SocialIcon platform={link.platform} />
              </span>
              <span className="min-w-0 flex-1">
                <span className={`block font-medium ${configured ? 'text-white' : 'text-slate-400'}`}>{link.label}</span>
                <span className="block truncate text-xs text-slate-500">{configured ? link.handle ?? link.url : 'Not configured yet'}</span>
              </span>
              {configured ? (
                <ArrowUpRight className="size-4 text-slate-400 transition group-hover:text-cyan-300" aria-hidden="true" />
              ) : (
                <Settings2 className="size-4 text-slate-600" aria-hidden="true" />
              )}
            </>
          )
          return (
            <li key={link.platform + link.label}>
              {configured ? (
                <a
                  {...externalLinkProps(link.url)}
                  className="group flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] p-3 transition hover:border-cyan-300/30 hover:bg-white/[0.06]"
                >
                  {inner}
                  {!link.url.startsWith('mailto:') && <span className="sr-only">(opens in a new tab)</span>}
                </a>
              ) : (
                <div className="flex items-center gap-3 rounded-2xl border border-dashed border-slate-400/15 p-3" aria-label={`${link.label}: not configured yet`}>
                  {inner}
                </div>
              )}
            </li>
          )
        })}
      </ul>
      <p className="mt-4 text-xs text-slate-500">
        Links are configured in <code className="font-mono">socialLinks</code> inside <code className="font-mono">src/data/portfolio.ts</code>. Empty URLs are shown as “not configured” instead of broken links.
      </p>
    </div>
  )
}
