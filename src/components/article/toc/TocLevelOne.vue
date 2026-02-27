<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '~/lib/utils'
import type { TocNavItem } from './types'
import TocLevelTwo from './TocLevelTwo.vue'

const props = defineProps<{
  item: TocNavItem
  levelTwoItems: TocNavItem[]
  activeId: string | null
  collapsed: boolean
  hasChildren: boolean
}>()

const emit = defineEmits<{
  toggle: [id: string]
}>()

function onToggle() {
  if (!props.hasChildren) return
  emit('toggle', props.item.id)
}

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
            'font-mono flex items-center px-2 text-xs min-w-[2.25rem]',
            props.activeId === props.item.id
              ? 'text-primary'
              : 'text-primary/50 group-hover:text-primary',
          )
        "
      >
        <span
          class="group/number relative inline-flex items-center justify-center"
          :role="props.hasChildren ? 'button' : undefined"
          :tabindex="props.hasChildren ? 0 : -1"
          :aria-label="props.hasChildren ? (props.collapsed ? 'Expand section' : 'Collapse section') : undefined"
          @click.stop.prevent="props.hasChildren && onToggle()"
          @keydown.enter.stop.prevent="props.hasChildren && onToggle()"
          @keydown.space.stop.prevent="props.hasChildren && onToggle()"
        >
          <span
            :class="
              cn(
                'inline-flex items-center justify-center transition-opacity duration-200',
                props.hasChildren && 'group-hover/number:opacity-0',
              )
            "
          >
            {{
              /^\d$/.test(props.item.displayOrder)
                ? props.item.displayOrder.padStart(2, '0')
                : props.item.displayOrder
            }}
          </span>
          <span
            v-if="props.hasChildren"
            :class="
              cn(
                'icon-[ph--caret-right-bold] absolute inset-0 inline-flex items-center justify-center size-3 transition-all duration-200 opacity-0 scale-90 group-hover/number:opacity-100 group-hover/number:scale-100',
                !props.collapsed && 'rotate-90',
              )
            "
          />
        </span>
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

  <TransitionGroup name="toc-collapse">
    <TocLevelTwo
      v-for="child in (props.collapsed ? [] : props.levelTwoItems)"
      :key="child.id"
      :item="child"
      :active-id="props.activeId"
    />
  </TransitionGroup>
</template>

<style>
.toc-collapse-enter-active,
.toc-collapse-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease,
    max-height 0.2s ease;
  overflow: hidden;
}

.toc-collapse-enter-from,
.toc-collapse-leave-to {
  opacity: 0;
  transform: translateY(-4px);
  max-height: 0;
}

.toc-collapse-enter-to,
.toc-collapse-leave-from {
  opacity: 1;
  transform: translateY(0);
  max-height: 2.5rem;
}
</style>
