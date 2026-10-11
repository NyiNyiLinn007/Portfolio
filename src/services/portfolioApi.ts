import { portfolio as localPortfolio } from '@/data/portfolio'
import type { PortfolioData, Project, SkillCategory, TimelineEntry } from '@/types/portfolio'
import { apiRequest } from './apiClient'
import { config } from './config'

/**
 * Portfolio data access layer.
 *
 * Frontend-only mode (default): returns the local data from `src/data/portfolio.ts`.
 * Backend mode (`VITE_USE_REMOTE_PORTFOLIO=true` + `VITE_API_BASE_URL`): calls the
 * endpoints below and falls back to local data if the request fails.
 *
 *   GET /api/portfolio   -> PortfolioData
 *   GET /api/projects    -> Project[]
 *   GET /api/skills      -> SkillCategory[]
 *   GET /api/experience  -> TimelineEntry[]
 */
export interface PortfolioResult {
  data: PortfolioData
  source: 'local' | 'remote'
  error?: string
}

async function withFallback<T>(remote: () => Promise<T>, local: T): Promise<{ value: T; source: 'local' | 'remote'; error?: string }> {
  if (!config.useRemotePortfolio) return { value: local, source: 'local' }
  try {
    return { value: await remote(), source: 'remote' }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.warn('[portfolioApi] Falling back to local data:', message)
    return { value: local, source: 'local', error: message }
  }
}

export async function getPortfolio(): Promise<PortfolioResult> {
  const result = await withFallback(() => apiRequest<PortfolioData>('/api/portfolio'), localPortfolio)
  return { data: result.value, source: result.source, error: result.error }
}

export async function getProjects(): Promise<Project[]> {
  return (await withFallback(() => apiRequest<Project[]>('/api/projects'), localPortfolio.projects)).value
}

export async function getSkills(): Promise<SkillCategory[]> {
  return (await withFallback(() => apiRequest<SkillCategory[]>('/api/skills'), localPortfolio.skills)).value
}

export async function getExperience(): Promise<TimelineEntry[]> {
  return (await withFallback(() => apiRequest<TimelineEntry[]>('/api/experience'), localPortfolio.experience)).value
}
