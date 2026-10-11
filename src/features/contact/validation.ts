import type { ContactPayload } from '@/services/contactApi'

export type ContactErrors = Partial<Record<keyof ContactPayload, string>>

export const CONTACT_LIMITS = {
  name: { min: 2, max: 80 },
  subject: { min: 3, max: 120 },
  message: { min: 10, max: 2000 },
} as const

// Pragmatic email check (RFC-complete validation belongs on the server).
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function validateContact(values: ContactPayload): ContactErrors {
  const errors: ContactErrors = {}
  const name = values.name.trim()
  const email = values.email.trim()
  const subject = values.subject.trim()
  const message = values.message.trim()

  if (!name) errors.name = 'Please enter your name.'
  else if (name.length < CONTACT_LIMITS.name.min) errors.name = `Name must be at least ${CONTACT_LIMITS.name.min} characters.`
  else if (name.length > CONTACT_LIMITS.name.max) errors.name = `Name must be at most ${CONTACT_LIMITS.name.max} characters.`

  if (!email) errors.email = 'Please enter your email address.'
  else if (!EMAIL_RE.test(email) || email.length > 254) errors.email = 'Please enter a valid email address.'

  if (!subject) errors.subject = 'Please add a subject.'
  else if (subject.length < CONTACT_LIMITS.subject.min) errors.subject = `Subject must be at least ${CONTACT_LIMITS.subject.min} characters.`
  else if (subject.length > CONTACT_LIMITS.subject.max) errors.subject = `Subject must be at most ${CONTACT_LIMITS.subject.max} characters.`

  if (!message) errors.message = 'Please write a message.'
  else if (message.length < CONTACT_LIMITS.message.min) errors.message = `Message must be at least ${CONTACT_LIMITS.message.min} characters.`
  else if (message.length > CONTACT_LIMITS.message.max) errors.message = `Message must be at most ${CONTACT_LIMITS.message.max} characters.`

  return errors
}

export const hasErrors = (e: ContactErrors) => Object.keys(e).length > 0
