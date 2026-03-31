<script setup lang="ts">
const articleSkeletonWidths = ['100%', '94%', '97%', '83%']
const secondaryArticleSkeletonWidths = ['98%', '92%', '95%', '79%']
const codeSkeletonWidths = ['82%', '88%', '65%', '91%', '72%']
</script>

<template>
  <div class="relative flex flex-col justify-between h-fit z-[1]" aria-busy="true">
    <span class="sr-only" role="status" aria-live="polite">Loading article</span>

    <article class="relative">
      <div class="px-6 sm:px-8 py-4 sm:py-6 lg:py-8">
        <div class="global-layout-width mx-auto">
          <header>
            <div class="space-y-4 md:space-y-5">
              <div class="space-y-2">
                <div class="h-3.5 rounded-full skeleton-shimmer" style="width: 62%" />
                <div class="h-3.5 rounded-full skeleton-shimmer" style="width: 38%" />
              </div>

              <div class="space-y-3">
                <div class="h-8 rounded-md skeleton-shimmer" style="width: 78%" />
                <div class="h-8 rounded-md skeleton-shimmer" style="width: 56%" />
              </div>

              <div class="flex flex-wrap items-center gap-3 sm:gap-4">
                <div class="h-4 rounded-full skeleton-shimmer" style="width: 7.25rem" />
                <div class="h-4 rounded-full skeleton-shimmer" style="width: 7.75rem" />
                <div class="h-4 rounded-full skeleton-shimmer" style="width: 5.25rem" />
              </div>

              <div class="flex flex-wrap gap-2 sm:gap-2.5 lg:gap-3">
                <div class="h-6 rounded-md skeleton-shimmer" style="width: 4rem" />
                <div class="h-6 rounded-md skeleton-shimmer" style="width: 5.5rem" />
                <div class="h-6 rounded-md skeleton-shimmer" style="width: 4.75rem" />
              </div>
            </div>
            <div class="border-b border-border/60 my-8 sm:my-10 lg:my-12" />
          </header>

          <div class="space-y-10">
            <section class="space-y-4">
              <div class="h-6 rounded-md skeleton-shimmer" style="width: 32%" />
              <div class="space-y-3">
                <div
                  v-for="(width, index) in articleSkeletonWidths"
                  :key="`article-skeleton-primary-${index}`"
                  class="h-4 rounded-full skeleton-shimmer"
                  :style="{ width }"
                />
              </div>
            </section>

            <section class="space-y-4">
              <div class="h-6 rounded-md skeleton-shimmer" style="width: 28%" />
              <div class="space-y-3">
                <div
                  v-for="(width, index) in secondaryArticleSkeletonWidths"
                  :key="`article-skeleton-secondary-${index}`"
                  class="h-4 rounded-full skeleton-shimmer"
                  :style="{ width }"
                />
              </div>
            </section>

            <section class="overflow-hidden rounded-xl border border-border/60">
              <div
                class="flex items-center justify-between border-b border-border/60 bg-muted/30 px-4 py-3"
              >
                <div class="h-3.5 rounded-full skeleton-shimmer" style="width: 4.75rem" />
                <div class="w-4 h-4 rounded-sm skeleton-shimmer" />
              </div>
              <div class="space-y-3 px-4 py-4">
                <div
                  v-for="(width, index) in codeSkeletonWidths"
                  :key="`article-skeleton-code-${index}`"
                  class="h-4 rounded-full skeleton-shimmer"
                  :style="{ width }"
                />
              </div>
            </section>

            <section class="space-y-4">
              <div class="h-6 rounded-md skeleton-shimmer" style="width: 24%" />
              <div class="space-y-3">
                <div class="h-4 rounded-full skeleton-shimmer" style="width: 100%" />
                <div class="h-4 rounded-full skeleton-shimmer" style="width: 93%" />
                <div class="h-4 rounded-full skeleton-shimmer" style="width: 88%" />
              </div>
            </section>
          </div>
        </div>
      </div>
    </article>

    <div class="px-6 sm:px-8 pb-6 sm:pb-8">
      <nav class="flex flex-col sm:flex-row justify-between gap-6 pt-2 border-t border-border/50">
        <div class="flex-1 space-y-2">
          <div class="h-2.5 rounded-full skeleton-shimmer" style="width: 4rem" />
          <div class="h-5 rounded-full skeleton-shimmer" style="width: 78%" />
        </div>
        <div class="flex-1 space-y-2 sm:items-end sm:text-right">
          <div class="h-2.5 rounded-full skeleton-shimmer sm:ml-auto" style="width: 3.5rem" />
          <div class="h-5 rounded-full skeleton-shimmer sm:ml-auto" style="width: 70%" />
        </div>
      </nav>
    </div>
  </div>
</template>
