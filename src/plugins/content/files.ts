import { readdirSync } from 'node:fs'
import { join, relative } from 'node:path'
import { SERIES_FILE } from './constants.js'

/** Find all .md files in a directory recursively (excluding legacy series.md). */
export function findMdFiles(dir: string): string[] {
  try {
    const entries = readdirSync(dir, { withFileTypes: true }).sort((a, b) =>
      a.name.localeCompare(b.name, 'zh-CN', { numeric: true, sensitivity: 'base' }),
    )
    const files: string[] = []

    for (const entry of entries) {
      const fullPath = join(dir, entry.name)
      if (entry.isDirectory()) {
        files.push(...findMdFiles(fullPath))
      } else if (
        entry.isFile() &&
        entry.name.endsWith('.md') &&
        entry.name.toLowerCase() !== SERIES_FILE
      ) {
        files.push(fullPath)
      }
    }

    return files
  } catch {
    return []
  }
}

/** Find all markdown files under content/ for HMR and watch tracking. */
export function collectAllMarkdownFiles(dir: string): string[] {
  try {
    const entries = readdirSync(dir, { withFileTypes: true }).sort((a, b) =>
      a.name.localeCompare(b.name, 'zh-CN', { numeric: true, sensitivity: 'base' }),
    )
    const files: string[] = []

    for (const entry of entries) {
      const fullPath = join(dir, entry.name)
      if (entry.isDirectory()) {
        files.push(...collectAllMarkdownFiles(fullPath))
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        files.push(fullPath)
      }
    }

    return files
  } catch {
    return []
  }
}

export function resolveEntryMeta(
  filePath: string,
  seriesRoot: string,
): { subSeries: string | undefined } {
  const relPath = relative(seriesRoot, filePath)
  const segments = relPath.split(/[\\/]/).filter(Boolean)

  // Supported layouts:
  // - content/<series>/<file>.md
  // - content/<series>/<subSeries>/<file>.md
  if (segments.length > 2) {
    throw new Error(
      `Unsupported nested depth for "${filePath}". Only "<series>/<file>.md" or "<series>/<subSeries>/<file>.md" is allowed.`,
    )
  }

  const subSeries = segments.length === 2 ? segments[0] : undefined
  return { subSeries }
}
