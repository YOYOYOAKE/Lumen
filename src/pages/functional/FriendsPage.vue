<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { pagesConfig } from '~/config'
import ItemCard from '~/components/list/ItemCard.vue'
import ListPageLayout from '~/components/list/ListPageLayout.vue'

const config = pagesConfig.friends
const items = config.links.map((friend) => ({
  name: friend.name,
  description: friend.description,
  url: friend.website,
  icon: friend.icon,
}))

useHead({
  title: config.title,
  meta: [{ name: 'description', content: config.description }],
})
</script>

<template>
  <ListPageLayout :title="config.title" :description="config.description">
    <ItemCard :items="items" class="animation-delay-100" />
  </ListPageLayout>
</template>
