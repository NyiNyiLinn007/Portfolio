import { Component, type ErrorInfo, type ReactNode } from 'react'
import { useAppStore } from '@/store/useAppStore'

/** Catches renderer/scene crashes and switches the app to the WebGL fallback UI. */
export class SceneErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[DeveloperRoom] 3D scene failed to render:', error, info.componentStack)
    useAppStore.getState().setWebGL('failed')
  }

  render() {
    return this.state.failed ? null : this.props.children
  }
}
