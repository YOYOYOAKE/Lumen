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
    class="theme-toggle inline-flex items-center justify-center text-foreground cursor-pointer hover:scale-105 size-6 origin-center relative"
    aria-label="Toggle theme"
    @click="onToggle"
  >
    <span
      class="theme-icon theme-icon-sun icon-[tabler--sun-filled]"
      :class="isDark ? 'is-hidden' : 'is-visible'"
      aria-hidden="true"
    />
    <span
      class="theme-icon theme-icon-moon icon-[tabler--moon-filled]"
      :class="isDark ? 'is-visible' : 'is-hidden'"
      aria-hidden="true"
    />
  </button>
</template>

<style scoped>
.theme-icon {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 1.5rem;
  height: 1.5rem;
  transition:
    transform 420ms ease-in-out,
    opacity 420ms ease-in-out;
}

.theme-icon-sun.is-visible {
  opacity: 1;
  transform: translate(-50%, -50%) rotate(0deg) scale(1);
}

.theme-icon-sun.is-hidden {
  opacity: 0;
  transform: translate(-50%, -50%) rotate(180deg) scale(0.6);
}

.theme-icon-moon.is-visible {
  opacity: 1;
  transform: translate(-50%, -50%) rotate(0deg) scale(1);
}

.theme-icon-moon.is-hidden {
  opacity: 0;
  transform: translate(-50%, -50%) rotate(-180deg) scale(0.6);
}
</style>
