import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { portfolio as localPortfolio } from '@/data/portfolio'
import { getPortfolio } from '@/services/portfolioApi'
import { config } from '@/services/config'
import type { PortfolioData } from '@/types/portfolio'

interface PortfolioContextValue {
  data: PortfolioData
  source: 'local' | 'remote'
}

const PortfolioContext = createContext<PortfolioContextValue>({ data: localPortfolio, source: 'local' })

/**
 * Provides portfolio content to the whole app. Renders immediately with local data,
 * then swaps in remote data if a backend is configured and reachable.
 */
export function PortfolioProvider({ children, initialData = localPortfolio }: { children: ReactNode; initialData?: PortfolioData }) {
  const [value, setValue] = useState<PortfolioContextValue>({ data: initialData, source: 'local' })

  useEffect(() => {
    if (!config.useRemotePortfolio) return
    let cancelled = false
    getPortfolio().then((result) => {
      if (!cancelled && result.source === 'remote') setValue({ data: result.data, source: 'remote' })
    })
    return () => {
      cancelled = true
    }
  }, [])

  return <PortfolioContext.Provider value={value}>{children}</PortfolioContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const usePortfolio = () => useContext(PortfolioContext).data
