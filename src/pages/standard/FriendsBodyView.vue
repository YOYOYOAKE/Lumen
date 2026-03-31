<script setup lang="ts">
import { pagesConfig } from '~/config'
import ItemCard from '~/components/list/ItemCard.vue'

const config = pagesConfig.friends
const items = config.links.map((friend) => ({
  name: friend.name,
  description: friend.description,
  url: friend.website,
  icon: friend.icon,
}))
</script>

<template>
  <div class="pb-10">
    <ItemCard :items="items" class="animation-delay-100" />
  </div>
</template>
