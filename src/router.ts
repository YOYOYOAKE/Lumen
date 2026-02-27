import type { RouteLocationNormalized, RouteRecordRaw } from 'vue-router'

import HomePage from '~/pages/functional/HomePage.vue'
import FriendsPage from '~/pages/functional/FriendsPage.vue'
import TagsPage from '~/pages/functional/TagsPage.vue'
import NotFoundPage from '~/pages/functional/NotFoundPage.vue'
import SeriesListPage from '~/pages/content/SeriesListPage.vue'
import SeriesPage from '~/pages/content/SeriesPage.vue'
import ArticlePage from '~/pages/content/ArticlePage.vue'
import { getTagNameBySlug } from '~/lib/content'
import { articles, seriesMetadata } from 'virtual:content'

const docSeriesPattern = (() => {
  const directories = seriesMetadata.map((item) => item.directory)
  if (directories.length === 0) return '__no_series__'
  return directories.map((series) => series.replace(/[\\^$.*+?()[\]{}|]/g, '\\$&')).join('|')
})()

const articleLookup = new Set(articles.map((article) => `${article.series}:${article.slug}`))
const seriesIndexRoutes: RouteRecordRaw[] = seriesMetadata.map((item) => ({
  path: `/${item.directory}`,
  component: SeriesPage,
  props: { kind: 'series', series: item.directory },
}))

function toParamString(value: unknown): string {
  if (Array.isArray(value)) return String(value[0] ?? '')
  return value == null ? '' : String(value)
}

function ensureDocExists(to: RouteLocationNormalized): true | string {
  const series = toParamString(to.params.series)
  const slug = toParamString(to.params.slug)
  return articleLookup.has(`${series}:${slug}`) ? true : '/404'
}

function ensureTagExists(to: RouteLocationNormalized): true | string {
  const tagSlug = toParamString(to.params.tagSlug)
  return getTagNameBySlug(tagSlug) ? true : '/404'
}

export const routes: RouteRecordRaw[] = [
  { path: '/', component: HomePage },

  { path: '/series', component: SeriesListPage },
  { path: '/friends', component: FriendsPage },
  { path: '/404', component: NotFoundPage },

  { path: '/tags', component: TagsPage },
  {
    path: '/tags/:tagSlug([a-z0-9-]+)',
    component: SeriesPage,
    beforeEnter: ensureTagExists,
    props: (route) => ({ kind: 'tag', tagSlug: toParamString(route.params.tagSlug) }),
  },

  ...seriesIndexRoutes,

  {
    path: `/:series(${docSeriesPattern})/:slug`,
    component: ArticlePage,
    beforeEnter: ensureDocExists,
  },

  { path: '/:pathMatch(.*)*', redirect: '/404' },
]
