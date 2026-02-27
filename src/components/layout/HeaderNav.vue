<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { cn } from '~/lib/utils'
import type { NavLink } from '~/types'

defineProps<{ links: NavLink[] }>()

const route = useRoute()
const currentPath = computed(() => route.path)

function isActive(href: string): boolean {
  if (href === '/') return currentPath.value === '/'
  return currentPath.value.startsWith(href)
}
</script>

<template>
  <div class="flex gap-1">
    <router-link
      v-for="link in links"
      :key="link.href"
      :to="link.href"
      :class="
        cn(
          'text-sm px-2 sm:px-4 py-2 font-medium first:pl-0 sm:first:pl-4',
          'transition-colors text-foreground/50 hover:bg-accent hover:text-foreground',
          isActive(link.href) && 'text-foreground',
        )
      "
    >
      {{ link.label }}
    </router-link>
  </div>
</template>
