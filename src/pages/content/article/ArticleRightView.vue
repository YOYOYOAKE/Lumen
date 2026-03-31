<script setup lang="ts">
import ArticleTocSkeleton from '~/components/article/ArticleTocSkeleton.vue'
import TableOfContents from '~/components/article/TableOfContents.vue'
import { useArticleRouteState } from '~/composables/useArticleRouteState'
import { articleContentTransitionProps } from '~/lib/transitions'

const { articleTransitionKey, doc, isLoading } = useArticleRouteState({ includeDocument: true })
</script>

<template>
  <transition v-bind="articleContentTransitionProps">
    <div :key="articleTransitionKey" class="article-content-pane">
      <TableOfContents v-if="doc" :headings="doc.headings" />
      <ArticleTocSkeleton v-else-if="isLoading" />
    </div>
  </transition>
</template>
