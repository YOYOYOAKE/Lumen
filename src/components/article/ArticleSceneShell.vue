<script setup lang="ts">
import type { RouteLocationNormalizedLoaded } from 'vue-router'

defineProps<{ route: RouteLocationNormalizedLoaded }>()
</script>

<template>
  <div class="relative">
    <div
      class="article-scene-pane article-scene-pane-left hidden xl:block fixed top-30 left-[calc(50%-var(--layout-half-width))] w-[clamp(12rem,18vw,18rem)]"
    >
      <router-view name="left" :route="route" />
    </div>

    <div class="article-scene-pane article-scene-pane-main">
      <router-view :route="route" />
    </div>

    <div
      class="article-scene-pane article-scene-pane-right hidden xl:block fixed top-30 right-[calc(50%-var(--layout-half-width))] w-[clamp(12rem,18vw,18rem)]"
    >
      <router-view name="right" :route="route" />
    </div>
  </div>
</template>
