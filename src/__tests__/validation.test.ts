import { describe, expect, it } from 'vitest'
import { hasErrors, validateContact } from '@/features/contact/validation'

const valid = { name: 'Ada Lovelace', email: 'ada@example.com', subject: 'Hello there', message: 'I would like to talk about a project.' }

describe('validateContact', () => {
  it('accepts a valid message', () => {
    expect(hasErrors(validateContact(valid))).toBe(false)
  })

  it('requires every field', () => {
    const errors = validateContact({ name: '', email: '', subject: '', message: '' })
    expect(Object.keys(errors).sort()).toEqual(['email', 'message', 'name', 'subject'])
  })

  it('treats whitespace-only input as empty', () => {
    const errors = validateContact({ ...valid, name: '    ' })
    expect(errors.name).toMatch(/enter your name/i)
  })

  it.each(['plainaddress', 'a@b', 'a@b.c', 'with space@example.com', '@example.com'])('rejects invalid email %s', (email) => {
    expect(validateContact({ ...valid, email }).email).toMatch(/valid email/i)
  })

  it('enforces minimum and maximum lengths', () => {
    expect(validateContact({ ...valid, message: 'too short' }).message).toMatch(/at least/i)
    expect(validateContact({ ...valid, subject: 'x'.repeat(121) }).subject).toMatch(/at most/i)
  })
})
