<script setup lang="ts">
import { computed } from 'vue'
import { useHead } from '@unhead/vue'
import { getAllPosts, getAllTagItems } from '~/lib/content'
import { pagesConfig } from '~/config'
import ListPageLayout from '~/components/list/ListPageLayout.vue'
import TagCloud from '~/components/list/TagCloud.vue'

const config = pagesConfig.tags
const tags = computed(() =>
  [...getAllTagItems()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'zh-CN')),
)
const totalPosts = computed(() => getAllPosts().length)

useHead({
  title: config.title,
  meta: [{ name: 'description', content: config.description }],
})
</script>

<template>
  <ListPageLayout :title="config.title" :description="config.description">
    <div class="px-6 sm:px-8">
      <TagCloud :tags="tags" :total-posts="totalPosts" class="mt-8 fade-up" />
    </div>
  </ListPageLayout>
</template>
