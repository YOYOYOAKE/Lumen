<script setup lang="ts">
import { useHead } from '@unhead/vue'
import ListHeader from '~/components/list/ListHeader.vue'

const props = defineProps<{
  title: string
  description: string
}>()

useHead(() => ({
  title: props.title,
  meta: [{ name: 'description', content: props.description }],
}))
</script>

<template>
  <div class="px-6 sm:px-8 pt-8">
    <ListHeader :title="title" :description="description" />
  </div>
</template>
