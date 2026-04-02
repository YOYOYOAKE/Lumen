<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import mediumZoom from 'medium-zoom/dist/pure'
import '~/styles/markdown.css'

defineProps<{ html: string }>()

const rootEl = ref<HTMLElement | null>(null)
let zoom: ReturnType<typeof mediumZoom> | null = null

async function copyTextToClipboard(text: string): Promise<boolean> {
  if (typeof navigator.clipboard?.writeText !== 'function') {
    return false
  }

  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

function setCopyButtonState(button: HTMLButtonElement, title: string, state: 'copied' | null) {
  button.title = title
  button.setAttribute('aria-label', title)

  if (state) {
    button.dataset.state = state
    window.setTimeout(() => {
      if (!button.isConnected) return
      delete button.dataset.state
      button.title = 'Copy code'
      button.setAttribute('aria-label', 'Copy code')
    }, 800)
    return
  }

  delete button.dataset.state
}

async function handleMarkdownClick(event: MouseEvent) {
  const target = event.target
  if (!(target instanceof Element)) return

  const button = target.closest<HTMLButtonElement>('.code-block-copy')
  if (!button || !rootEl.value?.contains(button)) return

  const figure = button.closest('figure.code-block')
  const code = figure?.querySelector('pre code')
  const text = code?.textContent?.replace(/\n$/, '') ?? ''
  if (!text) return

  const copied = await copyTextToClipboard(text)
  if (!copied) return

  setCopyButtonState(button, 'Copied', 'copied')
}

onMounted(() => {
  zoom = mediumZoom({ background: 'rgb(0 0 0 / 0.8)' })
  zoom.attach('.markdown img:not(.no-zoom):not(a img)')
  rootEl.value?.addEventListener('click', handleMarkdownClick)
})

onUnmounted(() => {
  zoom?.detach()
  rootEl.value?.removeEventListener('click', handleMarkdownClick)
})
</script>

<template>
  <div ref="rootEl" class="markdown" v-html="html" />
</template>
