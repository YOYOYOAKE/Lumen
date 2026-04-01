import type { RouteLocationNormalized, RouteRecordRaw } from 'vue-router'

import NotFoundPage from '~/pages/functional/NotFoundPage.vue'
import HomeHeaderView from '~/pages/standard/HomeHeaderView.vue'
import HomeBodyView from '~/pages/standard/HomeBodyView.vue'
import StaticListHeaderView from '~/pages/standard/StaticListHeaderView.vue'
import SeriesListBodyView from '~/pages/standard/SeriesListBodyView.vue'
import FriendsBodyView from '~/pages/standard/FriendsBodyView.vue'
import TagsBodyView from '~/pages/standard/TagsBodyView.vue'
import SeriesPageHeaderView from '~/pages/standard/SeriesPageHeaderView.vue'
import SeriesPageBodyView from '~/pages/standard/SeriesPageBodyView.vue'
import { getTagNameBySlug } from '~/lib/content'
import { pagesConfig } from '~/config'
import { articles, seriesMetadata } from 'virtual:content'

const ArticleLeftView = () => import('~/pages/content/article/ArticleLeftView.vue')
const ArticleMainView = () => import('~/pages/content/article/ArticleMainView.vue')
const ArticleRightView = () => import('~/pages/content/article/ArticleRightView.vue')

const docSeriesPattern = (() => {
  const directories = seriesMetadata.map((item) => item.directory)
  if (directories.length === 0) return '__no_series__'
  return directories.map((series) => series.replace(/[\\^$.*+?()[\]{}|]/g, '\\$&')).join('|')
})()

const articleLookup = new Set(articles.map((article) => `${article.series}:${article.slug}`))
const seriesIndexRoutes: RouteRecordRaw[] = seriesMetadata.map((item) => ({
  path: `/${item.directory}`,
  components: {
    header: SeriesPageHeaderView,
    body: SeriesPageBodyView,
  },
  meta: { scene: 'standard' },
  props: {
    header: { kind: 'series', series: item.directory },
    body: { kind: 'series', series: item.directory },
  },
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
  {
    path: '/',
    components: {
      header: HomeHeaderView,
      body: HomeBodyView,
    },
    meta: { scene: 'standard' },
  },

  {
    path: '/series',
    components: {
      header: StaticListHeaderView,
      body: SeriesListBodyView,
    },
    meta: { scene: 'standard' },
    props: {
      header: {
        title: 'Series',
        description: '知识就是培根。',
      },
    },
  },
  {
    path: '/friends',
    components: {
      header: StaticListHeaderView,
      body: FriendsBodyView,
    },
    meta: { scene: 'standard' },
    props: {
      header: {
        title: pagesConfig.friends.title,
        description: pagesConfig.friends.description,
      },
    },
  },
  { path: '/404', component: NotFoundPage, meta: { scene: 'plain' } },

  {
    path: '/tags',
    components: {
      header: StaticListHeaderView,
      body: TagsBodyView,
    },
    meta: { scene: 'standard' },
    props: {
      header: {
        title: pagesConfig.tags.title,
        description: pagesConfig.tags.description,
      },
    },
  },
  {
    path: '/tags/:tagSlug([a-z0-9-]+)',
    components: {
      header: SeriesPageHeaderView,
      body: SeriesPageBodyView,
    },
    meta: { scene: 'standard' },
    beforeEnter: ensureTagExists,
    props: {
      header: (route) => ({ kind: 'tag', tagSlug: toParamString(route.params.tagSlug) }),
      body: (route) => ({ kind: 'tag', tagSlug: toParamString(route.params.tagSlug) }),
    },
  },

  ...seriesIndexRoutes,

  {
    path: `/:series(${docSeriesPattern})/:slug`,
    components: {
      left: ArticleLeftView,
      default: ArticleMainView,
      right: ArticleRightView,
    },
    meta: { scene: 'article' },
    beforeEnter: ensureDocExists,
  },

  { path: '/:pathMatch(.*)*', redirect: '/404' },
]
