import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import RoomPage from '@/pages/RoomPage'
import { PageFallback } from '@/components/layout/PageFallback'

const ClassicPortfolio = lazy(() => import('@/pages/ClassicPortfolio'))

export const router = createBrowserRouter(
  [
    { path: '/', element: <RoomPage /> },
    {
      path: '/classic',
      element: (
        <Suspense fallback={<PageFallback />}>
          <ClassicPortfolio />
        </Suspense>
      ),
    },
    { path: '*', element: <Navigate to="/" replace /> },
  ],
  { basename: import.meta.env.BASE_URL.replace(/\/$/, '') || '/' },
)
