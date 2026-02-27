import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'node:path'
import { contentPlugin } from './src/plugins/content'
import { siteConfig } from './src/config'

export default defineConfig({
  base: siteConfig.base,
  plugins: [vue(), tailwindcss(), contentPlugin()],
  resolve: {
    alias: {
      '~': resolve(__dirname, 'src'),
    },
  },

  ssgOptions: {
    script: 'async',
    formatting: 'minify',
  },
})
