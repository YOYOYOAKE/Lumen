<script setup lang="ts">
import { cn, isExternalLink, isIconClass } from '~/lib/utils'

defineProps<{
  items: {
    name: string
    description: string
    url: string
    icon?: string
  }[]
}>()
</script>

<template>
  <div class="grid grid-cols-1 fade-up">
    <div v-for="item in items" :key="item.url">
      <router-link
        v-if="!isExternalLink(item.url)"
        :to="item.url"
        class="group relative flex items-center gap-4 hover:bg-muted/30 dark:hover:bg-muted/30 transition-colors duration-300 px-6 sm:px-8 py-4"
      >
        <div v-if="item.icon" class="flex-shrink-0 mt-0.5">
          <span v-if="isIconClass(item.icon)" :class="cn('size-10', item.icon)" />
          <img v-else :src="item.icon" alt="icon" class="size-10 rounded-full object-cover" />
        </div>
        <div class="min-w-0">
          <div class="font-semibold text-lg/relaxed">{{ item.name }}</div>
          <p class="text-muted-foreground">{{ item.description }}</p>
        </div>
      </router-link>
      <a
        v-else
        :href="item.url"
        target="_blank"
        rel="noopener noreferrer"
        class="group relative flex items-center gap-4 hover:bg-muted/30 dark:hover:bg-muted/30 transition-colors duration-300 px-6 sm:px-8 py-4"
      >
        <div v-if="item.icon" class="flex-shrink-0 mt-0.5">
          <span v-if="isIconClass(item.icon)" :class="cn('size-10', item.icon)" />
          <img v-else :src="item.icon" alt="icon" class="size-10 rounded-full object-cover" />
        </div>
        <div class="min-w-0">
          <div class="font-semibold text-lg/relaxed">{{ item.name }}</div>
          <p class="text-muted-foreground">{{ item.description }}</p>
        </div>
      </a>
    </div>
  </div>
</template>
