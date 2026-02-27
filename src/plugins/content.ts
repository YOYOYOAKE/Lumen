// ============================================================
// Vite Virtual Module Plugin — content processing at build time
// Reads markdown files from content/, processes them through
// the unified pipeline, and exposes them as virtual:content
//
// Series config comes from src/config/series.ts.
// ============================================================

import type { HmrContext, Plugin } from 'vite'
import { existsSync, readFileSync, readdirSync, realpathSync, statSync } from 'node:fs'
import { join, normalize, relative } from 'node:path'
import matter from 'gray-matter'
import { canonicalizeFrontmatterDateTime, parseFrontmatterDateTime } from '../lib/frontmatter-date.js'
import type { ProcessedMarkdown } from '../lib/markdown.js'
import type { ResolvedArticleBody, ResolvedArticleMeta } from '../types/content.js'
import { seriesConfig } from '../config/series.js'
import type { SeriesConfigItem, SeriesItemConfig, SeriesOrder } from '../types/config.js'

const VIRTUAL_MODULE_ID = 'virtual:content'
const RESOLVED_ID = '\0' + VIRTUAL_MODULE_ID
const ARTICLE_MODULE_PREFIX = 'virtual:content/article/'
const RESOLVED_ARTICLE_MODULE_PREFIX = '\0' + ARTICLE_MODULE_PREFIX
const CONTENT_DIR = join(process.cwd(), 'content')
const SERIES_CONFIG_PATH = join(process.cwd(), 'src', 'config', 'series.ts')
const SERIES_FILE = 'series.md'
const SERIES_ORDERS: Set<SeriesOrder> = new Set([
  'time-asc',
  'time-desc',
  'filename-asc',
  'filename-desc',
  'title-asc',
  'title-desc',
])
const SERIES_ITEM_KEYS = new Set([
  'directory',
  'title',
  'description',
  'icon',
  'order',
  'seriesVisible',
])
const RESERVED_SERIES_DIRS = new Set(['series', 'tags', 'friends', '404'])
const ARTICLE_FRONTMATTER_KEYS = new Set([
  'slug',
  'title',
  'description',
  'createdAt',
  'updatedAt',
  'completed',
  'top',
  'tags',
])

interface ParsedArticleFrontmatter {
  slug: string
  title: string
  description: string
  createdAt: string
  updatedAt?: string
  completed: boolean
  top: boolean
  tags: string[]
}

interface BuiltContentPayload {
  articles: ResolvedArticleMeta[]
  seriesMetadata: SeriesItemConfig[]
  byLookupKey: Map<string, ResolvedArticleBody>
  bodyModuleIds: Set<string>
  watchedFiles: Set<string>
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function toPosixPath(value: string): string {
  return value.replaceAll('\\', '/')
}

function normalizePath(value: string): string {
  return toPosixPath(normalize(value))
}

function resolvePathVariants(value: string): Set<string> {
  const variants = new Set<string>([normalizePath(value)])
  try {
    variants.add(normalizePath(realpathSync(value)))
  } catch {
    // Ignore paths that no longer exist in watch callbacks.
  }
  return variants
}

function toLookupKey(series: string, slug: string): string {
  return `${series}:${slug}`
}

function toVirtualArticleId(lookupKey: string): string {
  return `${ARTICLE_MODULE_PREFIX}${encodeURIComponent(lookupKey)}`
}

function assertFrontmatterDateTime(
  input: unknown,
  filePath: string,
  field: 'createdAt' | 'updatedAt',
): string | undefined {
  if (input === undefined || input === null) return undefined

  if (typeof input !== 'string') {
    throw new Error(
      `Invalid frontmatter "${field}" in ${filePath}: expected a quoted datetime string like "2026-02-15 12:00"`,
    )
  }

  try {
    return canonicalizeFrontmatterDateTime(input.trim())
  } catch {
    throw new Error(
      `Invalid frontmatter "${field}" in ${filePath}: expected "YYYY-MM-DD HH:mm"`,
    )
  }
}

function listSeriesDirectories(root: string): string[] {
  try {
    return readdirSync(root, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
      .map((entry) => entry.name)
      .sort((a, b) => a.localeCompare(b, 'zh-CN', { numeric: true, sensitivity: 'base' }))
  } catch {
    return []
  }
}

function assertNoReservedSeriesDirectories(seriesDirs: string[], contentDir: string) {
  const conflicts = seriesDirs.filter((name) => RESERVED_SERIES_DIRS.has(name))
  if (conflicts.length === 0) return

  const detail = conflicts.map((name) => `"${name}" (${join(contentDir, name)})`).join(', ')

  throw new Error(
    `Reserved series directory name detected: ${detail}. Rename the series directory to avoid route conflicts.`,
  )
}

function parseSeriesConfigItem(
  input: unknown,
  index: number,
  knownSeriesDirs: Set<string>,
): SeriesConfigItem {
  const label = `${SERIES_CONFIG_PATH} -> seriesConfig[${index}]`
  if (!isRecord(input)) {
    throw new Error(`Invalid series item in ${label}: expected an object`)
  }

  const unknown = Object.keys(input).filter((k) => !SERIES_ITEM_KEYS.has(k))
  if (unknown.length > 0) {
    throw new Error(`Unknown series keys in ${label}: ${unknown.join(', ')}`)
  }

  const directory = input.directory
  const title = input.title
  const description = input.description
  const icon = input.icon
  const order = input.order
  const seriesVisible = input.seriesVisible

  if (typeof directory !== 'string' || directory.trim() === '') {
    throw new Error(`Invalid "directory" in ${label}`)
  }
  if (directory.includes('/') || directory.includes('\\')) {
    throw new Error(`Invalid "directory" in ${label}: nested path is not allowed`)
  }
  if (!knownSeriesDirs.has(directory)) {
    throw new Error(`Unknown series directory "${directory}" in ${label}`)
  }
  if (typeof title !== 'string' || title.trim() === '') {
    throw new Error(`Invalid "title" in ${label}`)
  }
  if (typeof description !== 'string' || description.trim() === '') {
    throw new Error(`Invalid "description" in ${label}`)
  }
  if (icon !== undefined && typeof icon !== 'string') {
    throw new Error(`Invalid "icon" in ${label}`)
  }
  if (
    order !== undefined &&
    (typeof order !== 'string' || !SERIES_ORDERS.has(order as SeriesOrder))
  ) {
    throw new Error(`Invalid "order" in ${label}`)
  }
  if (typeof seriesVisible !== 'boolean') {
    throw new Error(`Invalid "seriesVisible" in ${label}`)
  }

  const metadata: SeriesConfigItem = {
    directory,
    title,
    description,
    seriesVisible,
  }
  if (icon !== undefined) metadata.icon = icon
  if (order !== undefined) metadata.order = order as SeriesOrder

  return metadata
}

function resolveSeriesConfig(seriesDirs: string[]): SeriesConfigItem[] {
  const knownSeriesDirs = new Set(seriesDirs)
  const parsed = seriesConfig.map((item, index) => parseSeriesConfigItem(item, index, knownSeriesDirs))

  const seen = new Set<string>()
  for (const item of parsed) {
    if (seen.has(item.directory)) {
      throw new Error(`Duplicate series directory "${item.directory}" in ${SERIES_CONFIG_PATH}`)
    }
    seen.add(item.directory)
  }

  const missing = seriesDirs.filter((dir) => !seen.has(dir))
  if (missing.length > 0) {
    throw new Error(
      `Missing series config entries in ${SERIES_CONFIG_PATH}: ${missing.join(', ')}`,
    )
  }

  return parsed
}

/** Find all .md files in a directory recursively (excluding legacy series.md). */
function findMdFiles(dir: string): string[] {
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
function collectAllMarkdownFiles(dir: string): string[] {
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

function resolveEntryMeta(
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

function parseArticleFrontmatter(
  input: unknown,
  filePath: string,
): ParsedArticleFrontmatter | null {
  if (!isRecord(input)) {
    throw new Error(`Invalid frontmatter in ${filePath}`)
  }

  const unknown = Object.keys(input).filter((k) => !ARTICLE_FRONTMATTER_KEYS.has(k))
  if (unknown.length > 0) {
    throw new Error(`Unknown article frontmatter keys in ${filePath}: ${unknown.join(', ')}`)
  }

  const slugInput = input.slug
  if (typeof slugInput !== 'string' || slugInput.trim() === '') {
    throw new Error(`Invalid or missing frontmatter "slug" in ${filePath}`)
  }
  const slug = slugInput.trim()
  if (slug.includes('/') || slug.includes('\\')) {
    throw new Error(`Invalid frontmatter "slug" in ${filePath}: "/" is not allowed`)
  }

  const title = input.title
  if (typeof title !== 'string' || title.trim() === '') {
    throw new Error(`Invalid or missing frontmatter "title" in ${filePath}`)
  }

  const description = input.description
  if (typeof description !== 'string' || description.trim() === '') {
    throw new Error(`Invalid or missing frontmatter "description" in ${filePath}`)
  }

  const createdAt = assertFrontmatterDateTime(input.createdAt, filePath, 'createdAt')
  if (!createdAt) {
    throw new Error(`Invalid or missing frontmatter "createdAt" in ${filePath}`)
  }

  const updatedAtValue = input.updatedAt
  let updatedAt: string | undefined
  if (updatedAtValue !== undefined) {
    updatedAt = assertFrontmatterDateTime(updatedAtValue, filePath, 'updatedAt')
    if (!updatedAt) {
      throw new Error(`Invalid frontmatter "updatedAt" in ${filePath}`)
    }
  }

  const completedValue = input.completed
  let completed = true
  if (completedValue !== undefined) {
    if (typeof completedValue !== 'boolean') {
      throw new Error(`Invalid frontmatter "completed" in ${filePath}: expected a boolean`)
    }
    completed = completedValue
  }
  if (!completed) return null

  const topValue = input.top
  let top = false
  if (topValue !== undefined) {
    if (typeof topValue !== 'boolean') {
      throw new Error(`Invalid frontmatter "top" in ${filePath}: expected a boolean`)
    }
    top = topValue
  }

  const tagsValue = input.tags
  let tags: string[] = []
  if (tagsValue !== undefined) {
    if (!Array.isArray(tagsValue)) {
      throw new Error(`Invalid frontmatter "tags" in ${filePath}: expected an array`)
    }
    tags = tagsValue.map((tag, index) => {
      if (typeof tag !== 'string' || tag.trim() === '') {
        throw new Error(
          `Invalid frontmatter "tags[${index}]" in ${filePath}: expected a non-empty string`,
        )
      }
      return tag
    })
  }

  return {
    slug,
    title,
    description,
    createdAt,
    updatedAt,
    completed,
    top,
    tags,
  }
}

async function processEntry(
  filePath: string,
  seriesConfig: SeriesItemConfig,
  subSeries: string | undefined,
  processMarkdown: (md: string, source?: string) => Promise<ProcessedMarkdown>,
) {
  const raw = readFileSync(filePath, 'utf-8')
  const { data, content } = matter(raw)
  const frontmatter = parseArticleFrontmatter(data, filePath)
  if (!frontmatter) return null

  const result = await processMarkdown(content, filePath)
  const lookupKey = toLookupKey(seriesConfig.directory, frontmatter.slug)

  const meta: ResolvedArticleMeta = {
    slug: frontmatter.slug,
    subSeries,
    series: seriesConfig.directory,
    frontmatter: {
      ...frontmatter,
      words: result.words,
      readingTime: result.readingTime,
    },
  }

  const body: ResolvedArticleBody = {
    html: result.html,
    headings: result.headings,
  }

  return {
    lookupKey,
    meta,
    body,
    moduleId: `${RESOLVED_ARTICLE_MODULE_PREFIX}${encodeURIComponent(lookupKey)}`,
  }
}

async function buildContentPayload(contentDir: string): Promise<BuiltContentPayload> {
  const { processMarkdown } = await import('../lib/markdown.js')

  const articles: ResolvedArticleMeta[] = []
  const byLookupKey = new Map<string, ResolvedArticleBody>()
  const bodyModuleIds = new Set<string>()
  const seriesMetadata: SeriesItemConfig[] = []
  const seenSlugs = new Map<string, string>()
  const watchedFiles = new Set<string>()

  for (const markdownFile of collectAllMarkdownFiles(contentDir)) {
    watchedFiles.add(markdownFile)
  }

  const seriesDirs = listSeriesDirectories(contentDir)
  assertNoReservedSeriesDirectories(seriesDirs, contentDir)
  const parsedSeriesConfig = resolveSeriesConfig(seriesDirs)

  for (const staticConfig of parsedSeriesConfig) {
    const seriesDir = staticConfig.directory
    const discoveredSubSeries = new Set<string>()
    const resolvedConfig: SeriesItemConfig = { ...staticConfig }

    const dirPath = join(contentDir, seriesDir)
    const files = findMdFiles(dirPath)

    for (const file of files) {
      const { subSeries } = resolveEntryMeta(file, dirPath)
      if (subSeries) {
        discoveredSubSeries.add(subSeries)
      }

      const article = await processEntry(file, resolvedConfig, subSeries, processMarkdown)
      if (!article) continue

      const key = `${seriesDir}:${article.meta.slug}`
      const existing = seenSlugs.get(key)
      if (existing) {
        throw new Error(
          `Duplicate article slug "${article.meta.slug}" in series "${seriesDir}":\n- ${existing}\n- ${file}`,
        )
      }
      seenSlugs.set(key, file)

      articles.push(article.meta)
      byLookupKey.set(article.lookupKey, article.body)
      bodyModuleIds.add(article.moduleId)
    }

    if (discoveredSubSeries.size > 0) {
      resolvedConfig.subSeries = Array.from(discoveredSubSeries)
        .sort((a, b) => a.localeCompare(b, 'zh-CN', { numeric: true, sensitivity: 'base' }))
        .map((directory) => ({
          directory,
          title: directory,
        }))
    }

    seriesMetadata.push(resolvedConfig)
  }

  // Sort: pinned first, then by createdAt descending.
  articles.sort((a, b) => {
    const topDiff = Number(Boolean(b.frontmatter.top)) - Number(Boolean(a.frontmatter.top))
    if (topDiff !== 0) return topDiff
    return (
      parseFrontmatterDateTime(b.frontmatter.createdAt).getTime() -
      parseFrontmatterDateTime(a.frontmatter.createdAt).getTime()
    )
  })

  return {
    articles,
    seriesMetadata,
    byLookupKey,
    bodyModuleIds,
    watchedFiles,
  }
}

function createIndexModuleSource(payload: BuiltContentPayload): string {
  const loadersSource = payload.articles
    .map((article) => {
      const lookupKey = toLookupKey(article.series, article.slug)
      return `${JSON.stringify(lookupKey)}: () => import(${JSON.stringify(toVirtualArticleId(lookupKey))})`
    })
    .join(',\n')

  return [
    `export const articles = ${JSON.stringify(payload.articles)};`,
    `export const seriesMetadata = ${JSON.stringify(payload.seriesMetadata)};`,
    `export const articleBodyLoaders = {${loadersSource ? `\n${loadersSource}\n` : ''}};`,
  ].join('\n')
}

function isContentRelatedFile(file: string, contentDirCandidates: Set<string>): boolean {
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

function isSeriesConfigFile(file: string, configFileCandidates: Set<string>): boolean {
  const fileVariants = resolvePathVariants(file)
  for (const filePath of fileVariants) {
    if (configFileCandidates.has(filePath)) {
      return true
    }
  }
  return false
}

function isMarkdownFile(file: string): boolean {
  return file.toLowerCase().endsWith('.md')
}

function invalidateContentModules(context: HmrContext, moduleIds: Set<string>) {
  const { moduleGraph } = context.server

  const indexModule = moduleGraph.getModuleById(RESOLVED_ID)
  if (indexModule) {
    moduleGraph.invalidateModule(indexModule)
  }

  for (const moduleId of moduleIds) {
    const mod = moduleGraph.getModuleById(moduleId)
    if (mod) {
      moduleGraph.invalidateModule(mod)
    }
  }
}

export function contentPlugin(): Plugin {
  const contentDir = CONTENT_DIR
  const seriesConfigPath = SERIES_CONFIG_PATH
  const contentDirCandidates = resolvePathVariants(contentDir)
  const seriesConfigCandidates = resolvePathVariants(seriesConfigPath)
  let cachedPayload: BuiltContentPayload | null = null

  const ensurePayload = async () => {
    if (!cachedPayload) {
      cachedPayload = await buildContentPayload(contentDir)
    }
    return cachedPayload
  }

  const invalidateCache = () => {
    cachedPayload = null
  }

  return {
    name: 'lumen-content',
    buildStart() {
      console.info(`[lumen-content] content directory: ${contentDir}`)
      if (!existsSync(contentDir)) {
        throw new Error(`Content directory does not exist: ${contentDir}`)
      }
      if (!statSync(contentDir).isDirectory()) {
        throw new Error(`Content path is not a directory: ${contentDir}`)
      }
      invalidateCache()
    },
    resolveId(id) {
      if (id === VIRTUAL_MODULE_ID) return RESOLVED_ID
      if (id.startsWith(ARTICLE_MODULE_PREFIX)) return `\0${id}`
    },
    async load(id) {
      if (id === RESOLVED_ID) {
        const payload = await ensurePayload()
        this.addWatchFile(seriesConfigPath)
        for (const watchedFile of payload.watchedFiles) {
          this.addWatchFile(watchedFile)
        }
        return createIndexModuleSource(payload)
      }

      if (!id.startsWith(RESOLVED_ARTICLE_MODULE_PREFIX)) return

      const payload = await ensurePayload()
      const encodedKey = id.slice(RESOLVED_ARTICLE_MODULE_PREFIX.length)
      const lookupKey = decodeURIComponent(encodedKey)
      const body = payload.byLookupKey.get(lookupKey)

      if (!body) {
        throw new Error(`Unable to resolve article body for key "${lookupKey}"`)
      }

      return `export default ${JSON.stringify(body)};`
    },
    watchChange(id) {
      if (isSeriesConfigFile(id, seriesConfigCandidates)) {
        invalidateCache()
        return
      }
      if (!isContentRelatedFile(id, contentDirCandidates)) return
      if (!isMarkdownFile(id)) return
      invalidateCache()
    },
    handleHotUpdate(context) {
      if (isSeriesConfigFile(context.file, seriesConfigCandidates)) {
        invalidateContentModules(context, cachedPayload?.bodyModuleIds ?? new Set())
        invalidateCache()
        context.server.ws.send({ type: 'full-reload' })
        return []
      }
      if (!isContentRelatedFile(context.file, contentDirCandidates)) return
      if (!isMarkdownFile(context.file)) return

      invalidateContentModules(context, cachedPayload?.bodyModuleIds ?? new Set())
      invalidateCache()
      context.server.ws.send({ type: 'full-reload' })

      return []
    },
  }
}
