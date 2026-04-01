<script setup lang="ts">
import SiblingMenu from '~/components/article/SiblingMenu.vue'
import { useArticleRouteState } from '~/composables/useArticleRouteState'

const { articleSlug, entries, baseUrl, navigationTagSlug, subSeries } = useArticleRouteState()
</script>

<template>
  <SiblingMenu
    :current-slug="articleSlug"
    :entries="entries"
    :base-url="baseUrl"
    :tag-slug="navigationTagSlug"
    :sub-series="subSeries"
  />
</template>
