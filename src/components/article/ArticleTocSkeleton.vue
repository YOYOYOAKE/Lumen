<script setup lang="ts">
const tocSkeletonWidths = ['66%', '74%', '54%', '70%', '48%', '62%']
</script>

<template>
  <div
    class="hidden xl:block fixed top-30 right-[calc(50%-var(--layout-half-width))] translate-x-full w-[clamp(12rem,18vw,18rem)] fade-up"
    aria-busy="true"
  >
    <span class="sr-only" role="status" aria-live="polite">Loading article outline</span>

    <nav class="p-4">
      <div class="flex items-center gap-2 mb-4 pl-2">
        <div class="w-4 h-4 rounded-sm skeleton-shimmer" />
        <div class="h-4 rounded-full skeleton-shimmer" style="width: 4rem" />
      </div>
      <div class="relative h-[calc(100vh-24rem)] overflow-hidden">
        <ul class="space-y-3 absolute w-full">
          <li
            v-for="(width, index) in tocSkeletonWidths"
            :key="`toc-skeleton-${index}`"
            class="h-3.5 rounded-full skeleton-shimmer"
            :class="{ 'ml-4': index % 3 === 1, 'ml-8': index % 3 === 2 }"
            :style="{ width }"
          />
        </ul>
      </div>
    </nav>
  </div>
</template>
