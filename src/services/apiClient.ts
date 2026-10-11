import { config } from './config'

export class ApiError extends Error {
  readonly status: number | null

  constructor(message: string, status: number | null = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

/**
 * Minimal fetch wrapper: base URL, JSON, timeout and consistent errors.
 * Credentials are never attached automatically.
 */
export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!config.apiBaseUrl) throw new ApiError('No backend configured (VITE_API_BASE_URL is empty).')

  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), config.requestTimeoutMs)

  try {
    const response = await fetch(`${config.apiBaseUrl}${path}`, {
      ...init,
      headers: {
        Accept: 'application/json',
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
        ...init.headers,
      },
      signal: controller.signal,
    })

    if (!response.ok) {
      let message = `Request failed with status ${response.status}`
      try {
        const body = (await response.json()) as { message?: string }
        if (body?.message) message = body.message
      } catch {
        /* non-JSON error body */
      }
      throw new ApiError(message, response.status)
    }

    if (response.status === 204) return undefined as T
    return (await response.json()) as T
  } catch (error) {
    if (error instanceof ApiError) throw error
    if (error instanceof DOMException && error.name === 'AbortError') throw new ApiError('The request timed out.')
    throw new ApiError('Network error — the server could not be reached.')
  } finally {
    window.clearTimeout(timeout)
  }
}
