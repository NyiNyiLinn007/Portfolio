/**
 * Runtime configuration derived from Vite environment variables.
 * All VITE_* values are PUBLIC (bundled into the client) — never store secrets here.
 */
export type ContactMode = 'demo' | 'api'

const rawBase = (import.meta.env.VITE_API_BASE_URL ?? '').trim()

export const config = {
  /** Backend base URL without trailing slash, or '' for frontend-only mode. */
  apiBaseUrl: rawBase.replace(/\/+$/, ''),
  useRemotePortfolio: import.meta.env.VITE_USE_REMOTE_PORTFOLIO === 'true' && rawBase !== '',
  /** "api" only takes effect when a backend URL is configured; otherwise the form stays in honest demo mode. */
  contactMode: (import.meta.env.VITE_CONTACT_MODE === 'api' && rawBase !== '' ? 'api' : 'demo') as ContactMode,
  requestTimeoutMs: 10_000,
} as const
