<script setup lang="ts">
import { cn } from '~/lib/utils'

defineProps<{ class?: string }>()
</script>

<template>
  <section :class="cn('border-y border-border/50 z-[1] relative', $props.class)">
    <div
      class="h-1.5 w-full bg-[repeating-linear-gradient(-45deg,var(--color-border),var(--color-border)_1px,transparent_1px,transparent_6px)] opacity-50"
    />
  </section>
</template>
