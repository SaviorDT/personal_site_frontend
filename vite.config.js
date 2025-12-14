import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 9000,
    host: true,
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      'xn--kss.xn--kpry57d',
      'frontend'
    ],
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 9000
    },
    proxy: {
      '/api': {
        // 將 /api 開頭的請求代理到後端
        target: 'http://backend:80',  // Docker 內部後端服務
        changeOrigin: true,
        secure: false,
        ws: false,
        pathRewrite: {
          '^/api': '/api'  // 保留 /api 在轉發的路徑中
        },
        // 重寫請求頭，確保正確的 Origin
        onProxyReq: (proxyReq, req, res) => {
          console.log('[Vite Proxy] Forward request:', {
            method: req.method,
            url: req.url,
            target: 'http://localhost:9000',
            headers: {
              'origin': proxyReq.getHeader('origin'),
              'referer': proxyReq.getHeader('referer'),
            }
          });
        },
        // 日誌記錄回應
        onProxyRes: (proxyRes, req, res) => {
          console.log('[Vite Proxy] Response:', {
            method: req.method,
            url: req.url,
            statusCode: proxyRes.statusCode,
            corsHeaders: {
              'access-control-allow-origin': proxyRes.getHeader('access-control-allow-origin'),
            }
          });
        }
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
