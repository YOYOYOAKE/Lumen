<script setup lang="ts">
import { cn } from '~/lib/utils'
import type { SkillsConfig, SkillItem } from '~/types'

defineProps<{ config: SkillsConfig }>()

function duplicate(items: SkillItem[]): SkillItem[] {
  return [...items, ...items, ...items, ...items]
}
</script>

<template>
  <div class="py-8 pb-10 px-6 max-md:px-6 fade-up">
    <div class="px-2 max-md:px-0">
      <h2 class="text-2xl sm:text-3xl tracking-tight">{{ config.title }}</h2>
      <p class="text-muted-foreground mb-6 mt-1">{{ config.description }}</p>
    </div>
    <div class="relative py-2 px-2 max-md:px-0">
      <div
        v-for="(row, ri) in config.rows"
        :key="ri"
        class="relative w-full overflow-hidden my-4"
      >
        <div
          :class="
            cn(
              'flex w-max will-change-transform safari-only',
              row.direction === 'right'
                ? 'animate-[scroll-reverse_30s_linear_infinite]'
                : 'animate-[scroll_30s_linear_infinite]',
            )
          "
          style="transform: translateZ(0)"
        >
          <span
            v-for="(item, ii) in duplicate(row.items)"
            :key="`${ri}-${ii}`"
            class="safari-item flex items-center gap-2 px-5 py-2 mx-2 rounded-full border border-border bg-accent text-foreground whitespace-nowrap dark:shadow-md transition-colors"
          >
            <span :class="cn('flex items-center justify-center w-5 h-5', item.icon)" />
            <span class="font-sans text-sm font-medium">{{ item.name }}</span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
@keyframes scroll {
  0% {
    transform: translate3d(0, 0, 0);
  }

  100% {
    transform: translate3d(-25%, 0, 0);
  }
}

@keyframes scroll-reverse {
  0% {
    transform: translate3d(-25%, 0, 0);
  }

  100% {
    transform: translate3d(0, 0, 0);
  }
}

.safari-only {
  transform-style: preserve-3d;
}

.safari-item {
  transform: translate3d(0, 0, 0);
  backface-visibility: hidden;
  contain: layout style paint;
  will-change: transform;
}
</style>
