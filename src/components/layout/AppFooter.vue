<script setup lang="ts">
import { cn } from '~/lib/utils'
import type { NavLink } from '~/types'
import { navigationConfig } from '~/config'
import { siteConfig } from '~/config'

const links = navigationConfig.footer
const author = siteConfig.author
const copyrightStartYear = siteConfig.copyright.startYear
const copyrightStatement = siteConfig.copyright.statement
const year = new Date().getFullYear()
</script>

<template>
  <footer>
    <div class="py-4 flex-none border-x border-border/50 global-layout-width mx-auto">
      <div class="pb-8">
        <!-- Footer Navigation -->
        <div
          class="flex flex-wrap gap-x-3 sm:gap-x-6 gap-y-1 text-sm font-medium text-muted-foreground pb-4 px-6 sm:px-8 border-b border-border/50"
        >
          <router-link
            v-for="link in links"
            :key="link.href"
            :to="link.href"
            :class="
              cn('transition text-muted-foreground/80 hover:text-zinc-900 dark:hover:text-white')
            "
          >
            {{ link.label }}
          </router-link>
        </div>

        <!-- Copyright -->
        <div class="text-sm text-muted-foreground px-6 sm:px-8 py-4">
          <div class="items-center gap-4 font-medium">
            <div>© {{ copyrightStartYear }} - {{ year }} {{ copyrightStatement }} {{ author }}.</div>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>
