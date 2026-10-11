/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    // Set VITE_BASE_PATH (e.g. "/my-repo/") when deploying to a sub-path such as GitHub Pages.
    base: env.VITE_BASE_PATH || '/',
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    build: {
      target: 'es2020',
      chunkSizeWarningLimit: 1400,
      rollupOptions: {
        output: {
          // Function form: only each library's own modules are assigned, so shared deps (e.g. zustand)
          // stay with the app shell and three / r3f are fetched only together with the lazy 3D chunk.
          manualChunks(id) {
            // Shared helpers must live in an eagerly loaded chunk, otherwise Rollup hoists them into
            // the r3f chunk and the whole 3D stack gets preloaded on first paint.
            if (id.includes('vite/preload-helper') || id.includes('vite/modulepreload-polyfill')) return 'vendor'
            if (!id.includes('node_modules')) return undefined
            if (/node_modules[\\/]three[\\/]/.test(id)) return 'three'
            if (/node_modules[\\/](@react-three|three-stdlib|troika-|maath|camera-controls|meshline|stats-gl|suspend-react|its-fine|react-reconciler|@monogrid|hls\.js|detect-gpu|three-mesh-bvh)/.test(id)) return 'r3f'
            if (/node_modules[\\/](framer-motion|motion-dom|motion-utils)[\\/]/.test(id)) return 'motion'
            if (/node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler|zustand|use-sync-external-store|cookie|set-cookie-parser)[\\/]/.test(id)) return 'vendor'
            return undefined
          },
        },
      },
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/test/setup.ts'],
      css: false,
    },
  }
})
