import { ref, onMounted } from 'vue'

const STORAGE_KEY = 'theme'
const THEME_SWITCHING_CLASS = 'theme-switching'
const THEME_SWITCH_DURATION = 560

interface ThemeToggleOrigin {
  x: number
  y: number
}

/** Reactive dark mode composable with localStorage persistence */
export function useDarkMode() {
  const isDark = ref(false)

  function getStoredTheme(): boolean {
    if (typeof window === 'undefined') return false
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored !== null) return stored === 'dark'
    // Respect system preference when no stored value
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  }

  function applyTheme(dark: boolean) {
    isDark.value = dark
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', dark)
    }
  }

  function toggle(origin?: ThemeToggleOrigin) {
    const next = !isDark.value
    localStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light')

    if (typeof window === 'undefined' || typeof document === 'undefined') {
      applyTheme(next)
      return
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      applyTheme(next)
      return
    }

    const root = document.documentElement
    const startViewTransition = (document as Document & { startViewTransition?: typeof document.startViewTransition })
      .startViewTransition

    if (!startViewTransition || !origin) {
      root.classList.add(THEME_SWITCHING_CLASS)
      applyTheme(next)
      window.setTimeout(() => {
        root.classList.remove(THEME_SWITCHING_CLASS)
      }, THEME_SWITCH_DURATION)
      return
    }

    const transition = startViewTransition.call(document, () => {
      applyTheme(next)
    })

    transition.ready
      .then(() => {
        const maxX = Math.max(origin.x, window.innerWidth - origin.x)
        const maxY = Math.max(origin.y, window.innerHeight - origin.y)
        const endRadius = Math.hypot(maxX, maxY)

        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${origin.x}px ${origin.y}px)`,
              `circle(${endRadius}px at ${origin.x}px ${origin.y}px)`,
            ],
          },
          {
            duration: THEME_SWITCH_DURATION,
            easing: 'cubic-bezier(0.2, 0.7, 0.2, 1)',
            pseudoElement: '::view-transition-new(root)',
          },
        )
      })
      .catch(() => {})
      .finally(() => {
        void transition.finished.catch(() => {})
      })
  }

  onMounted(() => {
    applyTheme(getStoredTheme())
  })

  return { isDark, toggle }
}
