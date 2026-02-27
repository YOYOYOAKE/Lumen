<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '~/lib/utils'
import type { TocNavItem } from './types'

const props = defineProps<{
  item: TocNavItem
  activeId: string | null
}>()

const linkComponent = computed(() => (props.item.linkType === 'anchor' ? 'a' : 'router-link'))

const linkProps = computed(() =>
  props.item.linkType === 'anchor' ? { href: props.item.link } : { to: props.item.link },
)
</script>

<template>
  <li :class="cn(props.item.indentClass ?? 'ml-4', 'text-foreground/60 hover:text-foreground/90')">
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
            'font-mono flex items-center px-2 text-xs min-w-[2.25rem]',
            props.activeId === props.item.id
              ? 'text-primary'
              : 'text-primary/50 group-hover:text-primary',
          )
        "
      >
        {{ props.item.displayOrder }}
      </span>
      <span
        :class="
          cn(
            'leading-[1.75rem] truncate pr-2',
            props.activeId === props.item.id ? 'text-primary' : 'group-hover:text-primary',
          )
        "
        :title="props.item.text"
      >
        {{ props.item.text }}
      </span>
    </component>
  </li>
</template>
