<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useHead } from '@unhead/vue'
import ArticleContent from '~/components/article/ArticleContent.vue'
import ArticleMainSkeleton from '~/components/article/ArticleMainSkeleton.vue'
import ArticleMeta from '~/components/article/ArticleMeta.vue'
import ArticleNav from '~/components/article/ArticleNav.vue'
import BackToTop from '~/components/common/BackToTop.vue'
import { useArticleRouteState } from '~/composables/useArticleRouteState'
import { articleContentTransitionProps } from '~/lib/transitions'

const {
  articleTransitionKey,
  backHref,
  backLabel,
  baseUrl,
  doc,
  fallbackTitle,
  isLoading,
  metaDoc,
  navigationTagSlug,
  nextNav,
  prevNav,
} = useArticleRouteState({ includeDocument: true })

const DEFAULT_DESKTOP_CONTROLS_BOTTOM = 96
const DIVIDER_CONTROLS_GAP = 16

const desktopControlsBottom = ref(DEFAULT_DESKTOP_CONTROLS_BOTTOM)

const desktopControlsStyle = computed(() => ({
  bottom: `${desktopControlsBottom.value}px`,
}))

let controlsAnimationFrame = 0

function updateDesktopControlsPosition() {
  const divider = document.querySelector<HTMLElement>('.app-bottom-divider')
  if (!divider) {
    desktopControlsBottom.value = DEFAULT_DESKTOP_CONTROLS_BOTTOM
    return
  }

  const dividerRect = divider.getBoundingClientRect()
  const viewportHeight = window.innerHeight
  const controlsBottomY = viewportHeight - DEFAULT_DESKTOP_CONTROLS_BOTTOM
  const maxControlsBottomY = dividerRect.top - DIVIDER_CONTROLS_GAP
  const lift = Math.max(0, controlsBottomY - maxControlsBottomY)

  desktopControlsBottom.value = DEFAULT_DESKTOP_CONTROLS_BOTTOM + lift
}

function scheduleDesktopControlsPositionUpdate() {
  cancelAnimationFrame(controlsAnimationFrame)
  controlsAnimationFrame = window.requestAnimationFrame(updateDesktopControlsPosition)
}

onMounted(() => {
  scheduleDesktopControlsPositionUpdate()
  window.addEventListener('scroll', scheduleDesktopControlsPositionUpdate, { passive: true })
  window.addEventListener('resize', scheduleDesktopControlsPositionUpdate)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(controlsAnimationFrame)
  window.removeEventListener('scroll', scheduleDesktopControlsPositionUpdate)
  window.removeEventListener('resize', scheduleDesktopControlsPositionUpdate)
})

useHead(() => ({
  title: doc.value?.frontmatter.title ?? metaDoc.value?.frontmatter.title ?? fallbackTitle.value,
  meta: [
    {
      name: 'description',
      content: doc.value?.frontmatter.description ?? metaDoc.value?.frontmatter.description ?? '',
    },
  ],
}))
</script>

<template>
  <div class="relative flex flex-col justify-between h-fit z-[1]">
    <transition v-bind="articleContentTransitionProps">
      <div :key="articleTransitionKey" class="article-content-pane">
        <template v-if="doc">
          <article class="relative">
            <div class="px-6 sm:px-8 py-4 sm:py-6 lg:py-8">
              <div class="global-layout-width mx-auto">
                <ArticleMeta :frontmatter="doc.frontmatter" />
                <ArticleContent :html="doc.html" />
              </div>
            </div>
          </article>

          <ArticleNav
            :prev="prevNav"
            :next="nextNav"
            :base-url="baseUrl"
            :tag-slug="navigationTagSlug"
          />
        </template>

        <ArticleMainSkeleton v-else-if="isLoading" />
      </div>
    </transition>

    <BackToTop class="xl:hidden fixed bottom-14 sm:right-8 right-6 z-50" />
    <div
      :style="desktopControlsStyle"
      class="hidden xl:flex fixed right-[calc(50%-var(--layout-half-width))] translate-x-full p-4 z-40"
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
