// ============================================================
// Content Access Layer — provides type-safe access to content
//
// Metadata is loaded eagerly from virtual:content and markdown
// bodies are loaded on-demand per article.
// ============================================================

import { articleBodyLoaders, articles, seriesMetadata } from 'virtual:content'
import type {
  ResolvedArticle,
  ResolvedArticleBody,
  ResolvedArticleMeta,
  SeriesInfo,
} from '~/types/content'
import type { SeriesItemConfig } from '~/types/config'
import { parseDateInput } from './utils'

const articleMetaList = articles as ResolvedArticleMeta[]
const articleMetaByLookup = new Map<string, ResolvedArticleMeta>(
  articleMetaList.map((article) => [toLookupKey(article.series, article.slug), article]),
)
const articleBodyCache = new Map<string, ResolvedArticleBody>()

function toLookupKey(series: string, slug: string): string {
  return `${series}:${slug}`
}

// ------------------------------------------------------------------
// Config helpers
// ------------------------------------------------------------------

/** Find a series config item by directory name */
export function getSeriesConfig(directory: string) {
  return (seriesMetadata as SeriesItemConfig[]).find((s) => s.directory === directory)
}

// ------------------------------------------------------------------
// Core access
// ------------------------------------------------------------------

/** Get every article metadata across all series */
export function getAllArticles(): ResolvedArticleMeta[] {
  return articleMetaList
}

/** Find article metadata by series and slug */
export function getArticleMeta(series: string, slug: string): ResolvedArticleMeta | null {
  return articleMetaByLookup.get(toLookupKey(series, slug)) ?? null
}

/** Load full article body on-demand */
export async function loadArticle(series: string, slug: string): Promise<ResolvedArticle | null> {
  const lookupKey = toLookupKey(series, slug)
  const meta = articleMetaByLookup.get(lookupKey)
  if (!meta) return null

  let body = articleBodyCache.get(lookupKey)
  if (!body) {
    const loader = articleBodyLoaders[lookupKey]
    if (!loader) return null

    const loaded = await loader()
    body = loaded.default
    articleBodyCache.set(lookupKey, body)
  }

  return {
    ...meta,
    ...body,
  }
}

/** Get article metadata belonging to a specific series */
export function getArticlesBySeries(series: string): ResolvedArticleMeta[] {
  const list = getAllArticles().filter((a) => a.series === series)
  const config = getSeriesConfig(series)
  const order = config?.order

  if (!order) return list

  const compareTitle = (a: ResolvedArticleMeta, b: ResolvedArticleMeta) =>
    a.frontmatter.title.localeCompare(b.frontmatter.title, 'zh-CN', {
      numeric: true,
      sensitivity: 'base',
    })

  const compareFilename = (a: ResolvedArticleMeta, b: ResolvedArticleMeta) =>
    a.slug.localeCompare(b.slug, 'zh-CN', {
      numeric: true,
      sensitivity: 'base',
    })

  const compareTime = (a: ResolvedArticleMeta, b: ResolvedArticleMeta) =>
    parseDateInput(a.frontmatter.createdAt).getTime() -
    parseDateInput(b.frontmatter.createdAt).getTime()

  const compareTimeAsc = (a: ResolvedArticleMeta, b: ResolvedArticleMeta) => {
    const timeDiff = compareTime(a, b)
    if (timeDiff !== 0) return timeDiff
    const titleDiff = compareTitle(a, b)
    if (titleDiff !== 0) return titleDiff
    return compareFilename(a, b)
  }

  const compareTimeDesc = (a: ResolvedArticleMeta, b: ResolvedArticleMeta) => -compareTimeAsc(a, b)

  const compareFilenameAsc = (a: ResolvedArticleMeta, b: ResolvedArticleMeta) => {
    const filenameDiff = compareFilename(a, b)
    if (filenameDiff !== 0) return filenameDiff
    const timeDiff = compareTime(a, b)
    if (timeDiff !== 0) return timeDiff
    return compareTitle(a, b)
  }

  const compareFilenameDesc = (a: ResolvedArticleMeta, b: ResolvedArticleMeta) =>
    -compareFilenameAsc(a, b)

  const compareTitleAsc = (a: ResolvedArticleMeta, b: ResolvedArticleMeta) => {
    const titleDiff = compareTitle(a, b)
    if (titleDiff !== 0) return titleDiff
    const timeDiff = compareTime(a, b)
    if (timeDiff !== 0) return timeDiff
    return compareFilename(a, b)
  }

  const compareTitleDesc = (a: ResolvedArticleMeta, b: ResolvedArticleMeta) => -compareTitleAsc(a, b)

  return [...list].sort((a, b) => {
    switch (order) {
      case 'time-asc':
        return compareTimeAsc(a, b)
      case 'time-desc':
        return compareTimeDesc(a, b)
      case 'filename-asc':
        return compareFilenameAsc(a, b)
      case 'filename-desc':
        return compareFilenameDesc(a, b)
      case 'title-asc':
        return compareTitleAsc(a, b)
      case 'title-desc':
        return compareTitleDesc(a, b)
      default:
        return 0
    }
  })
}

// ------------------------------------------------------------------
// Convenience shortcuts for well-known series
// ------------------------------------------------------------------

export function getAllPosts(): ResolvedArticleMeta[] {
  return getArticlesBySeries('posts')
}

export function getAllJottings(): ResolvedArticleMeta[] {
  return getArticlesBySeries('jottings')
}

// ------------------------------------------------------------------
// Posts helpers
// ------------------------------------------------------------------

/** Get pinned (top) posts */
export function getPinnedPosts(): ResolvedArticleMeta[] {
  return getAllPosts().filter((p) => p.frontmatter.top)
}

/** Get latest N posts by createdAt (ignores top/pinned flag) */
export function getRecentPosts(count: number): ResolvedArticleMeta[] {
  const compareTimeDesc = (a: ResolvedArticleMeta, b: ResolvedArticleMeta) =>
    parseDateInput(b.frontmatter.createdAt).getTime() -
    parseDateInput(a.frontmatter.createdAt).getTime()

  const compareFilenameDesc = (a: ResolvedArticleMeta, b: ResolvedArticleMeta) =>
    b.slug.localeCompare(a.slug, 'zh-CN', {
      numeric: true,
      sensitivity: 'base',
    })

  return [...getAllPosts()]
    .sort((a, b) => {
      const timeDiff = compareTimeDesc(a, b)
      if (timeDiff !== 0) return timeDiff
      return compareFilenameDesc(a, b)
    })
    .slice(0, count)
}

// ------------------------------------------------------------------
// Tags (scoped to posts)
// ------------------------------------------------------------------

export interface TagItem {
  name: string
  slug: string
  count: number
}

interface TagDirectory {
  items: TagItem[]
  byName: Map<string, TagItem>
  bySlug: Map<string, TagItem>
}

let cachedTagDirectory: TagDirectory | null = null

function normalizeTagName(tag: string): string {
  return tag.trim()
}

function hashText(text: string): string {
  let hash = 0x811c9dc5
  for (const char of text) {
    hash ^= char.codePointAt(0) ?? 0
    hash = Math.imul(hash, 0x01000193) >>> 0
  }
  return hash.toString(16).padStart(8, '0')
}

function createTagSlug(tag: string): string {
  const base = normalizeTagName(tag)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  if (base) return base
  return `tag-${hashText(tag)}`
}

function buildTagDirectory(): TagDirectory {
  const counts = new Map<string, number>()

  for (const post of getAllPosts()) {
    for (const rawTag of post.frontmatter.tags ?? []) {
      const tag = normalizeTagName(rawTag)
      if (!tag) continue
      counts.set(tag, (counts.get(tag) ?? 0) + 1)
    }
  }

  const items: TagItem[] = []
  const byName = new Map<string, TagItem>()
  const bySlug = new Map<string, TagItem>()

  for (const [name, count] of counts.entries()) {
    const baseSlug = createTagSlug(name)
    let slug = baseSlug

    if (bySlug.has(slug)) {
      const suffix = hashText(name).slice(0, 6)
      slug = `${baseSlug}-${suffix}`
      let serial = 2
      while (bySlug.has(slug)) {
        slug = `${baseSlug}-${suffix}-${serial}`
        serial += 1
      }
    }

    const item: TagItem = { name, slug, count }
    items.push(item)
    byName.set(name, item)
    bySlug.set(slug, item)
  }

  return { items, byName, bySlug }
}

function getTagDirectory(): TagDirectory {
  if (cachedTagDirectory) return cachedTagDirectory
  cachedTagDirectory = buildTagDirectory()
  return cachedTagDirectory
}

/** Get all unique tags with counts */
export function getAllTags(): Record<string, number> {
  const tagMap: Record<string, number> = {}
  for (const item of getTagDirectory().items) {
    tagMap[item.name] = item.count
  }
  return tagMap
}

/** Get tag list with stable and safe URL slugs */
export function getAllTagItems(): TagItem[] {
  return [...getTagDirectory().items]
}

/** Resolve safe slug for a tag name */
export function getTagSlug(tag: string): string {
  const normalizedTag = normalizeTagName(tag)
  const item = getTagDirectory().byName.get(normalizedTag)
  if (item) return item.slug
  return createTagSlug(normalizedTag)
}

/** Resolve original tag name by slug */
export function getTagNameBySlug(slug: string): string | null {
  return getTagDirectory().bySlug.get(slug)?.name ?? null
}

/** Get posts filtered by tag */
export function getPostsByTag(tag: string): ResolvedArticleMeta[] {
  const target = normalizeTagName(tag)
  if (!target) return []

  return getAllPosts().filter((p) =>
    (p.frontmatter.tags ?? []).some((rawTag) => normalizeTagName(rawTag) === target),
  )
}

/** Get posts filtered by safe tag slug */
export function getPostsByTagSlug(slug: string): ResolvedArticleMeta[] {
  const tagName = getTagNameBySlug(slug)
  if (!tagName) return []
  return getPostsByTag(tagName)
}

// ------------------------------------------------------------------
// Series list for the /series index page
// ------------------------------------------------------------------

/** Build the list of visible series for the /series index page */
export function getSeriesList(): SeriesInfo[] {
  return (seriesMetadata as SeriesItemConfig[])
    .filter((cfg) => cfg.seriesVisible)
    .map((cfg) => ({
      id: cfg.directory,
      name: cfg.title,
      description: cfg.description,
      icon: cfg.icon,
      articleCount: getArticlesBySeries(cfg.directory).length,
    }))
}

// ------------------------------------------------------------------
// Navigation helpers
// ------------------------------------------------------------------

/** Get previous and next article relative to current */
export function getAdjacentArticles<T extends { slug: string }>(
  list: T[],
  currentSlug: string,
): { prev: T | null; next: T | null; index: number } {
  const index = list.findIndex((a) => a.slug === currentSlug)
  return {
    prev: index > 0 ? list[index - 1] : null,
    next: index >= 0 && index < list.length - 1 ? list[index + 1] : null,
    index,
  }
}
