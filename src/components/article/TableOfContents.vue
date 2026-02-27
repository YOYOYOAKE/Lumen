<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue'
import { useScrollSpy } from '~/composables/useScrollSpy'
import type { TocHeading } from '~/types'
import TocHead from '~/components/article/toc/TocHead.vue'
import TocMenu from '~/components/article/toc/TocMenu.vue'
import type { TocNavSection } from '~/components/article/toc/types'

type TocDisplayItem = TocHeading & {
  text: string
}

const props = defineProps<{ headings: TocHeading[] }>()

const { activeId } = useScrollSpy()

const filteredHeadings = computed<TocDisplayItem[]>(() => {
  return props.headings
    .filter((h) => h.depth <= 4 && h.text.trim() && h.slug !== 'footnote-label')
    .map((h) => {
      // Clean up heading text only; numbering is generated in TocMenu
      const cleaned = h.text.replace(/\s*[Hh][1-6]$/g, '').trim()
      return {
        ...h,
        text: cleaned,
      }
    })
})

const minDepth = computed(() =>
  filteredHeadings.value.length > 0 ? Math.min(...filteredHeadings.value.map((h) => h.depth)) : 2,
)

const indentMap = ['ml-0', 'ml-4', 'ml-8', 'ml-12']

function getIndent(depth: number): string {
  return indentMap[depth - minDepth.value] ?? 'ml-12'
}

const sections = computed<TocNavSection[]>(() => {
  const resolved: TocNavSection[] = []
  let current: TocNavSection | null = null

  for (const heading of filteredHeadings.value) {
    if (heading.depth === minDepth.value || !current) {
      current = {
        levelOne: {
          id: heading.slug,
          text: heading.text,
          displayOrder: '',
          linkType: 'anchor',
          link: `#${heading.slug}`,
          trackingId: heading.slug,
        },
        levelTwoItems: [],
      }
      resolved.push(current)
      continue
    }

    current.levelTwoItems.push({
      id: heading.slug,
      text: heading.text,
      displayOrder: '',
      indentClass: getIndent(heading.depth),
      linkType: 'anchor',
      link: `#${heading.slug}`,
      trackingId: heading.slug,
    })
  }

  return resolved
})

// Scroll tracking for TOC auto-scroll
const tocList = ref<HTMLElement | null>(null)

watch(activeId, async () => {
  await nextTick()
  if (!tocList.value || !activeId.value) return
  const activeLink = tocList.value.querySelector(
    `[data-heading-id="${activeId.value}"]`,
  ) as HTMLElement
  if (!activeLink) return
  const container = tocList.value.parentElement
  if (!container) return
  const containerH = container.offsetHeight
  const linkTop = activeLink.offsetTop
  const linkH = activeLink.offsetHeight
  const listH = tocList.value.offsetHeight
  let target = Math.max(0, linkTop - containerH / 2 + linkH / 2)
  target = Math.min(target, listH - containerH)
  tocList.value.style.transition = 'transform 0.3s ease-out'
  tocList.value.style.transform = `translateY(-${target}px)`
})
</script>

<template>
  <div
    v-if="filteredHeadings.length > 0"
    class="hidden xl:block fixed top-30 right-[calc(50%-var(--layout-half-width))] translate-x-full w-[clamp(12rem,18vw,18rem)] fade-up"
  >
    <nav class="p-4">
      <TocHead />
      <div class="relative h-[calc(100vh-24rem)] overflow-hidden">
        <ul
          ref="tocList"
          class="space-y-2 absolute w-full transition-transform duration-300 will-change-transform"
          style="content-visibility: auto"
        >
          <TocMenu
            :sections="sections"
            :active-id="activeId"
            collapsed-active-mode="map-to-level-one"
            :strip-leading-order="true"
          />
        </ul>
      </div>
    </nav>
  </div>
</template>
