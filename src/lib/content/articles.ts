import type { ResolvedArticle, ResolvedArticleMeta } from '../../types/content.js'
import { articleBodyCache, articleBodyLoaderMap, articleMetaByLookup, articleMetaList, toLookupKey } from './store.js'

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
    const loader = articleBodyLoaderMap[lookupKey]
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
