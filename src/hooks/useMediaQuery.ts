import { useSyncExternalStore } from 'react'

/** Subscribes to a CSS media query. */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      if (typeof window === 'undefined' || !window.matchMedia) return () => {}
      const mql = window.matchMedia(query)
      mql.addEventListener('change', onChange)
      return () => mql.removeEventListener('change', onChange)
    },
    () => (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(query).matches : false),
    () => false,
  )
}

export const useReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)')

/** Matches the breakpoint where panels render as a side panel instead of a bottom sheet. */
export const useIsDesktop = () => useMediaQuery('(min-width: 1024px)')

export const useCoarsePointer = () => useMediaQuery('(pointer: coarse)')
