<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { getAllPosts, resolveSortedTags } from '~/lib/content'
import { pagesConfig } from '~/config'
import ListPageLayout from '~/components/list/ListPageLayout.vue'
import TagCloud from '~/components/list/TagCloud.vue'

const config = pagesConfig.tags
const tags = resolveSortedTags()
const totalPosts = getAllPosts().length

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
