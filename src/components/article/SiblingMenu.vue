<script setup lang="ts">
import { computed } from 'vue'
import TocHead from '~/components/article/toc/TocHead.vue'
import TocMenu from '~/components/article/toc/TocMenu.vue'
import type { TocNavSection } from '~/components/article/toc/types'

type SiblingEntry = {
  slug: string
  title: string
  subSeries?: string
}

type SubSeries = {
  directory: string
  title: string
}

const props = defineProps<{
  currentSlug: string
  entries: SiblingEntry[]
  baseUrl: string
  subSeries?: SubSeries[]
}>()

const hasGrouping = computed(() => props.entries.some((item) => Boolean(item.subSeries)))

const groupedEntries = computed(() => {
  const groups = new Map<string, SiblingEntry[]>()

  for (const item of props.entries) {
    const key = item.subSeries ?? ''
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(item)
  }

  const resolved: { key: string; label: string; entries: SiblingEntry[] }[] = []
  const subSeries = props.subSeries ?? []

  for (const item of subSeries) {
    const list = groups.get(item.directory)
    if (!list) continue
    resolved.push({ key: item.directory, label: item.title, entries: list })
    groups.delete(item.directory)
  }

  for (const [key, entries] of groups) {
    resolved.push({ key, label: key || 'Ungrouped', entries })
  }

  return resolved
})

function toArticleLink(slug: string): string {
  return `${props.baseUrl.replace(/\/$/, '')}/${slug}`
}

const groupedSections = computed<TocNavSection[]>(() => {
  if (!hasGrouping.value) {
    return props.entries.map((item) => ({
      levelOne: {
        id: item.slug,
        text: item.title,
        linkType: 'route',
        link: toArticleLink(item.slug),
      },
      levelTwoItems: [],
    }))
  }

  const sections: TocNavSection[] = []

  for (const [sectionIndex, section] of groupedEntries.value.entries()) {
    const first = section.entries[0]
    if (!first) continue

    sections.push({
      levelOne: {
        id: section.key || `__ungrouped-${sectionIndex + 1}`,
        text: section.label,
        linkType: 'route',
        link: toArticleLink(first.slug),
      },
      levelTwoItems: section.entries.map((item) => ({
        id: item.slug,
        text: item.title,
        linkType: 'route',
        link: toArticleLink(item.slug),
        indentClass: 'ml-4',
      })),
    })
  }

  return sections
})
</script>

<template>
  <div
    class="hidden xl:block fixed top-30 left-[calc(50%-var(--layout-half-width))] -translate-x-full w-[clamp(12rem,18vw,18rem)] fade-up"
  >
    <nav class="p-4">
      <TocHead title="Series" icon-class="icon-[ph--folder-notch-open] w-4 h-4 opacity-85" />
      <div class="relative h-[calc(100vh-24rem)] overflow-y-auto no-scrollbar pr-1">
        <ul class="space-y-2 overflow-y-auto no-scrollbar pr-1" style="content-visibility: auto">
          <TocMenu
            :sections="groupedSections"
            :active-id="currentSlug"
          />
        </ul>
      </div>
    </nav>
  </div>
</template>
