import { create } from 'zustand'
import type { SectionId } from '@/data/sections'
import { readStorage, writeStorage } from '@/utils/storage'
import { prefersLowQuality } from '@/utils/webgl'

export type Phase = 'loading' | 'intro' | 'room'
export type Quality = 'high' | 'low'
export type WebGLStatus = 'checking' | 'supported' | 'unsupported' | 'failed'

/** Real initialisation milestones — the loading bar only advances when these complete. */
export const LOAD_STEPS = ['module', 'renderer', 'scene', 'compiled'] as const
export type LoadStep = (typeof LOAD_STEPS)[number]

export const LOAD_STEP_LABELS: Record<LoadStep, string> = {
  module: 'Loading 3D engine',
  renderer: 'Initialising renderer',
  scene: 'Building the room',
  compiled: 'Compiling shaders',
}

export type CameraCommand = 'rotate-left' | 'rotate-right' | 'zoom-in' | 'zoom-out' | 'reset'

interface AppState {
  phase: Phase
  introSeen: boolean
  activeSection: SectionId | null
  hovered: SectionId | null
  quality: Quality
  soundOn: boolean
  webgl: WebGLStatus
  loaded: Record<LoadStep, boolean>
  /** Incrementing counter + command so the camera controller can react to HUD buttons. */
  cameraCommand: { id: number; type: CameraCommand | null; instant?: boolean }

  setPhase: (phase: Phase) => void
  enterRoom: (opts?: { instant?: boolean }) => void
  showIntro: () => void
  openSection: (id: SectionId) => void
  closeSection: () => void
  setHovered: (id: SectionId | null) => void
  setQuality: (q: Quality) => void
  setSoundOn: (on: boolean) => void
  setWebGL: (s: WebGLStatus) => void
  markLoaded: (step: LoadStep) => void
  sendCameraCommand: (type: CameraCommand, instant?: boolean) => void
  resetLoading: () => void
}

const initialQuality: Quality = readStorage<Quality | null>('quality', null) ?? (prefersLowQuality() ? 'low' : 'high')

export const useAppStore = create<AppState>((set, get) => ({
  phase: 'loading',
  introSeen: readStorage<boolean>('introSeen', false),
  activeSection: null,
  hovered: null,
  quality: initialQuality,
  soundOn: false, // ambient audio is always muted on load and only starts after a deliberate click
  webgl: 'checking',
  loaded: { module: false, renderer: false, scene: false, compiled: false },
  cameraCommand: { id: 0, type: null },

  setPhase: (phase) => set({ phase }),
  enterRoom: (opts) => {
    writeStorage('introSeen', true)
    set({ phase: 'room', introSeen: true })
    if (opts?.instant) get().sendCameraCommand('reset', true)
  },
  showIntro: () => set({ phase: 'intro', activeSection: null }),
  openSection: (id) => {
    if (get().phase !== 'room') writeStorage('introSeen', true)
    set({ activeSection: id, phase: 'room', introSeen: true, hovered: null })
  },
  closeSection: () => set({ activeSection: null }),
  setHovered: (hovered) => {
    if (get().hovered !== hovered) set({ hovered })
  },
  setQuality: (quality) => {
    writeStorage('quality', quality)
    set({ quality })
  },
  setSoundOn: (soundOn) => set({ soundOn }),
  setWebGL: (webgl) => set({ webgl }),
  markLoaded: (step) => {
    if (!get().loaded[step]) set((s) => ({ loaded: { ...s.loaded, [step]: true } }))
  },
  sendCameraCommand: (type, instant) => set((s) => ({ cameraCommand: { id: s.cameraCommand.id + 1, type, instant } })),
  resetLoading: () =>
    set({
      phase: 'loading',
      activeSection: null,
      hovered: null,
      loaded: { module: false, renderer: false, scene: false, compiled: false },
    }),
}))

export const selectLoadProgress = (s: AppState) => LOAD_STEPS.filter((k) => s.loaded[k]).length / LOAD_STEPS.length
