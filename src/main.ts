import { ViteSSG } from 'vite-ssg'
import { routes } from './router'
import App from './App.vue'
import { getAllArticles, getAllTagItems } from './lib/content'
import {
  getInitialArticleState,
  hydrateInitialArticleState,
  type InitialArticleState,
} from './composables/useArticleRouteState'
import './styles/global.css'

interface AppInitialState {
  article?: InitialArticleState
}

function toParamString(value: unknown): string {
  if (Array.isArray(value)) return String(value[0] ?? '')
  return value == null ? '' : String(value)
}

export const createApp = ViteSSG(
  App,
  { routes },
  ({ app: _app, router, isClient, initialState, onSSRAppRendered }) => {
    const appInitialState = initialState as AppInitialState

    if (isClient) {
      hydrateInitialArticleState(appInitialState.article)

      // Scroll to top on navigation
      router.afterEach((to, from) => {
        // Keep in-page hash navigation smooth (e.g. TOC anchors)
        if (to.path === from.path && to.hash !== from.hash) return
        window.scrollTo({ top: 0 })
      })
      return
    }

    onSSRAppRendered?.(() => {
      const currentRoute = router.currentRoute.value
      const series = toParamString(currentRoute.params.series)
      const slug = toParamString(currentRoute.params.slug)
      const articleState = getInitialArticleState(series, slug)

      if (articleState) {
        appInitialState.article = articleState
      }
    })
  },
)

export async function includedRoutes(paths: string[]): Promise<string[]> {
  const staticPaths = paths.filter((path) => !path.includes(':'))
  const articlePaths = getAllArticles().map((article) => `/${article.series}/${article.slug}`)
  const tagPaths = getAllTagItems().map((tag) => `/tags/${tag.slug}`)

  return Array.from(new Set([...staticPaths, ...articlePaths, ...tagPaths]))
}
