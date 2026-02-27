<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'

interface PagefindSubResult {
  url: string
  title?: string
  excerpt?: string
}

interface PagefindData {
  url: string
  meta?: { title?: string }
  excerpt?: string
  sub_results?: PagefindSubResult[]
}

interface PagefindSearchResult {
  data: () => Promise<PagefindData>
}

interface PagefindSearchResponse {
  results?: PagefindSearchResult[]
}

interface PagefindApi {
  options: (options: { excerptLength: number; showSubResults: boolean }) => void
  init: () => void
  search: (query: string) => Promise<unknown>
  debouncedSearch: (query: string) => Promise<PagefindSearchResponse>
}

interface SearchSubResult {
  url: string
  title: string
  excerpt: string
}

interface SearchResultItem {
  url: string
  title: string
  excerpt: string
  subResults: SearchSubResult[]
}

interface SearchWindow extends Window {
  pagefind?: PagefindApi
  __pagefind?: PagefindApi
}

const isOpen = ref(false)
const query = ref('')
const results = ref<SearchResultItem[]>([])
const exactMode = ref(false)
const searchInput = ref<HTMLInputElement | null>(null)
const pagefindScriptSrc = `${import.meta.env.BASE_URL}pagefind/pagefind.js`
let pagefindReady = false
let latestRequestId = 0

function open() {
  isOpen.value = true
  nextTick(() => searchInput.value?.focus())
}

function close() {
  isOpen.value = false
  query.value = ''
  results.value = []
}

function toggleExact() {
  exactMode.value = !exactMode.value
  try {
    localStorage.setItem('search-exact', exactMode.value ? '1' : '0')
  } catch {}
  void handleInput()
}

async function handleInput() {
  const q = query.value.trim()
  results.value = []

  const requestId = ++latestRequestId
  if (!q) return

  if (pagefindReady && typeof window !== 'undefined') {
    const win = window as SearchWindow
    const pf = win.__pagefind
    if (!pf) return

    const pfQuery = exactMode.value ? `"${q}"` : q
    const search = await pf.debouncedSearch(pfQuery)
    if (requestId !== latestRequestId) return
    if (!search?.results) return

    const items: SearchResultItem[] = []
    for (const result of search.results) {
      const data = await result.data()
      if (requestId !== latestRequestId) return

      items.push({
        url: data.url,
        title: data.meta?.title ?? '',
        excerpt: data.excerpt ?? '',
        subResults: (data.sub_results ?? [])
          .filter((s) => s.excerpt !== data.excerpt)
          .map((s) => ({
            url: s.url,
            title: s.title?.replace(/\s*[Hh][1-6]$/g, '') ?? '',
            excerpt: s.excerpt ?? '',
          }))
          .filter((s) => s.title),
      })
    }

    if (requestId === latestRequestId) {
      results.value = items
    }
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') close()
  if (e.ctrlKey && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    if (isOpen.value) {
      close()
    } else {
      open()
    }
  }
}

onMounted(() => {
  try {
    exactMode.value = localStorage.getItem('search-exact') === '1'
  } catch {}
  document.addEventListener('keydown', handleKeydown)

  // Load pagefind at runtime via script tag (avoids Vite import analysis)
  if (typeof document !== 'undefined') {
    const script = document.createElement('script')
    script.src = pagefindScriptSrc
    script.async = true
    script.onload = () => {
      const win = window as SearchWindow
      const pf = win.pagefind
      if (pf) {
        pf.options({ excerptLength: 20, showSubResults: true })
        pf.init()
        win.__pagefind = pf
        void pf.search('')
        pagefindReady = true
      }
    }
    script.onerror = () => {
      /* pagefind not available (dev mode) */
    }
    document.head.appendChild(script)
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <!-- Trigger Button -->
  <button
    class="inline-flex items-center text-foreground cursor-pointer hover:scale-105 size-6 origin-center"
    aria-label="Search"
    title="Search (Ctrl+K)"
    @click="open"
  >
    <span class="icon-[material-symbols--manage-search] size-6" />
  </button>

  <!-- Search Modal -->
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="isOpen"
        class="fixed z-200 inset-0 bg-background/80 backdrop-blur-md dark:bg-background/90"
        @click.self="close"
      >
        <div class="absolute left-1/2 top-20 -translate-x-1/2">
          <div
            class="grid grid-rows-[auto_1fr] max-h-[80vh] w-[22rem] sm:w-[40rem] bg-background/95 dark:bg-background/95 border border-border shadow-lg dark:shadow-accent/20 overflow-hidden"
          >
            <!-- Search Bar -->
            <div
              class="grid grid-cols-[auto_1fr_auto_auto] items-center gap-2 px-4 h-12 border-b border-border"
            >
              <span class="icon-[material-symbols--manage-search] size-6 text-muted-foreground" />
              <input
                ref="searchInput"
                v-model="query"
                type="search"
                class="w-full h-8 bg-transparent outline-none text-foreground placeholder:text-muted-foreground font-normal leading-8 text-base"
                placeholder="Search"
                autocomplete="off"
                @input="handleInput"
              />
              <button
                class="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded border border-border hover:bg-accent select-none"
                :class="exactMode ? 'bg-accent text-foreground' : 'text-muted-foreground'"
                title="精确匹配"
                @click="toggleExact"
              >
                <span class="icon-[material-symbols--format-quote] size-4" />
                Exact
              </button>
              <kbd
                class="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-xs text-muted-foreground bg-muted rounded"
                >ESC</kbd
              >
            </div>

            <!-- Results -->
            <div class="overflow-y-auto no-scrollbar p-1 sm:p-2 overscroll-contain max-h-[60vh]">
              <!-- Empty State -->
              <div
                v-if="!query.trim()"
                class="py-8 flex items-center justify-center gap-2 select-none"
              >
                <span class="icon-[material-symbols--keyboard] size-5 text-muted-foreground" />
                <span class="text-muted-foreground">Type to search</span>
              </div>

              <!-- No Results -->
              <div
                v-else-if="query.trim() && results.length === 0 && !pagefindReady"
                class="py-8 flex items-center justify-center gap-2 select-none"
              >
                <span class="icon-[material-symbols--help-outline] size-5 text-muted-foreground" />
                <span class="text-muted-foreground">No results in development mode</span>
              </div>

              <!-- Results List -->
              <template v-for="item in results" :key="item.url">
                <router-link :to="item.url" class="search-results-item block" @click="close">
                  <div class="search-results-title" v-html="item.title" />
                  <div class="search-results-excerpt" v-html="item.excerpt" />
                </router-link>
                <router-link
                  v-for="sub in item.subResults"
                  :key="sub.url"
                  :to="sub.url"
                  class="search-results-item sub-result block pl-4 border-l-2 border-accent"
                  @click="close"
                >
                  <div class="search-results-title text-sm opacity-80" v-html="sub.title" />
                  <div class="search-results-excerpt text-xs" v-html="sub.excerpt" />
                </router-link>
              </template>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
