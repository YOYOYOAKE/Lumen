import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import matter from 'gray-matter'
import { parseFrontmatterDate } from '../../lib/frontmatter-date.js'
import type { ProcessedMarkdown } from '../../lib/markdown.js'
import { compareLocalizedText } from '../../lib/utils.js'
import type { ResolvedArticleBody, ResolvedArticleMeta } from '../../types/content.js'
import type { SeriesItemConfig } from '../../types/config.js'
import { ARTICLE_MODULE_PREFIX, RESOLVED_ARTICLE_MODULE_PREFIX } from './constants.js'
import { collectAllMarkdownFiles, findMdFiles, resolveEntryMeta } from './files.js'
import { parseArticleFrontmatter } from './frontmatter.js'
import { toLookupKey, toVirtualArticleId } from './helpers.js'
import { assertNoReservedSeriesDirectories, listSeriesDirectories, resolveSeriesConfig } from './series.js'
import { buildArticleSlug } from './slug.js'

export interface BuiltContentPayload {
  articles: ResolvedArticleMeta[]
  seriesMetadata: SeriesItemConfig[]
  byLookupKey: Map<string, ResolvedArticleBody>
  bodyModuleIds: Set<string>
  watchedFiles: Set<string>
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
  const slug = buildArticleSlug(frontmatter.createdAt, frontmatter.title)
  const lookupKey = toLookupKey(seriesConfig.directory, slug)

  const meta: ResolvedArticleMeta = {
    slug,
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

export async function buildContentPayload(contentDir: string): Promise<BuiltContentPayload> {
  const { processMarkdown } = await import('../../lib/markdown.js')

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

    const timeDiff =
      parseFrontmatterDate(b.frontmatter.createdAt).getTime() -
      parseFrontmatterDate(a.frontmatter.createdAt).getTime()
    if (timeDiff !== 0) return timeDiff

    const titleDiff = compareLocalizedText(a.frontmatter.title, b.frontmatter.title)
    if (titleDiff !== 0) return titleDiff

    return compareLocalizedText(a.slug, b.slug)
  })

  return {
    articles,
    seriesMetadata,
    byLookupKey,
    bodyModuleIds,
    watchedFiles,
  }
}

export function createIndexModuleSource(payload: BuiltContentPayload): string {
  const loadersSource = payload.articles
    .map((article) => {
      const lookupKey = toLookupKey(article.series, article.slug)
      return `${JSON.stringify(lookupKey)}: () => import(${JSON.stringify(toVirtualArticleId(ARTICLE_MODULE_PREFIX, lookupKey))})`
    })
    .join(',\n')

  return [
    `export const articles = ${JSON.stringify(payload.articles)};`,
    `export const seriesMetadata = ${JSON.stringify(payload.seriesMetadata)};`,
    `export const articleBodyLoaders = {${loadersSource ? `\n${loadersSource}\n` : ''}};`,
  ].join('\n')
}
