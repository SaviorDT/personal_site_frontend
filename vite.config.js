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
      '127.0.0.1'
    ],
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      clientPort: 9000
    },
    // 添加代理解決 CORS 問題
    proxy: {
      '/api': {
        target: 'http://backend:80',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path
      }
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
