import type { SectionId } from '@/data/sections'

/**
 * Room layout in metres. The room spans x ∈ [-W, W], z ∈ [-D, D], y ∈ [0, H].
 * The back wall (z = -D) holds the panoramic window, desk and door.
 */
export const ROOM = { W: 4, D: 4, H: 3.2, wallThickness: 0.15 } as const

export const WINDOW = { x0: -3.0, x1: 1.4, y0: 0.85, y1: 2.85 } as const
export const DOOR = { x0: 2.375, x1: 3.325, height: 2.15 } as const
export const DESK = { x: -0.8, z: -3.5, width: 2.8, depth: 0.85, height: 0.76 } as const

export type Vec3 = [number, number, number]

export interface CameraView {
  position: Vec3
  target: Vec3
  /** Width (m) of the focused object; the camera backs off on narrow screens so it fits. */
  fitWidth?: number
}

/** Default "explore" view and orbit limits. */
export const DEFAULT_VIEW: CameraView = { position: [0.6, 2.0, 3.4], target: [-0.2, 1.1, -1.2] }

/** Establishing shot used behind the intro / hero overlay. */
export const INTRO_VIEW: CameraView = { position: [2.3, 2.35, 3.5], target: [-0.7, 1.15, -1.8] }

export const ORBIT_LIMITS = {
  minDistance: 1.4,
  maxDistance: 5.2,
  minPolarAngle: 0.65,
  maxPolarAngle: 1.62,
  minAzimuthAngle: -0.85,
  maxAzimuthAngle: 0.85,
} as const

/** Camera stays inside this box (slightly inset from the walls) so it can never clip outside. */
export const CAMERA_BOUNDS = { min: [-3.6, 0.45, -3.55] as Vec3, max: [3.6, 2.95, 3.7] as Vec3 }

/** Focus views for every interactive object. */
export const SECTION_VIEWS: Record<SectionId, CameraView> = {
  about: { position: [-0.38, 1.58, -2.1], target: [-0.8, 1.13, -3.65], fitWidth: 2.0 },
  projects: { position: [-1.5, 1.68, -0.8], target: [-4, 1.62, -0.8], fitWidth: 2.9 },
  skills: { position: [0.85, 1.5, -1.4], target: [4, 1.28, -1.4], fitWidth: 2.0 },
  experience: { position: [0.42, 1.42, -2.55], target: [0.3, 0.79, -3.3], fitWidth: 0.7 },
  funfacts: { position: [-2.15, 1.32, -2.55], target: [-1.85, 0.86, -3.22], fitWidth: 0.6 },
  social: { position: [-0.8, 1.72, -1.15], target: [-0.8, 1.88, -4.5], fitWidth: 4.6 },
  contact: { position: [2.25, 1.5, -1.55], target: [2.85, 1.3, -4], fitWidth: 1.6 },
}

/** Floating hotspot markers that hint at interactivity. */
export const HOTSPOTS: Record<SectionId, Vec3> = {
  about: [-0.8, 1.62, -3.5],
  projects: [-3.82, 2.58, -0.8],
  skills: [3.55, 2.48, -1.4],
  experience: [0.3, 0.98, -3.3],
  funfacts: [-1.85, 1.06, -3.22],
  social: [-2.55, 2.55, -3.9],
  contact: [2.85, 2.68, -3.82],
}

/** Positions used by the 2D room map (top-down, x/z). */
export const MAP_POINTS: Record<SectionId, [number, number]> = {
  about: [-0.8, -3.45],
  projects: [-3.8, -0.8],
  skills: [3.75, -1.4],
  experience: [0.3, -3.1],
  funfacts: [-1.85, -3.1],
  social: [-0.8, -3.95],
  contact: [2.85, -3.95],
}
