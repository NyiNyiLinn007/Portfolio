/**
 * Detects whether the browser can create a WebGL context.
 * Runs once and caches the result. Creating a throwaway context is the only
 * reliable test — `window.WebGLRenderingContext` can exist while drivers are
 * blacklisted.
 */
let cached: boolean | null = null

export function isWebGLAvailable(): boolean {
  if (cached !== null) return cached
  try {
    const canvas = document.createElement('canvas')
    const gl =
      (canvas.getContext('webgl2') as WebGL2RenderingContext | null) ??
      (canvas.getContext('webgl') as WebGLRenderingContext | null)
    cached = !!gl
    // Release the probe context immediately so it does not count against the browser limit.
    const lose = gl?.getExtension('WEBGL_lose_context')
    lose?.loseContext()
  } catch {
    cached = false
  }
  return cached
}

/** Heuristic for picking a sensible default quality level. */
export function prefersLowQuality(): boolean {
  if (typeof window === 'undefined') return false
  const coarse = window.matchMedia?.('(pointer: coarse)').matches ?? false
  const small = Math.min(window.innerWidth, window.innerHeight) < 600
  const cores = navigator.hardwareConcurrency ?? 8
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8
  return (coarse && small) || cores <= 4 || memory <= 4
}
