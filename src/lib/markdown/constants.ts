import { defaultSchema } from 'rehype-sanitize'

export const SUPPORTED_CALLOUT_TYPES = new Set(['note', 'tip', 'warning', 'danger'])
export const LEGACY_CALLOUT_REPLACEMENTS: Record<string, string> = {
  important: 'warning',
  caution: 'danger',
}
export const CALLOUT_MARKER_REGEX = /^\s*>\s*\[!(?<type>\w+)](?:[+-])?/i

export const DANGER_CALLOUT_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 16h.01M12 8v4m3.312-10a2 2 0 0 1 1.414.586l4.688 4.688A2 2 0 0 1 22 8.688v6.624a2 2 0 0 1-.586 1.414l-4.688 4.688a2 2 0 0 1-1.414.586H8.688a2 2 0 0 1-1.414-.586l-4.688-4.688A2 2 0 0 1 2 15.312V8.688a2 2 0 0 1 .586-1.414l4.688-4.688A2 2 0 0 1 8.688 2z"/></svg>'

export const CODE_BLOCK_COPY_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M184,32H72A16,16,0,0,0,56,48V64H48A16,16,0,0,0,32,80V200a16,16,0,0,0,16,16H160a16,16,0,0,0,16-16v-16h8a16,16,0,0,0,16-16V48A16,16,0,0,0,184,32ZM160,200H48V80H160V200Zm24-32H176V80a16,16,0,0,0-16-16H72V48H184V168Z"/></svg>'

export const CODE_BLOCK_COPIED_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M229.66,90.34a8,8,0,0,1,0,11.32l-96,96a8,8,0,0,1-11.32,0l-48-48a8,8,0,0,1,11.32-11.32L128,180.69l90.34-90.35A8,8,0,0,1,229.66,90.34Z"/></svg>'

export const LANG_DISPLAY: Record<string, string> = {
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
  powershell: 'PowerShell',
  ps1: 'PowerShell',
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

export const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    '*': [...(defaultSchema.attributes?.['*'] ?? []), 'className', 'id', 'ariaHidden'],
  },
}
