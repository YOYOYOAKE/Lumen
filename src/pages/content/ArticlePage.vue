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

const seriesSkeletonWidths = ['72%', '58%', '64%', '52%', '68%']
const tocSkeletonWidths = ['66%', '74%', '54%', '70%', '48%', '62%']
const articleSkeletonWidths = ['100%', '94%', '97%', '83%']
const secondaryArticleSkeletonWidths = ['98%', '92%', '95%', '79%']
const codeSkeletonWidths = ['82%', '88%', '65%', '91%', '72%']

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
  <div v-if="isLoading" class="relative flex flex-col justify-between h-fit z-[1]" aria-busy="true">
    <span class="sr-only" role="status" aria-live="polite">Loading article</span>

    <div
      class="hidden xl:block fixed top-30 left-[calc(50%-var(--layout-half-width))] -translate-x-full w-[clamp(12rem,18vw,18rem)] fade-up"
    >
      <nav class="p-4">
        <div class="flex items-center gap-2 mb-4 pl-2">
          <div class="w-4 h-4 rounded-sm skeleton-shimmer" />
          <div class="h-4 rounded-full skeleton-shimmer" style="width: 4.5rem" />
        </div>
        <div class="relative h-[calc(100vh-24rem)] overflow-hidden">
          <ul class="space-y-4 absolute w-full">
            <li class="space-y-2">
              <div class="h-4 rounded-full skeleton-shimmer" :style="{ width: seriesSkeletonWidths[0] }" />
              <div class="ml-4 h-3.5 rounded-full skeleton-shimmer" :style="{ width: seriesSkeletonWidths[1] }" />
              <div class="ml-4 h-3.5 rounded-full skeleton-shimmer" :style="{ width: seriesSkeletonWidths[2] }" />
            </li>
            <li class="space-y-2">
              <div class="h-4 rounded-full skeleton-shimmer" :style="{ width: seriesSkeletonWidths[3] }" />
              <div class="ml-4 h-3.5 rounded-full skeleton-shimmer" :style="{ width: seriesSkeletonWidths[4] }" />
            </li>
          </ul>
        </div>
      </nav>
    </div>

    <article class="relative fade-up">
      <div class="px-6 sm:px-8 py-4 sm:py-6 lg:py-8">
        <div class="global-layout-width mx-auto">
          <header>
            <div class="space-y-4 md:space-y-5">
              <div class="space-y-2">
                <div class="h-3.5 rounded-full skeleton-shimmer" style="width: 62%" />
                <div class="h-3.5 rounded-full skeleton-shimmer" style="width: 38%" />
              </div>

              <div class="space-y-3">
                <div class="h-8 rounded-md skeleton-shimmer" style="width: 78%" />
                <div class="h-8 rounded-md skeleton-shimmer" style="width: 56%" />
              </div>

              <div class="flex flex-wrap items-center gap-3 sm:gap-4">
                <div class="h-4 rounded-full skeleton-shimmer" style="width: 7.25rem" />
                <div class="h-4 rounded-full skeleton-shimmer" style="width: 7.75rem" />
                <div class="h-4 rounded-full skeleton-shimmer" style="width: 5.25rem" />
              </div>

              <div class="flex flex-wrap gap-2 sm:gap-2.5 lg:gap-3">
                <div class="h-6 rounded-md skeleton-shimmer" style="width: 4rem" />
                <div class="h-6 rounded-md skeleton-shimmer" style="width: 5.5rem" />
                <div class="h-6 rounded-md skeleton-shimmer" style="width: 4.75rem" />
              </div>
            </div>
            <div class="border-b border-border/60 my-8 sm:my-10 lg:my-12" />
          </header>

          <div class="space-y-10">
            <section class="space-y-4">
              <div class="h-6 rounded-md skeleton-shimmer" style="width: 32%" />
              <div class="space-y-3">
                <div
                  v-for="(width, index) in articleSkeletonWidths"
                  :key="`article-skeleton-primary-${index}`"
                  class="h-4 rounded-full skeleton-shimmer"
                  :style="{ width }"
                />
              </div>
            </section>

            <section class="space-y-4">
              <div class="h-6 rounded-md skeleton-shimmer" style="width: 28%" />
              <div class="space-y-3">
                <div
                  v-for="(width, index) in secondaryArticleSkeletonWidths"
                  :key="`article-skeleton-secondary-${index}`"
                  class="h-4 rounded-full skeleton-shimmer"
                  :style="{ width }"
                />
              </div>
            </section>

            <section class="overflow-hidden rounded-xl border border-border/60">
              <div class="flex items-center justify-between border-b border-border/60 bg-muted/30 px-4 py-3">
                <div class="h-3.5 rounded-full skeleton-shimmer" style="width: 4.75rem" />
                <div class="w-4 h-4 rounded-sm skeleton-shimmer" />
              </div>
              <div class="space-y-3 px-4 py-4">
                <div
                  v-for="(width, index) in codeSkeletonWidths"
                  :key="`article-skeleton-code-${index}`"
                  class="h-4 rounded-full skeleton-shimmer"
                  :style="{ width }"
                />
              </div>
            </section>

            <section class="space-y-4">
              <div class="h-6 rounded-md skeleton-shimmer" style="width: 24%" />
              <div class="space-y-3">
                <div class="h-4 rounded-full skeleton-shimmer" style="width: 100%" />
                <div class="h-4 rounded-full skeleton-shimmer" style="width: 93%" />
                <div class="h-4 rounded-full skeleton-shimmer" style="width: 88%" />
              </div>
            </section>
          </div>
        </div>
      </div>
    </article>

    <div
      class="hidden xl:block fixed top-30 right-[calc(50%-var(--layout-half-width))] translate-x-full w-[clamp(12rem,18vw,18rem)] fade-up"
    >
      <nav class="p-4">
        <div class="flex items-center gap-2 mb-4 pl-2">
          <div class="w-4 h-4 rounded-sm skeleton-shimmer" />
          <div class="h-4 rounded-full skeleton-shimmer" style="width: 4rem" />
        </div>
        <div class="relative h-[calc(100vh-24rem)] overflow-hidden">
          <ul class="space-y-3 absolute w-full">
            <li
              v-for="(width, index) in tocSkeletonWidths"
              :key="`toc-skeleton-${index}`"
              class="h-3.5 rounded-full skeleton-shimmer"
              :class="{ 'ml-4': index % 3 === 1, 'ml-8': index % 3 === 2 }"
              :style="{ width }"
            />
          </ul>
        </div>
      </nav>
    </div>

    <div class="px-6 sm:px-8 pb-6 sm:pb-8 fade-up">
      <nav class="flex flex-col sm:flex-row justify-between gap-6 pt-2 border-t border-border/50">
        <div class="flex-1 space-y-2">
          <div class="h-2.5 rounded-full skeleton-shimmer" style="width: 4rem" />
          <div class="h-5 rounded-full skeleton-shimmer" style="width: 78%" />
        </div>
        <div class="flex-1 space-y-2 sm:items-end sm:text-right">
          <div class="h-2.5 rounded-full skeleton-shimmer sm:ml-auto" style="width: 3.5rem" />
          <div class="h-5 rounded-full skeleton-shimmer sm:ml-auto" style="width: 70%" />
        </div>
      </nav>
    </div>
  </div>
  <div v-else-if="doc" class="relative flex flex-col justify-between h-fit z-[1]">
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
</template>
