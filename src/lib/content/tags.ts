import type { ResolvedArticleMeta } from '../../types/content.js'
import { getAllPosts } from './series.js'

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

  return getAllPosts().filter((post) =>
    (post.frontmatter.tags ?? []).some((rawTag) => normalizeTagName(rawTag) === target),
  )
}

/** Get posts filtered by safe tag slug */
export function getPostsByTagSlug(slug: string): ResolvedArticleMeta[] {
  const tagName = getTagNameBySlug(slug)
  if (!tagName) return []
  return getPostsByTag(tagName)
}
