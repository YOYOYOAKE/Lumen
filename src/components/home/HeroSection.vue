<script setup lang="ts">
import { cn } from '~/lib/utils'
import type { SocialLink } from '~/types'

defineProps<{
  title: string
  subtitle: string
  paragraphs: string[]
  social: SocialLink[]
}>()
</script>

<template>
  <div class="py-8 pb-10 px-6 sm:px-8">
    <h1 class="flex flex-col gap-2">
      <span class="text-4xl sm:text-5xl tracking-tight">{{ title }}</span>
      <span
        class="text-muted-foreground font-light text-xl sm:text-2xl block tracking-wide text-balance"
      >
        {{ subtitle }}
      </span>
    </h1>
    <div class="pro text-muted-foreground text-pretty">
      <p v-for="(text, i) in paragraphs" :key="i">{{ text }}</p>
    </div>
    <div class="mt-6 flex gap-6">
      <a
        v-for="item in social"
        :key="item.name"
        :class="
          cn(
            'group -m-1 p-1 ring-offset-background focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded flex items-center gap-2 cursor-pointer',
          )
        "
        :href="item.href"
        :aria-label="`Link of ${item.name}`"
        target="_blank"
      >
        <span
          :class="
            cn('h-6 w-6 text-muted-foreground transition group-hover:text-primary', item.icon)
          "
        />
        <span
          v-if="item.count !== undefined"
          class="text-muted-foreground text-sm group-hover:text-primary"
        >
          {{ item.count }} followers
        </span>
      </a>
    </div>
  </div>
</template>
