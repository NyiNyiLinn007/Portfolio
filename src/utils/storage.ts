/** Safe localStorage helpers — never throw (private mode, disabled storage, SSR). */

const PREFIX = 'developer-room:'

export function readStorage<T>(key: string, fallback: T): T {
  try {
    if (typeof window === 'undefined') return fallback
    const raw = window.localStorage.getItem(PREFIX + key)
    return raw === null ? fallback : (JSON.parse(raw) as T)
  } catch {
    return fallback
  }
}

export function writeStorage<T>(key: string, value: T): void {
  try {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    /* storage unavailable — preference simply won't persist */
  }
}

export function removeStorage(key: string): void {
  try {
    window.localStorage.removeItem(PREFIX + key)
  } catch {
    /* ignore */
  }
}
