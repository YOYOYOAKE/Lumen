<script setup lang="ts">
import { useHead } from '@unhead/vue'
import ListHeader from '~/components/list/ListHeader.vue'
import {
  useSeriesStandardPage,
  type SeriesStandardPageProps,
} from '~/pages/standard/useSeriesStandardPage'

const props = defineProps<SeriesStandardPageProps>()
const { title, description } = useSeriesStandardPage(props)

useHead(() => ({
  title: title.value,
  meta: [{ name: 'description', content: description.value }],
}))
</script>

<template>
  <div class="px-6 sm:px-8 pt-8">
    <ListHeader :title="title" :description="description" />
  </div>
</template>
