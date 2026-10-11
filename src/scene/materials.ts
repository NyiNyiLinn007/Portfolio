import * as THREE from 'three'
import { radialTexture, wallTexture, woodFloorTexture } from './textures'

/**
 * Shared materials — created once and reused by every component so the scene
 * compiles a small number of shader programs and uploads each texture once.
 */
function create() {
  const std = (params: THREE.MeshStandardMaterialParameters) => new THREE.MeshStandardMaterial(params)

  return {
    floor: std({ map: woodFloorTexture(), roughness: 0.62, metalness: 0.05, envMapIntensity: 0.6 }),
    wall: std({ map: wallTexture(), color: '#c7cee6', roughness: 0.95, metalness: 0 }),
    ceiling: std({ color: '#0c1124', roughness: 1 }),
    trim: std({ color: '#0b1020', roughness: 0.6, metalness: 0.2 }),

    woodDark: std({ color: '#2a1d16', roughness: 0.55, metalness: 0.05 }),
    woodWalnut: std({ color: '#4a3326', roughness: 0.5, metalness: 0.05 }),
    woodLight: std({ color: '#8a6a4f', roughness: 0.6 }),

    metalDark: std({ color: '#1b1f2a', roughness: 0.35, metalness: 0.75 }),
    metalSatin: std({ color: '#8d96a8', roughness: 0.28, metalness: 0.9 }),
    plasticBlack: std({ color: '#121419', roughness: 0.45, metalness: 0.1 }),
    plasticGrey: std({ color: '#2b303c', roughness: 0.5, metalness: 0.1 }),
    plasticWhite: std({ color: '#d8dbe3', roughness: 0.4 }),
    rubber: std({ color: '#0b0c10', roughness: 0.9 }),

    fabricDark: std({ color: '#1b1e2b', roughness: 0.92 }),
    fabricAccent: std({ color: '#5b3fd9', roughness: 0.75 }),
    leather: std({ color: '#15161e', roughness: 0.55, metalness: 0.05 }),
    beanbag: std({ color: '#2a3460', roughness: 0.95 }),

    ceramic: std({ color: '#e7e2da', roughness: 0.35 }),
    ceramicDark: std({ color: '#2c3346', roughness: 0.4 }),
    terracotta: std({ color: '#8a4e3a', roughness: 0.8 }),
    soil: std({ color: '#1e140e', roughness: 1 }),
    leaf: std({ color: '#2f7a52', roughness: 0.7, side: THREE.DoubleSide }),
    leafDark: std({ color: '#1f5a3d', roughness: 0.75, side: THREE.DoubleSide }),
    leafYellow: std({ color: '#7aa64a', roughness: 0.7, side: THREE.DoubleSide }),
    coffee: std({ color: '#2a160c', roughness: 0.2 }),
    paper: std({ color: '#ece6d6', roughness: 0.9 }),
    notebookCover: std({ color: '#3b2f8f', roughness: 0.6 }),
    glassFrame: std({ color: '#0f1424', roughness: 0.3, metalness: 0.6 }),

    windowGlass: new THREE.MeshPhysicalMaterial({
      color: '#9ec5ff',
      roughness: 0.05,
      metalness: 0,
      transparent: true,
      opacity: 0.07,
      depthWrite: false,
      envMapIntensity: 1.2,
    }),
    screenOff: std({ color: '#05070c', roughness: 0.2, metalness: 0.4 }),

    ledCyan: new THREE.MeshBasicMaterial({ color: new THREE.Color('#22d3ee').multiplyScalar(1.6), toneMapped: false }),
    ledViolet: new THREE.MeshBasicMaterial({ color: new THREE.Color('#8b5cf6').multiplyScalar(1.6), toneMapped: false }),
    ledBlue: new THREE.MeshBasicMaterial({ color: new THREE.Color('#3b82f6').multiplyScalar(1.6), toneMapped: false }),
    ledWarm: new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffc48a').multiplyScalar(1.4), toneMapped: false }),
    ledRed: new THREE.MeshBasicMaterial({ color: '#ff4d6d', toneMapped: false }),

    /** Additive radial glow (fake bloom). Tint via per-mesh color by cloning or use helper below. */
    contactShadow: new THREE.MeshBasicMaterial({
      map: radialTexture(),
      color: '#000000',
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    }),
  }
}

export type SharedMaterials = ReturnType<typeof create>
let materials: SharedMaterials | null = null

export function getMaterials(): SharedMaterials {
  if (!materials) materials = create()
  return materials
}

const glowCache = new Map<string, THREE.MeshBasicMaterial>()

/** Additive glow sprite material for a given colour/opacity (cached). */
export function glowMaterial(color: string, opacity = 0.6): THREE.MeshBasicMaterial {
  const key = `${color}-${opacity}`
  let m = glowCache.get(key)
  if (!m) {
    m = new THREE.MeshBasicMaterial({
      map: radialTexture(),
      color,
      transparent: true,
      opacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
    })
    glowCache.set(key, m)
  }
  return m
}

export function disposeMaterials() {
  if (materials) Object.values(materials).forEach((m) => m.dispose())
  materials = null
  glowCache.forEach((m) => m.dispose())
  glowCache.clear()
}
