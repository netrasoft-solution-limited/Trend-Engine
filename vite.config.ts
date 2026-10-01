import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  /**
   * The portal is served from a sub-path, so its asset URLs must carry it.
   * Left at the default '/', index.html asks for `/assets/index-….js`, which
   * matches no portal route at the edge and falls through to the apex
   * redirect — the browser is handed HTML where it expected JavaScript and the
   * page never boots. Caddy strips this prefix again with `handle_path`, so
   * the files still live at the volume root.
   */
  base: '/portal/',
  plugins: [react()],
  server: {
    proxy: {
      '/portal/api': {
        target: 'https://trend-engine-backend-f55e.onrender.com',
        changeOrigin: true,
        secure: true
      }
    }
  }
})
