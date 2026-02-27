// ============================================================
// Markdown Processing Pipeline
// Configures unified/remark/rehype to process markdown content
// ============================================================

import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkSmartypants from 'remark-smartypants'
import remarkDirective from 'remark-directive'
import remarkDirectiveSugar from 'remark-directive-sugar'
import remarkMath from 'remark-math'
import remarkRehype from 'remark-rehype'
import rehypeSlug from 'rehype-slug'
import rehypeUnwrapImages from 'rehype-unwrap-images'
import rehypeCallouts from 'rehype-callouts'
import rehypeExternalLinks from 'rehype-external-links'
import rehypeKatex from 'rehype-katex'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
import rehypeStringify from 'rehype-stringify'
import { createHighlighter, type Highlighter } from 'shiki'
import { visit } from 'unist-util-visit'
import readingTime from 'reading-time'
import { toString } from 'mdast-util-to-string'
import type { TocHeading } from '~/types/content'

let highlighterPromise: Promise<Highlighter> | null = null
const SUPPORTED_CALLOUT_TYPES = new Set(['note', 'tip', 'warning', 'danger'])
const LEGACY_CALLOUT_REPLACEMENTS: Record<string, string> = {
  important: 'warning',
  caution: 'danger',
}
const CALLOUT_MARKER_REGEX = /^\s*>\s*\[!(?<type>\w+)](?:[+-])?/i
const DANGER_CALLOUT_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 16h.01M12 8v4m3.312-10a2 2 0 0 1 1.414.586l4.688 4.688A2 2 0 0 1 22 8.688v6.624a2 2 0 0 1-.586 1.414l-4.688 4.688a2 2 0 0 1-1.414.586H8.688a2 2 0 0 1-1.414-.586l-4.688-4.688A2 2 0 0 1 2 15.312V8.688a2 2 0 0 1 .586-1.414l4.688-4.688A2 2 0 0 1 8.688 2z"/></svg>'

const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    '*': [...(defaultSchema.attributes?.['*'] ?? []), 'className', 'id', 'ariaHidden'],
  },
}

function escapeHtml(input: string): string {
  return input
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function assertSupportedCallouts(content: string, source: string): void {
  const lines = content.split(/\r?\n/)
  for (const [index, line] of lines.entries()) {
    const match = line.match(CALLOUT_MARKER_REGEX)
    if (!match?.groups?.type) continue

    const calloutType = match.groups.type.toLowerCase()
    if (SUPPORTED_CALLOUT_TYPES.has(calloutType)) continue

    const replacement = LEGACY_CALLOUT_REPLACEMENTS[calloutType]
    const hint = replacement ? ` Use "[!${replacement}]" instead.` : ''
    throw new Error(
      `Unsupported callout type "[!${calloutType}]" in ${source}:${index + 1}. Supported types: note, tip, warning, danger.${hint}`,
    )
  }
}

function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ['catppuccin-macchiato', 'catppuccin-latte'],
      langs: [
        'javascript',
        'typescript',
        'vue',
        'html',
        'css',
        'json',
        'yaml',
        'markdown',
        'bash',
        'shell',
        'python',
        'go',
        'sql',
        'dockerfile',
        'toml',
        'ini',
        'diff',
        'plaintext',
        'tsx',
        'jsx',
        'rust',
        'java',
        'c',
        'cpp',
      ],
    })
  }
  return highlighterPromise
}

/** Custom remark plugin that injects reading time and word count */
function remarkReadingTime() {
  return (tree: any, file: any) => {
    const text = toString(tree)
    const stats = readingTime(text)
    file.data.words = stats.words
    file.data.readingTime = Math.ceil(stats.minutes)
  }
}

/** Language display names */
const LANG_DISPLAY: Record<string, string> = {
  js: 'JavaScript',
  javascript: 'JavaScript',
  ts: 'TypeScript',
  typescript: 'TypeScript',
  tsx: 'TSX',
  jsx: 'JSX',
  vue: 'Vue',
  html: 'HTML',
  css: 'CSS',
  json: 'JSON',
  yaml: 'YAML',
  toml: 'TOML',
  ini: 'INI',
  md: 'Markdown',
  markdown: 'Markdown',
  bash: 'Bash',
  shell: 'Shell',
  sh: 'Shell',
  python: 'Python',
  py: 'Python',
  go: 'Go',
  rust: 'Rust',
  java: 'Java',
  c: 'C',
  cpp: 'C++',
  sql: 'SQL',
  dockerfile: 'Dockerfile',
  diff: 'Diff',
  plaintext: 'Text',
  text: 'Text',
}

/** Custom rehype plugin for Shiki syntax highlighting */
function rehypeShiki() {
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
        const headerLabel = escapeHtml(title || displayLang)
        const headerHtml = `<div class="code-block-header"><span class="code-block-lang">${headerLabel}</span></div>`

        node.type = 'raw'
        node.value = `<figure class="code-block">${headerHtml}${shikiHtml}</figure>`
        node.children = []
        node.tagName = undefined
      } catch {
        // If language not supported, leave as-is
      }
    }
  }
}

/** Extract headings from HTML for table of contents */
function rehypeExtractHeadings(headings: TocHeading[]) {
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

      // Clean up heading text (remove trailing h1/h2/etc markers)
      text = text.replace(/\s*[Hh][1-6]$/g, '').trim()
      if (text) {
        headings.push({ depth, slug, text })
      }
    })
  }
}

/** Add auto-number prefix to headings based on relative depth */
function rehypeNumberHeadings() {
  return (tree: any) => {
    const headingNodes: Array<{ node: any; depth: number }> = []

    visit(tree, 'element', (node: any) => {
      const match = node.tagName?.match(/^h([1-6])$/)
      if (!match) return
      if (node.properties?.id === 'footnote-label') return
      headingNodes.push({ node, depth: parseInt(match[1], 10) })
    })

    if (headingNodes.length === 0) return

    const uniqueDepths = Array.from(new Set(headingNodes.map((item) => item.depth))).sort(
      (a, b) => a - b,
    )
    const depthToLevel = new Map<number, number>(
      uniqueDepths.map((depth, index) => [depth, index + 1]),
    )
    const counters = new Array(uniqueDepths.length).fill(0)

    for (const { node, depth } of headingNodes) {
      const level = depthToLevel.get(depth)
      if (!level) continue

      counters[level - 1] += 1
      for (let i = level; i < counters.length; i += 1) {
        counters[i] = 0
      }

      const order = counters.slice(0, level).join('.')
      const children = Array.isArray(node.children) ? node.children : []

      node.children = [
        {
          type: 'element',
          tagName: 'span',
          properties: {
            className: ['heading-order'],
            ariaHidden: 'true',
          },
          children: [{ type: 'text', value: order }],
        },
        ...children,
      ]
    }
  }
}

export interface ProcessedMarkdown {
  html: string
  headings: TocHeading[]
  words: number
  readingTime: number
}

/** Process a markdown string and return rendered HTML + metadata */
export async function processMarkdown(
  content: string,
  source = 'markdown',
): Promise<ProcessedMarkdown> {
  assertSupportedCallouts(content, source)
  const headings: TocHeading[] = []

  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkSmartypants)
    .use(remarkDirective)
    .use(remarkDirectiveSugar, {
      badge: { presets: { n: { text: 'NEW' } } },
      link: {
        faviconSourceUrl: 'https://www.google.com/s2/favicons?domain={domain}&sz=128',
        imgProps: () => ({ 'aria-hidden': 'true' }),
      },
      image: { stripParagraph: false },
      video: {
        platforms: {
          bilibili: 'https://player.bilibili.com/player.html?bvid={id}&autoplay=0',
        },
      },
    })
    .use(remarkMath)
    .use(remarkReadingTime)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeSanitize, sanitizeSchema)
    .use(rehypeSlug)
    .use(rehypeUnwrapImages)
    .use(rehypeCallouts, {
      theme: 'vitepress',
      callouts: {
        danger: {
          title: 'DANGER',
          indicator: DANGER_CALLOUT_ICON,
        },
      },
    })
    .use(rehypeExternalLinks, {
      target: '_blank',
      rel: ['noopener', 'noreferrer'],
    })
    .use(rehypeKatex)
    .use(rehypeShiki)
    .use(rehypeExtractHeadings(headings))
    .use(rehypeNumberHeadings)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(content)

  return {
    html: String(file),
    headings,
    words: (file.data as any).words ?? 0,
    readingTime: (file.data as any).readingTime ?? 0,
  }
}
