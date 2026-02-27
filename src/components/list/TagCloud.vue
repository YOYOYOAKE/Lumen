<script setup lang="ts">
defineProps<{
  tags: { name: string; slug: string; count: number }[]
  totalPosts: number
}>()
</script>

<template>
  <div>
    <!-- Stats -->
    <div class="mt-6 flex items-center gap-6 text-sm text-muted-foreground">
      <span class="flex items-center gap-1.5">
        <span class="icon-[ph--hash] size-4" />
        {{ tags.length }} tags total
      </span>
      <span class="flex items-center gap-1.5">
        <span class="icon-[ph--article] size-4" />
        {{ totalPosts }} posts total
      </span>
    </div>

    <!-- Tag Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0 fade-up mt-8">
      <router-link
        v-for="tag in tags"
        :key="tag.name"
        :to="`/tags/${tag.slug}`"
        class="group relative block bg-transparent hover:bg-muted/30 transition-colors duration-200 p-4"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2 min-w-0 flex-1">
            <span
              class="icon-[ph--hash] size-4 text-muted-foreground group-hover:text-primary transition-colors"
            />
            <span
              :class="[
                'font-medium text-foreground group-hover:text-primary transition-colors truncate',
                tag.count >= 10 ? 'text-base' : tag.count >= 5 ? 'text-sm' : 'text-xs',
              ]"
            >
              {{ tag.name }}
            </span>
          </div>
          <div class="flex items-center gap-1 ml-2">
            <span
              class="text-xs text-muted-foreground group-hover:text-foreground transition-colors"
              >{{ tag.count }}</span
            >
            <span
              class="icon-[ph--article] size-3.5 text-muted-foreground/70 group-hover:text-muted-foreground transition-colors"
            />
          </div>
        </div>
      </router-link>
    </div>

    <!-- Empty State -->
    <div v-if="tags.length === 0" class="text-center py-12">
      <span class="icon-[ph--tag] size-12 text-muted-foreground/50 mx-auto block mb-4" />
      <p class="text-muted-foreground">No tags available</p>
    </div>
  </div>
</template>
