<script setup lang="ts">
import ArticleTocSkeleton from '~/components/article/ArticleTocSkeleton.vue'
import TableOfContents from '~/components/article/TableOfContents.vue'
import { useArticleRouteState } from '~/composables/useArticleRouteState'

const { articleTransitionKey, doc, isLoading } = useArticleRouteState({ includeDocument: true })
</script>

<template>
  <transition name="fade" mode="out-in">
    <div :key="articleTransitionKey">
      <TableOfContents v-if="doc" :headings="doc.headings" />
      <ArticleTocSkeleton v-else-if="isLoading" />
    </div>
  </transition>
</template>
