<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string
    iconClass?: string
  }>(),
  {
    title: 'Article',
    iconClass: 'icon-[fluent--list-20-filled] w-4 h-4 opacity-85',
  },
)
</script>

<template>
  <h3 class="font-sans text-sm font-medium mb-4 text-foreground/80 flex items-center gap-2 pl-2">
    <span :class="iconClass" />
    <span>{{ title }}</span>
  </h3>
</template>
