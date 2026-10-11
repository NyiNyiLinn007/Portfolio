import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { PortfolioProvider } from '@/app/PortfolioProvider'
import { ProjectsContent, filterProjects } from '@/features/projects/ProjectsContent'
import { portfolio } from '@/data/portfolio'

const renderProjects = () =>
  render(
    <MemoryRouter>
      <PortfolioProvider>
        <ProjectsContent />
      </PortfolioProvider>
    </MemoryRouter>,
  )

describe('projects', () => {
  it('filterProjects returns all or only matching categories', () => {
    expect(filterProjects(portfolio.projects, 'all')).toHaveLength(portfolio.projects.length)
    const backend = filterProjects(portfolio.projects, 'backend')
    expect(backend.length).toBeGreaterThan(0)
    expect(backend.every((p) => p.category === 'backend')).toBe(true)
  })

  it('filters the rendered list when a category is selected', async () => {
    const user = userEvent.setup()
    renderProjects()
    const group = screen.getByRole('group', { name: /filter projects/i })
    const allBtn = within(group).getByRole('button', { name: /^all/i })
    expect(allBtn).toHaveAttribute('aria-pressed', 'true')

    await user.click(within(group).getByRole('button', { name: /^frontend/i }))
    const frontendCount = filterProjects(portfolio.projects, 'frontend').length
    expect(screen.getByText(`Showing ${frontendCount} of ${portfolio.projects.length} projects`)).toBeInTheDocument()
    expect(within(group).getByRole('button', { name: /^frontend/i })).toHaveAttribute('aria-pressed', 'true')
    expect(allBtn).toHaveAttribute('aria-pressed', 'false')
  })

  it('disables categories that have no projects', () => {
    renderProjects()
    const group = screen.getByRole('group', { name: /filter projects/i })
    for (const id of ['backend', 'frontend', 'mobile', 'experimental'] as const) {
      const btn = within(group).getByRole('button', { name: new RegExp(`^${id}`, 'i') })
      if (filterProjects(portfolio.projects, id).length === 0) expect(btn).toBeDisabled()
      else expect(btn).toBeEnabled()
    }
  })
})
