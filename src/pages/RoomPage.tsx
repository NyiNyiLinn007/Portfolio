import { lazy, Suspense, useLayoutEffect } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { isWebGLAvailable } from '@/utils/webgl'
import { SceneErrorBoundary } from '@/components/layout/SceneErrorBoundary'
import { Navigation } from '@/components/layout/Navigation'
import { HeroOverlay } from '@/components/layout/HeroOverlay'
import { RoomHud } from '@/components/layout/RoomHud'
import { SectionPanel } from '@/components/layout/SectionPanel'
import { LoadingScreen } from '@/components/layout/LoadingScreen'
import { Tooltip } from '@/components/ui/Tooltip'
import { PageFallback } from '@/components/layout/PageFallback'

const Experience = lazy(() => import('@/scene/Experience'))
const ClassicPortfolio = lazy(() => import('@/pages/ClassicPortfolio'))

function FallbackNotice({ failed }: { failed: boolean }) {
  return (
    <div className="flex items-start gap-3">
      <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-300" aria-hidden="true" />
      <p>
        {failed
          ? 'The 3D room could not be rendered on this device, so you are viewing the classic portfolio instead.'
          : 'Your browser does not support WebGL, so the 3D room is unavailable. All portfolio content is shown below.'}
      </p>
    </div>
  )
}

/** The main interactive room route. Falls back to the classic portfolio if WebGL is unavailable or crashes. */
export default function RoomPage() {
  const webgl = useAppStore((s) => s.webgl)

  // Layout effect so the loading state is reset before child effects (Experience) mark milestones.
  useLayoutEffect(() => {
    const { resetLoading, setWebGL } = useAppStore.getState()
    resetLoading()
    setWebGL(isWebGLAvailable() ? 'supported' : 'unsupported')
  }, [])

  if (webgl === 'unsupported' || webgl === 'failed') {
    return (
      <Suspense fallback={<PageFallback />}>
        <ClassicPortfolio notice={<FallbackNotice failed={webgl === 'failed'} />} />
      </Suspense>
    )
  }

  return (
    <>
      <a href="#main-nav" className="sr-only-focusable">
        Skip to navigation
      </a>
      <Link to="/classic" className="sr-only-focusable">
        Switch to the accessible classic portfolio
      </Link>

      <div className="fixed inset-0 bg-night-950" aria-hidden="true">
        {webgl === 'supported' && (
          <SceneErrorBoundary>
            <Suspense fallback={null}>
              <Experience />
            </Suspense>
          </SceneErrorBoundary>
        )}
      </div>

      <Navigation />
      <HeroOverlay />
      <RoomHud />
      <SectionPanel />
      <Tooltip />
      <LoadingScreen />
    </>
  )
}
