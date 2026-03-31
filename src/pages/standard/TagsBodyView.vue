<script setup lang="ts">
import { computed } from 'vue'
import { getAllPosts, getAllTagItems } from '~/lib/content'
import TagCloud from '~/components/list/TagCloud.vue'

const tags = computed(() =>
  [...getAllTagItems()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'zh-CN')),
)
const totalPosts = computed(() => getAllPosts().length)
</script>

<template>
  <div class="px-6 sm:px-8 pb-10">
    <TagCloud :tags="tags" :total-posts="totalPosts" class="mt-8" />
  </div>
</template>
