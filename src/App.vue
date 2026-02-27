<script setup lang="ts">
import { useHead } from '@unhead/vue'
import type { RouteLocationNormalizedLoaded } from 'vue-router'
import { siteConfig } from '~/config'
import AppHeader from '~/components/layout/AppHeader.vue'
import AppFooter from '~/components/layout/AppFooter.vue'
import AppDivider from '~/components/common/AppDivider.vue'

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

function getRouteTransitionKey(route: RouteLocationNormalizedLoaded): string {
  const seriesParam = route.params.series
  const series = Array.isArray(seriesParam)
    ? String(seriesParam[0] ?? '')
    : String(seriesParam ?? '')
  const hasArticleSlug = route.params.slug !== undefined

  // Keep article page mounted when only article slug changes in the same series.
  if (hasArticleSlug && series) return `article:${series}`
  return route.path
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-background text-primary">
    <AppHeader />
    <AppDivider />
    <div class="grow flex">
      <main class="relative border-x border-border/50 global-layout-width mx-auto grow min-w-0">
        <router-view v-slot="{ Component, route }">
          <transition name="fade" mode="out-in">
            <component :is="Component" :key="getRouteTransitionKey(route)" />
          </transition>
        </router-view>
      </main>
    </div>
    <AppDivider />
    <AppFooter />
  </div>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
