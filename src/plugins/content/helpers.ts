import { realpathSync } from 'node:fs'
import { normalize } from 'node:path'

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function toPosixPath(value: string): string {
  return value.replaceAll('\\', '/')
}

export function normalizePath(value: string): string {
  return toPosixPath(normalize(value))
}

export function resolvePathVariants(value: string): Set<string> {
  const variants = new Set<string>([normalizePath(value)])
  try {
    variants.add(normalizePath(realpathSync(value)))
  } catch {
    // Ignore paths that no longer exist in watch callbacks.
  }
  return variants
}

export function toLookupKey(series: string, slug: string): string {
  return `${series}:${slug}`
}

export function toVirtualArticleId(articleModulePrefix: string, lookupKey: string): string {
  return `${articleModulePrefix}${encodeURIComponent(lookupKey)}`
}

export function isContentRelatedFile(file: string, contentDirCandidates: Set<string>): boolean {
  const fileVariants = resolvePathVariants(file)

  for (const baseDir of contentDirCandidates) {
    for (const filePath of fileVariants) {
      if (filePath === baseDir || filePath.startsWith(`${baseDir}/`)) {
        return true
      }
    }
  }

  return false
}

export function isSeriesConfigFile(file: string, configFileCandidates: Set<string>): boolean {
  const fileVariants = resolvePathVariants(file)
  for (const filePath of fileVariants) {
    if (configFileCandidates.has(filePath)) {
      return true
    }
  }
  return false
}

export function isMarkdownFile(file: string): boolean {
  return file.toLowerCase().endsWith('.md')
}
