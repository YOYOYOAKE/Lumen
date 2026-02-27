<script setup lang="ts">
import ListHeader from '~/components/list/ListHeader.vue'

defineProps<{
  title: string
  description: string
}>()
</script>

<template>
  <section class="relative z-[1] py-8 pb-10">
    <div class="px-6 sm:px-8">
      <ListHeader :title="title" :description="description" />
    </div>
    <slot />
  </section>
</template>
