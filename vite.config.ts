import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'fix-mime-type',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url && /\.(tsx?|jsx?|mjs)$/.test(req.url.split('?')[0])) {
            res.setHeader('Content-Type', 'text/javascript');
          }
          next();
        });
      },
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://base.migjs.uz:40320',
        changeOrigin: true,
        secure: false,
        rewrite: (reqPath) => reqPath.replace(/^\/api/, ''),
      },
    },
  },
})
