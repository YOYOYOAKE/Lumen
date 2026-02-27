<script setup lang="ts">
import { getTagSlug } from '~/lib/content'
import { cn, formatDate, parseDateInput } from '~/lib/utils'
import type { ResolvedArticleMeta } from '~/types'

defineProps<{
  post: ResolvedArticleMeta
  index: number
  baseUrl?: string
}>()

const topText = 'TOP'
const unfinishedText = 'Unfinished'
const tagBadge =
  'bg-muted/40 text-muted-foreground hover:bg-muted/60 hover:text-foreground border border-transparent'
const recommendBadge =
  'border border-transparent bg-gradient-to-r from-slate-500/15 via-blue-500/15 to-indigo-500/15 text-slate-700 dark:text-slate-300 hover:from-slate-500/25 hover:via-blue-500/25 hover:to-indigo-500/25'
</script>

<template>
  <div
    class="group relative block py-6 border-b border-border/60 last:border-none fade-up"
    :style="{ animationDelay: `${index * 100}ms` }"
  >
    <article
      class="relative z-1 flex flex-col gap-2 transform transition-transform duration-300 group-hover:translate-x-4"
    >
      <!-- Date -->
      <div class="flex sm:items-center gap-2 sm:gap-3 text-sm text-muted-foreground">
        <span class="inline-flex items-center gap-1.5">
          <span class="icon-[ph--calendar-blank] size-3.5 sm:size-4" />
          <time
            :datetime="parseDateInput(post.frontmatter.createdAt).toISOString()"
            class="text-xs sm:text-sm"
          >
            {{ formatDate(post.frontmatter.createdAt) }}
          </time>
        </span>
      </div>

      <!-- Title & Description -->
      <router-link :to="`${baseUrl ?? '/posts'}/${post.slug}`" class="block">
        <div
          class="text-base font-semibold text-foreground leading-tight group-hover:text-primary transition-colors line-clamp-2"
        >
          {{ post.frontmatter.title }}
        </div>
        <p
          v-if="post.frontmatter.description"
          class="mt-1 text-sm text-muted-foreground/90 leading-5 line-clamp-2"
        >
          {{ post.frontmatter.description }}
        </p>
      </router-link>

      <!-- Tags -->
      <div
        v-if="
          post.frontmatter.top ||
          post.frontmatter.tags?.length ||
          post.frontmatter.completed === false
        "
        class="flex flex-wrap gap-1.5"
      >
        <span
          v-if="post.frontmatter.top"
          :class="
            cn(
              'inline-flex items-center font-medium transition-colors duration-200 select-none text-xs px-2 py-0.5 gap-1',
              recommendBadge,
            )
          "
          title="Top"
        >
          <span class="icon-[garden--sparkle-fill-16]" />
          <span class="font-semibold tracking-wide">{{ topText }}</span>
        </span>
        <span
          v-if="post.frontmatter.completed === false"
          :class="
            cn(
              'inline-flex items-center font-medium transition-colors duration-200 select-none text-xs px-2 py-0.5 gap-1',
              tagBadge,
            )
          "
          :title="unfinishedText"
        >
          {{ unfinishedText }}
        </span>
        <router-link
          v-for="tag in (post.frontmatter.tags ?? []).slice(0, 5)"
          :key="tag"
          :to="`/tags/${getTagSlug(tag)}`"
          :aria-label="`View posts tagged with ${tag}`"
          :class="
            cn(
              'inline-flex items-center font-medium transition-colors duration-200 select-none text-xs px-2 py-0.5 gap-1',
              tagBadge,
            )
          "
        >
          <span class="icon-[heroicons--hashtag-16-solid]" />
          {{ tag }}
        </router-link>
        <span
          v-if="(post.frontmatter.tags?.length ?? 0) > 5"
          class="text-xs text-muted-foreground/60"
        >
          +{{ (post.frontmatter.tags?.length ?? 0) - 5 }} more
        </span>
      </div>
    </article>

    <!-- Pinned star decoration -->
    <span
      v-if="post.frontmatter.top"
      class="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 -translate-x-4 size-16 sm:size-20 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-primary/10 dark:text-primary/20 icon-[solar--star-rainbow-bold-duotone]"
    />

    <!-- Left accent bar -->
    <div
      class="absolute left-0 top-0 h-full w-0.5 sm:w-1 scale-y-0 bg-accent/80 transition-transform duration-300 group-hover:scale-y-100"
    />
  </div>
</template>
