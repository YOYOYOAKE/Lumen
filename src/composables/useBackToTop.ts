import { ref, onMounted, onUnmounted } from 'vue'

/** Composable that shows/hides a back-to-top button based on scroll position */
export function useBackToTop(threshold = 300) {
  const isVisible = ref(false)

  function handleScroll() {
    isVisible.value = window.scrollY > threshold
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  onMounted(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
  })

  return { isVisible, scrollToTop }
}
