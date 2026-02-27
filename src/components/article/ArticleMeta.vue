<script setup lang="ts">
import { getTagSlug } from '~/lib/content'
import { cn, formatDateTime, parseDateInput } from '~/lib/utils'

defineProps<{
  frontmatter: Record<string, any>
}>()

const topText = 'TOP'
const unfinishedText = 'Unfinished'
const tagBadge =
  'bg-muted/40 text-muted-foreground hover:bg-muted/60 hover:text-foreground border border-transparent'
const recommendBadge =
  'border border-transparent bg-gradient-to-r from-slate-500/15 via-blue-500/15 to-indigo-500/15 text-slate-700 dark:text-slate-300 hover:from-slate-500/25 hover:via-blue-500/25 hover:to-indigo-500/25'
const badgeSize = 'text-xs px-2 py-0.5 gap-1'
</script>

<template>
  <header>
    <div class="space-y-4 md:space-y-5">
      <!-- Description -->
      <p v-if="frontmatter.description" class="text-sm text-muted-foreground/90 leading-relaxed">
        {{ frontmatter.description }}
      </p>

      <!-- Title -->
      <div class="text-xl lg:text-2xl font-semibold leading-tight" data-pagefind-body>
        {{ frontmatter.title }}
      </div>

      <!-- Meta Info -->
      <div
        v-if="frontmatter.createdAt || frontmatter.words !== undefined"
        class="flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-muted-foreground/85"
      >
        <div v-if="frontmatter.createdAt" class="flex items-center gap-1.5">
          <span class="icon-[ph--calendar-blank] w-4 h-4 opacity-85" />
          <time :datetime="parseDateInput(frontmatter.createdAt).toISOString()">
            {{ formatDateTime(frontmatter.createdAt) }}
          </time>
        </div>
        <div v-if="frontmatter.updatedAt" class="flex items-center gap-1.5">
          <span class="icon-[ph--pencil-simple] w-4 h-4 opacity-85" />
          <time :datetime="parseDateInput(frontmatter.updatedAt).toISOString()">
            {{ formatDateTime(frontmatter.updatedAt) }}
          </time>
        </div>
        <div v-if="frontmatter.words !== undefined" class="flex items-center gap-1.5">
          <span class="icon-[ph--book-open-text] w-4 h-4 opacity-85" />
          <span>{{ frontmatter.words }} words</span>
        </div>
      </div>

      <!-- Tags & Badges -->
      <div
        v-if="frontmatter.top || frontmatter.tags?.length || frontmatter.completed === false"
        class="flex gap-2 sm:gap-2.5 lg:gap-3 flex-wrap"
      >
        <span
          v-if="frontmatter.top"
          :class="
            cn(
              'inline-flex items-center font-medium transition-colors duration-200 select-none',
              badgeSize,
              recommendBadge,
            )
          "
          title="Top"
        >
          <span class="icon-[garden--sparkle-fill-16]" />
          <span class="font-semibold tracking-wide">{{ topText }}</span>
        </span>
        <span
          v-if="frontmatter.completed === false"
          :class="
            cn(
              'inline-flex items-center font-medium transition-colors duration-200 select-none',
              badgeSize,
              tagBadge,
            )
          "
          :title="unfinishedText"
        >
          {{ unfinishedText }}
        </span>
        <router-link
          v-for="tag in frontmatter.tags"
          :key="tag"
          :to="`/tags/${getTagSlug(tag)}`"
          :aria-label="`View posts tagged with ${tag}`"
          :class="
            cn(
              'inline-flex items-center font-medium transition-colors duration-200 select-none',
              badgeSize,
              tagBadge,
            )
          "
        >
          <span class="icon-[heroicons--hashtag-16-solid]" />
          {{ tag }}
        </router-link>
      </div>
    </div>
    <div class="border-b border-border/60 my-8 sm:my-10 lg:my-12" />
  </header>
</template>
