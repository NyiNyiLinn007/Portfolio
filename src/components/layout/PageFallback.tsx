/** Minimal full-screen placeholder shown while a lazily loaded route chunk downloads. */
export function PageFallback() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-night-950 font-mono text-xs tracking-[0.3em] text-slate-500 uppercase" role="status">
      Loading…
    </div>
  )
}
