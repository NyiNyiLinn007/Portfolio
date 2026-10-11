import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { Panel } from '@/components/ui/Panel'
import { PortfolioProvider } from '@/app/PortfolioProvider'
import { AboutContent } from '@/features/about/AboutContent'
import { portfolio } from '@/data/portfolio'

describe('Panel', () => {
  it('renders an accessible dialog and closes on Escape', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()
    render(
      <Panel open onClose={onClose} title="About Me">
        <p>Panel body</p>
      </Panel>,
    )
    expect(screen.getByRole('dialog', { name: 'About Me' })).toBeInTheDocument()
    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('closes from the close button', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()
    render(
      <Panel open onClose={onClose} title="Skills">
        <p>Body</p>
      </Panel>,
    )
    await user.click(screen.getByRole('button', { name: /close/i }))
    expect(onClose).toHaveBeenCalled()
  })
})

describe('AboutContent resume button', () => {
  const renderAbout = (resumePath: string | null) =>
    render(
      <MemoryRouter>
        <PortfolioProvider initialData={{ ...portfolio, resumePath }}>
          <AboutContent />
        </PortfolioProvider>
      </MemoryRouter>,
    )

  it('is disabled with a configuration message when no resume is configured', () => {
    renderAbout(null)
    expect(screen.getByRole('button', { name: /download resume/i })).toBeDisabled()
    expect(screen.getByText(/resume not configured/i)).toBeInTheDocument()
  })

  it('links to the file when a resume is configured', () => {
    renderAbout('/resume.pdf')
    expect(screen.getByRole('link', { name: /download resume/i })).toHaveAttribute('href', '/resume.pdf')
    expect(screen.queryByText(/resume not configured/i)).not.toBeInTheDocument()
  })
})
