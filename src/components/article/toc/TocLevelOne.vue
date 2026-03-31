<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '~/lib/utils'
import type { TocNavItem } from './types'
import TocLevelTwo from './TocLevelTwo.vue'

const props = defineProps<{
  item: TocNavItem
  levelTwoItems: TocNavItem[]
  activeId: string | null
}>()

const linkComponent = computed(() => (props.item.linkType === 'anchor' ? 'a' : 'router-link'))

const linkProps = computed(() =>
  props.item.linkType === 'anchor' ? { href: props.item.link } : { to: props.item.link },
)
</script>

<template>
  <li :class="cn('ml-0', 'font-medium text-foreground')">
    <component
      :is="linkComponent"
      v-bind="linkProps"
      :data-heading-id="props.item.trackingId"
      :class="
        cn(
          'group flex items-center text-sm min-h-[1.75rem] w-full overflow-hidden relative',
          'hover:bg-gradient-to-r hover:from-primary/10 dark:hover:from-primary/25 hover:to-transparent',
          props.activeId === props.item.id &&
            'bg-gradient-to-r from-primary/10 dark:from-primary/25 to-transparent',
        )
      "
    >
      <span
        :class="
          cn(
            'leading-[1.75rem] truncate px-2',
            props.activeId === props.item.id ? 'text-primary' : 'group-hover:text-primary',
          )
        "
        :title="props.item.text"
      >
        {{ props.item.text }}
      </span>
    </component>
  </li>
  <TocLevelTwo
    v-for="child in props.levelTwoItems"
    :key="child.id"
    :item="child"
    :active-id="props.activeId"
  />
</template>
