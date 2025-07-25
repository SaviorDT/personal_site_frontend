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
      'localhost',
      'xn--kss.xn--kpry57d'
    ],
  },
  resolve: {
    alias: {
      // 設定 src 為基礎路徑，這樣可以直接從 src 開始 import
      '@': path.resolve(__dirname, './src'),
      // 或者更簡潔的方式，直接設定 src 為根目錄
      'src': path.resolve(__dirname, './src'),
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
    'process.env.REACT_APP_API_URL': JSON.stringify(process.env.REACT_APP_API_URL),
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
  }
})
