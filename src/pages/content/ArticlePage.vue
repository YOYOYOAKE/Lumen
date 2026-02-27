<script setup lang="ts">
import { computed, onServerPrefetch, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useHead } from '@unhead/vue'
import {
  getAdjacentArticles,
  getArticleMeta,
  getArticlesBySeries,
  getSeriesConfig,
  loadArticle,
} from '~/lib/content'
import type { ResolvedArticle } from '~/types'
import ArticleMeta from '~/components/article/ArticleMeta.vue'
import ArticleContent from '~/components/article/ArticleContent.vue'
import ArticleNav from '~/components/article/ArticleNav.vue'
import TableOfContents from '~/components/article/TableOfContents.vue'
import SiblingMenu from '~/components/article/SiblingMenu.vue'
import BackToTop from '~/components/common/BackToTop.vue'

const route = useRoute()

const series = computed(() => {
  return String(route.params.series ?? '')
})

const articleSlug = computed(() => {
  return String(route.params.slug ?? '')
})

const seriesArticles = computed(() => getArticlesBySeries(series.value))
const metaDoc = computed(() => getArticleMeta(series.value, articleSlug.value))
const doc = ref<ResolvedArticle | null>(null)
const isLoading = ref(false)
let requestId = 0

async function fetchDoc() {
  const currentRequestId = ++requestId
  isLoading.value = true

  const loaded = await loadArticle(series.value, articleSlug.value)
  if (currentRequestId !== requestId) return

  doc.value = loaded
  isLoading.value = false
}

watch(
  [series, articleSlug],
  () => {
    void fetchDoc()
  },
  { immediate: true },
)

onServerPrefetch(async () => {
  await fetchDoc()
})

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
  seriesArticles.value.map((d) => ({
    slug: d.slug,
    title: d.frontmatter.title,
    subSeries: d.subSeries,
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

const fallbackTitle = computed(() => getSeriesConfig(series.value)?.title ?? 'Article')
const articleTransitionKey = computed(() => `${series.value}:${articleSlug.value}`)

useHead(() => ({
  title: doc.value?.frontmatter.title ?? fallbackTitle.value,
  meta: [{ name: 'description', content: doc.value?.frontmatter.description ?? '' }],
}))
</script>

<template>
  <div v-if="doc" class="relative flex flex-col justify-between h-fit z-[1]">
    <SiblingMenu
      :current-slug="doc.slug"
      :entries="entries"
      :base-url="baseUrl"
      :sub-series="subSeries"
    />

    <transition name="fade" mode="out-in">
      <div :key="articleTransitionKey">
        <article class="relative fade-up">
          <div class="px-6 sm:px-8 py-4 sm:py-6 lg:py-8">
            <div class="global-layout-width mx-auto">
              <ArticleMeta :frontmatter="doc.frontmatter" />
              <ArticleContent :html="doc.html" />
            </div>
          </div>
        </article>

        <TableOfContents :headings="doc.headings" />
      </div>
    </transition>
    <ArticleNav :prev="prevNav" :next="nextNav" :base-url="baseUrl" />

    <BackToTop class="xl:hidden fixed bottom-14 sm:right-8 right-6 z-50" />
    <div
      class="hidden xl:flex fixed bottom-24 right-[calc(50%-var(--layout-half-width))] translate-x-full p-4"
    >
      <div class="flex items-center gap-2">
        <router-link
          :to="backHref"
          class="group flex items-center gap-2 px-3 py-2 bg-primary/4 hover:bg-primary/10 text-primary/70 hover:text-primary transition-colors duration-200 dark:bg-primary/10 dark:hover:bg-primary/15"
        >
          <span
            class="icon-[ph--arrow-left] size-4 transition-transform duration-200 group-hover:-translate-x-0.5"
          />
          <span class="text-sm font-medium">{{ backLabel }}</span>
        </router-link>
        <BackToTop />
      </div>
    </div>
  </div>
  <div v-else-if="isLoading" class="relative z-[1] py-16 px-6 sm:px-8 text-muted-foreground">
    Loading article...
  </div>
</template>
