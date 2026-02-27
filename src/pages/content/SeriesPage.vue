<script setup lang="ts">
import { computed } from 'vue'
import { useHead } from '@unhead/vue'
import {
  getArticlesBySeries,
  getPostsByTagSlug,
  getSeriesConfig,
  getTagNameBySlug,
} from '~/lib/content'
import ListPageLayout from '~/components/list/ListPageLayout.vue'
import PostListItem from '~/components/list/PostListItem.vue'

type SeriesPageProps = { kind: 'series'; series: string } | { kind: 'tag'; tagSlug: string }

const props = defineProps<SeriesPageProps>()
const tagName = computed(() => (props.kind === 'tag' ? getTagNameBySlug(props.tagSlug) : null))

const posts = computed(() =>
  props.kind === 'tag' ? getPostsByTagSlug(props.tagSlug) : getArticlesBySeries(props.series),
)

const title = computed(() => {
  if (props.kind === 'tag') return `#${tagName.value ?? props.tagSlug}`
  return getSeriesConfig(props.series)?.title ?? props.series
})

const description = computed(() => {
  if (props.kind === 'tag') return `${posts.value.length} posts`
  return getSeriesConfig(props.series)?.description ?? `${posts.value.length} articles`
})

const baseUrl = computed(() => {
  if (props.kind === 'tag') return '/posts'
  return `/${props.series}`
})

useHead(() => ({
  title: title.value,
  meta: [{ name: 'description', content: description.value }],
}))
</script>

<template>
  <ListPageLayout
    :key="props.kind === 'tag' ? `tag:${props.tagSlug}` : `series:${props.series}`"
    :title="title"
    :description="description"
  >
    <div class="px-6 sm:px-8 mt-12 fade-up animation-delay-100">
      <PostListItem
        v-for="(post, i) in posts"
        :key="post.slug"
        :post="post"
        :index="i"
        :base-url="baseUrl"
      />
    </div>
  </ListPageLayout>
</template>
