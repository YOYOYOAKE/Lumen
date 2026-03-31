import { createHighlighter, type Highlighter } from 'shiki'

let highlighterPromise: Promise<Highlighter> | null = null

export function getHighlighter(): Promise<Highlighter> {
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
        'powershell',
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
