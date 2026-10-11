import { apiRequest } from './apiClient'
import { config, type ContactMode } from './config'

export interface ContactPayload {
  name: string
  email: string
  subject: string
  message: string
}

/**
 * Outcome of a submission. `delivered` is only true when a backend accepted the message —
 * demo mode NEVER reports delivery.
 */
export type ContactResult = { delivered: true; mode: 'api' } | { delivered: false; mode: 'demo' }

export function getContactMode(): ContactMode {
  return config.contactMode
}

/**
 * Sends the contact form.
 * - demo: no network request is made; resolves with `{ delivered: false }`.
 * - api:  POST {VITE_API_BASE_URL}/api/contact; rejects with ApiError on failure.
 */
export async function sendContactMessage(payload: ContactPayload, mode: ContactMode = config.contactMode): Promise<ContactResult> {
  if (mode === 'demo') {
    // Small delay so the loading state is perceivable; nothing leaves the browser.
    await new Promise((resolve) => setTimeout(resolve, 650))
    return { delivered: false, mode: 'demo' }
  }

  await apiRequest<unknown>('/api/contact', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return { delivered: true, mode: 'api' }
}
