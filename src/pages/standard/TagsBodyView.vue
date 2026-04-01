<script setup lang="ts">
import { getAllPosts, resolveSortedTags } from '~/lib/content'
import TagCloud from '~/components/list/TagCloud.vue'

const tags = resolveSortedTags()
const totalPosts = getAllPosts().length
</script>

<template>
  <div class="px-6 sm:px-8 pb-10">
    <TagCloud :tags="tags" :total-posts="totalPosts" class="mt-8" />
  </div>
</template>
