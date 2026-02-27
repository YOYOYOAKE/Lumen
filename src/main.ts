import { ViteSSG } from 'vite-ssg'
import { routes } from './router'
import App from './App.vue'
import './styles/global.css'
import './styles/markdown.css'

export const createApp = ViteSSG(App, { routes }, ({ app: _app, router, isClient }) => {
  // Scroll to top on navigation
  if (isClient) {
    router.afterEach((to, from) => {
      // Keep in-page hash navigation smooth (e.g. TOC anchors)
      if (to.path === from.path && to.hash !== from.hash) return
      window.scrollTo({ top: 0 })
    })
  }
})
