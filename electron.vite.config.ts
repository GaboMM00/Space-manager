import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      minify: 'esbuild',
      rollupOptions: {
        output: {
          manualChunks: undefined
        }
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      minify: 'esbuild'
    }
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    plugins: [react()],
    build: {
      minify: 'esbuild',
      rollupOptions: {
        output: {
          manualChunks(id): string | undefined {
            // Separate vendor chunks for better caching
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom')) {
                return 'vendor-react'
              }
              if (id.includes('react-router')) {
                return 'vendor-router'
              }
              return 'vendor'
            }
            return undefined
          }
        }
      },
      chunkSizeWarningLimit: 600
    }
  }
})
