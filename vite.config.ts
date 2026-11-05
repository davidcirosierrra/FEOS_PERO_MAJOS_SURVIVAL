import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

/**
 * @dimforge/rapier3d-compat 0.19.x (pinned by @react-three/rapier) initialises its inlined WASM with
 * wasm-bindgen's legacy positional argument, which logs "using deprecated parameters for the
 * initialization function". Wrap that single call in the `{ module_or_path }` object form.
 * (0.21 fixes it upstream but doubles the WASM size.)
 */
function rapierInitFix(): Plugin {
  const call = /yield (\w+)\((\w+)\.toByteArray\(("[A-Za-z0-9+/=]+")\)\.buffer\)/
  return {
    name: 'rapier-init-fix',
    enforce: 'pre',
    transform(code, id) {
      if (!id.includes('rapier3d-compat') || !call.test(code)) return null
      return { code: code.replace(call, 'yield $1({module_or_path:$2.toByteArray($3).buffer})'), map: null }
    },
  }
}

export default defineConfig({
  // Excluded from pre-bundling so the fix above also runs in dev.
  optimizeDeps: { exclude: ['@dimforge/rapier3d-compat'] },
  plugins: [
    rapierInitFix(),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png', 'icons/apple-touch-icon.png'],
      manifest: {
        name: 'Paranoid',
        short_name: 'Paranoid',
        description: '8-bit alien shooter. Tilt to move, tap to fire.',
        lang: 'en',
        start_url: '/',
        scope: '/',
        display: 'fullscreen',
        orientation: 'portrait',
        background_color: '#05010f',
        theme_color: '#05010f',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,woff,woff2,wasm}'],
        // Rapier ships its WASM inlined in the JS bundle.
        maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
      },
    }),
  ],
  build: {
    chunkSizeWarningLimit: 3000,
  },
})
