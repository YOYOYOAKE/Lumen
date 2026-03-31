<script setup lang="ts">
import SiblingMenu from '~/components/article/SiblingMenu.vue'
import { useArticleRouteState } from '~/composables/useArticleRouteState'

const { articleSlug, entries, baseUrl, subSeries } = useArticleRouteState()
</script>

<template>
  <SiblingMenu
    :current-slug="articleSlug"
    :entries="entries"
    :base-url="baseUrl"
    :sub-series="subSeries"
  />
</template>
