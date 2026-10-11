import { MotionConfig } from 'framer-motion'
import { RouterProvider } from 'react-router-dom'
import { PortfolioProvider } from './PortfolioProvider'
import { router } from './router'

export function App() {
  return (
    <PortfolioProvider>
      {/* Respects the OS "reduce motion" preference for every Framer Motion animation. */}
      <MotionConfig reducedMotion="user">
        <RouterProvider router={router} />
      </MotionConfig>
    </PortfolioProvider>
  )
}
