<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import mediumZoom from 'medium-zoom/dist/pure'

defineProps<{ html: string }>()

let zoom: ReturnType<typeof mediumZoom> | null = null

onMounted(() => {
  zoom = mediumZoom({ background: 'rgb(0 0 0 / 0.8)' })
  zoom.attach('.markdown img:not(.no-zoom):not(a img)')
})

onUnmounted(() => {
  zoom?.detach()
})
</script>

<template>
  <div class="markdown" data-pagefind-body v-html="html" />
</template>
