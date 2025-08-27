import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 80,
    host: true,
    allowedHosts: [
      'xn--kss.xn--kpry57d'
    ],
    hmr: {
      protocol: 'wss',
      host: 'xn--ldrz59fv7cs48a.xn--kss.xn--kpry57d',
      clientPort: 443
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  },
  build: {
    outDir: 'build',
    assetsDir: 'static',
  },
  esbuild: {
    loader: 'jsx',
    include: [
      // 讓 .js 檔案也支援 JSX
      'src/**/*.js',
      'src/**/*.jsx'
    ]
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
  define: {
    // 只定義需要的環境變數，避免安全風險
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
  }
})
