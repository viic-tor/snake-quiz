import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Configuración de Vite para Snake Quiz
 *
 * ─── PLATAFORMA ────────────────────────────────────────────────────
 *
 * Para VERCEL:
 *   base: '/'
 *
 * Para GITHUB PAGES:
 *   base: '/nombre-exacto-de-tu-repo/'
 *   Ejemplo: base: '/snake-quiz/'
 *
 * ──────────────────────────────────────────────────────────────────
 */
export default defineConfig({
  plugins: [react()],

  // ↓ Cambia según tu plataforma:
  base: '/',   // ← Vercel
  // base: '/snake-quiz/',  // ← GitHub Pages (descomenta esta línea)

  build: {
    // Separar xlsx y supabase en chunks lazy para reducir bundle inicial
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-xlsx':    ['xlsx'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-react':   ['react', 'react-dom'],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
})

