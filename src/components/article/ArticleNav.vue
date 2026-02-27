<script setup lang="ts">
defineProps<{
  prev: { slug: string; title: string } | null
  next: { slug: string; title: string } | null
  baseUrl: string
}>()
</script>

<template>
  <div class="px-6 sm:px-8 pb-6 sm:pb-8 fade-up">
    <nav class="flex flex-col sm:flex-row justify-between gap-6 pt-2 border-t border-border/50">
      <!-- Previous -->
      <div class="flex-1">
        <router-link
          v-if="prev"
          :to="`${baseUrl}/${prev.slug}`"
          class="group flex-1 relative block"
        >
          <div
            class="absolute -left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 group-hover:-translate-x-1 transition-all duration-200"
          >
            <span class="icon-[ph--arrow-left] size-4 text-primary" />
          </div>
          <div class="group-hover:pl-6 transition-all duration-200">
            <span class="text-[10px] uppercase tracking-widest text-muted-foreground/70"
              >Previous</span
            >
            <p
              class="mt-1.5 font-semibold text-base text-foreground/90 group-hover:text-primary transition-colors line-clamp-1"
            >
              {{ prev.title }}
            </p>
          </div>
        </router-link>
        <div v-else class="select-none opacity-45">
          <span class="text-[10px] uppercase tracking-widest text-muted-foreground/70"
            >Previous</span
          >
          <p class="mt-1.5 font-semibold text-base text-foreground/70 line-clamp-1">NO PREVIOUS</p>
        </div>
      </div>

      <!-- Next -->
      <div class="flex-1 text-right">
        <router-link
          v-if="next"
          :to="`${baseUrl}/${next.slug}`"
          class="group flex-1 relative block"
        >
          <div
            class="absolute -right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200"
          >
            <span class="icon-[ph--arrow-right] size-4 text-primary" />
          </div>
          <div class="group-hover:pr-6 transition-all duration-200">
            <span class="text-[10px] uppercase tracking-widest text-muted-foreground/70">Next</span>
            <p
              class="mt-1.5 font-semibold text-base text-foreground/90 group-hover:text-primary transition-colors line-clamp-1"
            >
              {{ next.title }}
            </p>
          </div>
        </router-link>
        <div v-else class="select-none opacity-45">
          <span class="text-[10px] uppercase tracking-widest text-muted-foreground/70">Next</span>
          <p class="mt-1.5 font-semibold text-base text-foreground/70 line-clamp-1">NO NEXT</p>
        </div>
      </div>
    </nav>
  </div>
</template>
