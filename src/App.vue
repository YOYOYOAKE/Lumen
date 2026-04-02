<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useHead } from '@unhead/vue'
import { useRoute } from 'vue-router'
import { siteConfig } from '~/config'
import ArticleSceneShell from '~/components/article/ArticleSceneShell.vue'
import StandardSceneShell from '~/components/standard/StandardSceneShell.vue'
import AppHeader from '~/components/layout/AppHeader.vue'
import AppFooter from '~/components/layout/AppFooter.vue'
import AppDivider from '~/components/common/AppDivider.vue'
import { resolveAppSceneTransitionProps, type SceneKind } from '~/lib/transitions'

useHead({
  titleTemplate: (title) => (title ? `${title} | ${siteConfig.title}` : siteConfig.title),
  htmlAttrs: { lang: siteConfig.lang },
  meta: [
    { name: 'author', content: siteConfig.author },
    { name: 'generator', content: 'vite-ssg' },
  ],
  link: [
    {
      rel: 'icon',
      type: 'image/webp',
      href: siteConfig.avatar,
    },
    {
      rel: 'shortcut icon',
      href: siteConfig.avatar,
    },
    {
      rel: 'apple-touch-icon',
      href: siteConfig.avatar,
    },
    {
      rel: 'stylesheet',
      href: 'https://cdn.jsdelivr.net/npm/lxgw-wenkai-webfont@1.7.0/style.css',
    },
    {
      rel: 'stylesheet',
      href: 'https://cdn.jsdelivr.net/npm/lxgw-wenkai-mono-webfont@1.7.0/style.css',
    },
  ],
})

const route = useRoute()

const currentScene = computed<SceneKind>(() => {
  if (route.meta.scene === 'article') return 'article'
  if (route.meta.scene === 'standard') return 'standard'
  return 'plain'
})

const sceneSeries = computed(() => {
  const seriesParam = route.params.series
  return Array.isArray(seriesParam) ? String(seriesParam[0] ?? '') : String(seriesParam ?? '')
})

const previousScene = ref<SceneKind>(currentScene.value)
const lastScene = ref<SceneKind>(currentScene.value)

watch(
  () => route.path,
  () => {
    previousScene.value = lastScene.value
    lastScene.value = currentScene.value
  },
  { flush: 'sync' },
)

const sceneTransitionKey = computed(() => {
  if (currentScene.value === 'article' && sceneSeries.value) {
    return `article:${sceneSeries.value}`
  }

  if (currentScene.value === 'standard') {
    return 'standard'
  }

  return route.path
})

const appSceneTransitionProps = computed(() =>
  resolveAppSceneTransitionProps(currentScene.value, previousScene.value),
)
</script>

<template>
  <div class="min-h-screen flex flex-col bg-background text-primary">
    <AppHeader />
    <AppDivider />
    <div class="grow flex">
      <main class="relative border-x border-border/50 global-layout-width mx-auto grow min-w-0">
        <transition v-bind="appSceneTransitionProps">
          <ArticleSceneShell
            v-if="currentScene === 'article'"
            :key="sceneTransitionKey"
            :route="route"
          />
          <StandardSceneShell
            v-else-if="currentScene === 'standard'"
            :key="sceneTransitionKey"
            :route="route"
          />
          <div v-else :key="sceneTransitionKey">
            <router-view :route="route" />
          </div>
        </transition>
      </main>
    </div>
    <AppDivider class="app-bottom-divider" />
    <AppFooter />
  </div>
</template>
