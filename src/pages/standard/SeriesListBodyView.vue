<script setup lang="ts">
import { getSeriesList, getArticlesBySeries } from '~/lib/content'
import ItemCard from '~/components/list/ItemCard.vue'

const seriesList = getSeriesList()

const items = seriesList.map((series) => {
  const first = getArticlesBySeries(series.id)[0]
  return {
    name: series.name,
    description: series.description,
    url: first ? `/${series.id}/${first.slug}` : '/series',
    icon: series.icon,
  }
})
</script>

<template>
  <div class="pb-10">
    <ItemCard :items="items" class="animation-delay-100" />
  </div>
</template>
