<script setup lang="ts">
import { useBackToTop } from '~/composables/useBackToTop'
import { cn } from '~/lib/utils'

const props = defineProps<{ class?: string }>()
const { isVisible, scrollToTop } = useBackToTop()
</script>

<template>
  <button
    :class="
      cn(
        'group flex items-center justify-center size-9',
        'bg-primary/4 hover:bg-primary/10 text-primary/70 hover:text-primary',
        'transition-all duration-300 ease-out cursor-pointer',
        'dark:bg-primary/10 dark:hover:bg-primary/15 dark:text-primary/80 dark:hover:text-primary',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 invisible translate-y-4',
        props.class,
      )
    "
    aria-label="Back to top"
    @click="scrollToTop"
  >
    <span
      class="icon-[ph--arrow-up] transition-transform duration-200 group-hover:-translate-y-0.5 size-4"
    />
  </button>
</template>
