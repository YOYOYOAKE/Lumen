<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { resolveSeriesPagePosts, resolveSortedSeriesList } from '~/lib/content'
import ItemCard from '~/components/list/ItemCard.vue'
import ListPageLayout from '~/components/list/ListPageLayout.vue'

const seriesList = resolveSortedSeriesList()

const items = seriesList.map((s) => {
  const first = resolveSeriesPagePosts(s.id)[0]
  return {
    name: s.name,
    description: s.description,
    url: first ? `/${s.id}/${first.slug}` : '/series',
    icon: s.icon,
  }
})

useHead({
  title: 'Series',
  meta: [{ name: 'description', content: '知识就是培根。' }],
})
</script>

<template>
  <ListPageLayout title="Series" description="知识就是培根。">
    <ItemCard :items="items" class="animation-delay-100" />
  </ListPageLayout>
</template>
