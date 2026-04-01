<script setup lang="ts">
import PostListItem from '~/components/list/PostListItem.vue'
import {
  useSeriesStandardPage,
  type SeriesStandardPageProps,
} from '~/pages/standard/useSeriesStandardPage'

const props = defineProps<SeriesStandardPageProps>()
const { posts, baseUrl, tagSlug } = useSeriesStandardPage(props)
</script>

<template>
  <div class="px-6 sm:px-8 mt-12 pb-10 fade-up animation-delay-100">
    <PostListItem
      v-for="(post, i) in posts"
      :key="post.slug"
      :post="post"
      :index="i"
      :base-url="baseUrl"
      :tag-slug="tagSlug"
    />
  </div>
</template>
