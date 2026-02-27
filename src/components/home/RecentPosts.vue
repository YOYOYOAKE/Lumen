<script setup lang="ts">
import PostListItem from '~/components/list/PostListItem.vue'
import type { ResolvedArticleMeta } from '~/types'

defineProps<{
  title: string
  subtitle: string
  posts: ResolvedArticleMeta[]
}>()
</script>

<template>
  <div class="py-8 pb-10 px-6 sm:px-8 fade-up">
    <h2 class="text-2xl sm:text-3xl tracking-tight">{{ title }}</h2>
    <p class="text-muted-foreground mb-6 mt-1">{{ subtitle }}</p>
    <div>
      <PostListItem
        v-for="(post, i) in posts"
        :key="post.slug"
        :post="post"
        :index="i"
        base-url="/posts"
      />
    </div>
  </div>
</template>
