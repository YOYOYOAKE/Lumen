<script setup lang="ts">
import { useDarkMode } from '~/composables/useDarkMode'

const { isDark, toggle } = useDarkMode()

function onToggle(event: MouseEvent) {
  const target = event.currentTarget
  if (!(target instanceof HTMLElement)) {
    toggle()
    return
  }

  const rect = target.getBoundingClientRect()
  toggle({
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  })
}
</script>

<template>
  <button
    type="button"
    class="inline-flex items-center justify-center text-foreground cursor-pointer hover:scale-105 size-6 origin-center relative"
    aria-label="Toggle theme"
    @click="onToggle"
  >
    <span
      class="icon-[tabler--sun-filled] absolute left-1/2 top-1/2 size-6 -translate-x-1/2 -translate-y-1/2 transition-[transform,opacity] duration-[420ms] ease-in-out"
      :class="isDark ? 'opacity-0 rotate-180 scale-[0.6]' : 'opacity-100 rotate-0 scale-100'"
      aria-hidden="true"
    />
    <span
      class="icon-[tabler--moon-filled] absolute left-1/2 top-1/2 size-6 -translate-x-1/2 -translate-y-1/2 transition-[transform,opacity] duration-[420ms] ease-in-out"
      :class="isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-180 scale-[0.6]'"
      aria-hidden="true"
    />
  </button>
</template>
