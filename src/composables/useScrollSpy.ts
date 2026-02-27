import { ref, onMounted, onUnmounted } from 'vue'

/** Composable that tracks which heading is currently active in the viewport */
export function useScrollSpy(headingSelector = 'h1[id], h2[id], h3[id], h4[id]') {
  const activeId = ref<string | null>(null)
  let observer: IntersectionObserver | null = null

  onMounted(() => {
    const headings = document.querySelectorAll(headingSelector)
    if (!headings.length) return

    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.intersectionRatio > 0) {
            activeId.value = entry.target.id
          }
        }
      },
      { rootMargin: '-96px 0px -85% 0px', threshold: [0, 1] },
    )

    headings.forEach((h) => observer!.observe(h))

    // Set initial active heading
    requestAnimationFrame(() => {
      const visible = Array.from(headings).find((h) => {
        const rect = h.getBoundingClientRect()
        return rect.top > 10 && rect.top < window.innerHeight * 0.33
      })
      if (visible) {
        activeId.value = visible.id
      } else if (headings[0]) {
        activeId.value = headings[0].id
      }
    })
  })

  onUnmounted(() => {
    observer?.disconnect()
  })

  return { activeId }
}
