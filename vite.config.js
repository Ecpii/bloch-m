import { fileURLToPath, URL } from 'node:url'
import { templateCompilerOptions } from '@tresjs/core'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import VueDevTools from 'vite-plugin-vue-devtools'
import svgLoader from 'vite-svg-loader'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({
      // Other config
      ...templateCompilerOptions
    }),
    VueDevTools(),
    svgLoader()
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  base: '/'
})
