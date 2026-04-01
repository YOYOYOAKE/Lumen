import { computed, onServerPrefetch, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import {
  getAdjacentArticles,
  getArticleMeta,
  getSeriesConfig,
  loadArticle,
  resolveArticleSidebarContextList,
} from '~/lib/content'
import type { ResolvedArticle } from '~/types'

interface UseArticleRouteStateOptions {
  includeDocument?: boolean
}

interface ArticleDocStore {
  doc: ReturnType<typeof ref<ResolvedArticle | null>>
  isLoading: ReturnType<typeof ref<boolean>>
  inflight: Promise<ResolvedArticle | null> | null
  requestId: number
}

const articleDocStores = new Map<string, ArticleDocStore>()

function toLookupKey(series: string, slug: string): string {
  return `${series}:${slug}`
}

function getArticleDocStore(series: string, slug: string): ArticleDocStore {
  const key = toLookupKey(series, slug)
  const existing = articleDocStores.get(key)
  if (existing) return existing

  const store: ArticleDocStore = {
    doc: ref<ResolvedArticle | null>(null),
    isLoading: ref(true),
    inflight: null,
    requestId: 0,
  }
  articleDocStores.set(key, store)
  return store
}

async function ensureArticleDoc(
  store: ArticleDocStore,
  series: string,
  slug: string,
): Promise<ResolvedArticle | null> {
  if (store.doc.value) {
    store.isLoading.value = false
    return store.doc.value
  }

  if (store.inflight) {
    return store.inflight
  }

  const currentRequestId = ++store.requestId
  store.isLoading.value = true

  store.inflight = loadArticle(series, slug)
    .then((loaded) => {
      if (currentRequestId !== store.requestId) {
        return store.doc.value ?? null
      }

      store.doc.value = loaded
      return loaded
    })
    .finally(() => {
      if (currentRequestId === store.requestId) {
        store.isLoading.value = false
        store.inflight = null
      }
    })

  return store.inflight
}

export function useArticleRouteState(options: UseArticleRouteStateOptions = {}) {
  const includeDocument = options.includeDocument ?? false
  const route = useRoute()

  const series = computed(() => String(route.params.series ?? ''))
  const articleSlug = computed(() => String(route.params.slug ?? ''))
  const articleTransitionKey = computed(() => `${series.value}:${articleSlug.value}`)

  const metaDoc = computed(() => getArticleMeta(series.value, articleSlug.value))
  const requestedTagSlug = computed(() => {
    const value = route.query.tag
    if (Array.isArray(value)) return String(value[0] ?? '').trim() || null
    return typeof value === 'string' ? value.trim() || null : null
  })
  const articleContext = computed(() =>
    resolveArticleSidebarContextList(series.value, metaDoc.value, requestedTagSlug.value),
  )
  const seriesArticles = computed(() => articleContext.value.articles)
  const navigationTagSlug = computed(() => articleContext.value.tagSlug)
  const docStore = computed(() => getArticleDocStore(series.value, articleSlug.value))
  const doc = computed(() => docStore.value.doc.value)
  const isLoading = computed(() => (includeDocument ? docStore.value.isLoading.value : false))

  const adjacent = computed(() => {
    if (!metaDoc.value) return { prev: null, next: null, index: -1 }
    return getAdjacentArticles(seriesArticles.value, metaDoc.value.slug)
  })

  const prevNav = computed(() =>
    adjacent.value.prev
      ? { slug: adjacent.value.prev.slug, title: adjacent.value.prev.frontmatter.title }
      : null,
  )
  const nextNav = computed(() =>
    adjacent.value.next
      ? { slug: adjacent.value.next.slug, title: adjacent.value.next.frontmatter.title }
      : null,
  )

  const entries = computed(() =>
    seriesArticles.value.map((article) => ({
      slug: article.slug,
      title: article.frontmatter.title,
      subSeries: article.subSeries,
    })),
  )

  const subSeries = computed(() => getSeriesConfig(series.value)?.subSeries ?? [])
  const baseUrl = computed(() => `/${series.value}`)
  const backHref = computed(() => {
    if (series.value !== 'posts' && series.value !== 'jottings') return '/series'
    return baseUrl.value
  })
  const backLabel = computed(() => {
    if (series.value === 'posts') return 'Back to Posts'
    if (series.value === 'jottings') return 'Back to Jottings'
    return 'Back to Series'
  })
  const fallbackTitle = computed(
    () =>
      metaDoc.value?.frontmatter.title ?? getSeriesConfig(series.value)?.title ?? 'Article',
  )

  async function ensureCurrentDoc() {
    if (!includeDocument) return null
    return ensureArticleDoc(docStore.value, series.value, articleSlug.value)
  }

  if (includeDocument) {
    watch(
      articleTransitionKey,
      () => {
        void ensureCurrentDoc()
      },
      { immediate: true, flush: 'sync' },
    )

    onServerPrefetch(async () => {
      await ensureCurrentDoc()
    })
  }

  return {
    series,
    articleSlug,
    articleTransitionKey,
    seriesArticles,
    navigationTagSlug,
    metaDoc,
    doc,
    isLoading,
    prevNav,
    nextNav,
    entries,
    subSeries,
    baseUrl,
    backHref,
    backLabel,
    fallbackTitle,
    ensureCurrentDoc,
  }
}
