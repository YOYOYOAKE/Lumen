import readingTime from 'reading-time'
import { toString } from 'mdast-util-to-string'
import { visit } from 'unist-util-visit'
import type { TocHeading } from '../../types/content.js'
import { buildCodeBlockHeader, buildPlainTextCodeBlock, escapeHtml } from './code-block.js'
import { LANG_DISPLAY } from './constants.js'
import { getHighlighter } from './highlighter.js'

/** Custom remark plugin that injects reading time and word count */
export function remarkReadingTime() {
  return (tree: any, file: any) => {
    const text = toString(tree)
    const stats = readingTime(text)
    file.data.words = stats.words
    file.data.readingTime = Math.ceil(stats.minutes)
  }
}

/** Custom rehype plugin for Shiki syntax highlighting */
export function rehypeShiki() {
  return async (tree: any) => {
    const highlighter = await getHighlighter()
    const codeNodes: { node: any; parent: any }[] = []

    visit(tree, 'element', (node: any, _index: any, parent: any) => {
      if (node.tagName === 'pre') {
        const code = node.children?.[0]
        if (code?.tagName === 'code') {
          codeNodes.push({ node, parent })
        }
      }
    })

    for (const { node } of codeNodes) {
      const code = node.children[0]
      const className = code.properties?.className?.[0] ?? ''
      const langMatch = className.match(/language-(.+)/)
      const lang = langMatch?.[1] ?? 'plaintext'

      // Extract optional title from meta string (e.g. ```go title="main.go")
      const meta = code.data?.meta ?? code.properties?.metastring ?? ''
      const titleMatch = meta.match(/title="([^"]+)"/)
      const title = titleMatch?.[1] ?? ''

      // Get raw code text
      let codeText = ''
      visit(code, 'text', (textNode: any) => {
        codeText += textNode.value
      })

      try {
        const shikiHtml = highlighter.codeToHtml(codeText, {
          lang,
          themes: { dark: 'catppuccin-macchiato', light: 'catppuccin-latte' },
        })

        // Build the frame header
        const displayLang = LANG_DISPLAY[lang] ?? lang
        const headerHtml = buildCodeBlockHeader(escapeHtml(title || displayLang))

        node.type = 'raw'
        node.value = `<figure class="code-block">${headerHtml}${shikiHtml}</figure>`
        node.children = []
        node.tagName = undefined
      } catch {
        const displayLang = LANG_DISPLAY[lang] ?? lang
        node.type = 'raw'
        node.value = buildPlainTextCodeBlock(codeText, title || displayLang)
        node.children = []
        node.tagName = undefined
      }
    }
  }
}

/** Extract headings from HTML for table of contents */
export function rehypeExtractHeadings(headings: TocHeading[]) {
  return () => (tree: any) => {
    visit(tree, 'element', (node: any) => {
      const match = node.tagName?.match(/^h([1-6])$/)
      if (!match) return

      const depth = parseInt(match[1], 10)
      if (depth > 4) return

      const slug = node.properties?.id
      if (!slug) return

      let text = ''
      visit(node, 'text', (textNode: any) => {
        text += textNode.value
      })

      text = text.trim()
      if (text) {
        headings.push({ depth, slug, text })
      }
    })
  }
}
