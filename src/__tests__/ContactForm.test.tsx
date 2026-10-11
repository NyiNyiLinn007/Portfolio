import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ContactForm } from '@/components/ui/ContactForm'

async function fillValid() {
  const user = userEvent.setup()
  await user.type(screen.getByLabelText(/^name/i), 'Ada Lovelace')
  await user.type(screen.getByLabelText(/^email/i), 'ada@example.com')
  await user.type(screen.getByLabelText(/^subject/i), 'Project enquiry')
  await user.type(screen.getByLabelText(/^message/i), 'Hello! I would like to discuss a project with you.')
  return user
}

describe('ContactForm', () => {
  it('shows validation errors when submitted empty', async () => {
    const user = userEvent.setup()
    render(<ContactForm email="me@example.com" mode="demo" />)
    await user.click(screen.getByRole('button', { name: /submit/i }))
    expect(screen.getByText(/please enter your name/i)).toBeInTheDocument()
    expect(screen.getByText(/please enter your email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^name/i)).toHaveAttribute('aria-invalid', 'true')
  })

  it('in demo mode never claims the message was delivered', async () => {
    render(<ContactForm email="me@example.com" mode="demo" />)
    expect(screen.getByText(/demo mode:/i)).toBeInTheDocument()
    const user = await fillValid()
    await user.click(screen.getByRole('button', { name: /submit \(demo\)/i }))
    expect(await screen.findByText(/not sent/i)).toBeInTheDocument()
    expect(screen.queryByText(/sent successfully/i)).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /open in your email app/i })).toHaveAttribute('href', expect.stringMatching(/^mailto:me@example\.com/))
  })
})
