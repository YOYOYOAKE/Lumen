<script setup lang="ts">
import { computed, ref } from 'vue'
import type { TocNavSection } from './types'
import TocLevelOne from './TocLevelOne.vue'

const props = withDefaults(
  defineProps<{
    sections: TocNavSection[]
    activeId: string | null
    collapsedActiveMode?: 'map-to-level-one' | 'keep-active'
    stripLeadingOrder?: boolean
  }>(),
  {
    collapsedActiveMode: 'map-to-level-one',
    stripLeadingOrder: true,
  },
)

const collapsedLevelOnes = ref<Set<string>>(new Set())

const leadingOrderPattern = /^\s*\d+(?:\.\d+)*(?:[\s.)、]+)(.+)$/

function isCollapsed(slug: string): boolean {
  return collapsedLevelOnes.value.has(slug)
}

function toggleLevelOne(slug: string) {
  const next = new Set(collapsedLevelOnes.value)
  if (next.has(slug)) {
    next.delete(slug)
  } else {
    next.add(slug)
  }
  collapsedLevelOnes.value = next
}

function normalizeText(text: string): string {
  const cleaned = text.trim()
  if (!props.stripLeadingOrder) return cleaned
  const match = cleaned.match(leadingOrderPattern)
  return (match?.[1] ?? cleaned).trim()
}

const numberedSections = computed(() =>
  props.sections.map((section, levelOneIndex) => ({
    levelOne: {
      ...section.levelOne,
      text: normalizeText(section.levelOne.text),
      displayOrder: String(levelOneIndex + 1).padStart(2, '0'),
    },
    levelTwoItems: section.levelTwoItems.map((item, levelTwoIndex) => ({
      ...item,
      text: normalizeText(item.text),
      displayOrder: `${levelOneIndex + 1}.${levelTwoIndex + 1}`,
    })),
  })),
)

const renderedActiveId = computed(() => {
  const active = props.activeId
  if (!active) return null
  if (props.collapsedActiveMode === 'keep-active') return active

  for (const section of numberedSections.value) {
    const isChildActive = section.levelTwoItems.some((item) => item.id === active)
    if (!isChildActive) continue
    return isCollapsed(section.levelOne.id) ? section.levelOne.id : active
  }

  return active
})
</script>

<template>
  <TocLevelOne
    v-for="section in numberedSections"
    :key="section.levelOne.id"
    :item="section.levelOne"
    :level-two-items="section.levelTwoItems"
    :active-id="renderedActiveId"
    :collapsed="isCollapsed(section.levelOne.id)"
    :has-children="section.levelTwoItems.length > 0"
    @toggle="toggleLevelOne"
  />
</template>
