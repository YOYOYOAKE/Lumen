import type { RouteLocationRaw } from 'vue-router'
import type { ResolvedArticleMeta } from '../../types/content.js'
import {
  compareArticleByDateDesc,
  compareArticleByTitleAsc,
  comparePostByPinnedDateDesc,
  compareSeriesByTitleAsc,
  compareTagByNameAsc,
} from './sorting.js'
import { getSeriesConfig, getAllPosts, getArticlesBySeries, getSeriesList } from './series.js'
import { getAllTagItems, getPostsByTagSlug, getTagNameBySlug } from './tags.js'

function normalizeTagContext(tagSlug: string | null | undefined): string | null {
  if (typeof tagSlug !== 'string') return null
  const trimmed = tagSlug.trim()
  return trimmed ? trimmed : null
}

export function buildArticleRoute(
  baseUrl: string,
  slug: string,
  tagSlug?: string | null,
): RouteLocationRaw {
  const path = `${baseUrl.replace(/\/$/, '')}/${slug}`
  const normalizedTagSlug = normalizeTagContext(tagSlug)

  if (!normalizedTagSlug) return path
  return {
    path,
    query: { tag: normalizedTagSlug },
  }
}

export function resolveSeriesPagePosts(series: string): ResolvedArticleMeta[] {
  const list = getArticlesBySeries(series)

  if (series === 'posts') {
    return [...list].sort(comparePostByPinnedDateDesc)
  }

  const order = getSeriesConfig(series)?.order ?? 'time-desc'
  return [...list].sort(order === 'title-asc' ? compareArticleByTitleAsc : compareArticleByDateDesc)
}

export function resolveTagPagePosts(tagSlug: string): ResolvedArticleMeta[] {
  return [...getPostsByTagSlug(tagSlug)].sort(compareArticleByDateDesc)
}

export function resolveRecentPosts(count: number): ResolvedArticleMeta[] {
  return [...getAllPosts()].sort(compareArticleByDateDesc).slice(0, count)
}

export function resolveSortedTags() {
  return [...getAllTagItems()].sort(compareTagByNameAsc)
}

export function resolveSortedSeriesList() {
  return [...getSeriesList()].sort(compareSeriesByTitleAsc)
}

export function isArticleInTagContext(article: ResolvedArticleMeta | null, tagSlug: string): boolean {
  if (!article || article.series !== 'posts') return false

  const tagName = getTagNameBySlug(tagSlug)
  if (!tagName) return false

  return (article.frontmatter.tags ?? []).some((tag) => tag.trim() === tagName)
}

export function resolveArticleSidebarContextList(
  series: string,
  currentArticle: ResolvedArticleMeta | null,
  requestedTagSlug?: string | null,
) {
  const normalizedTagSlug = normalizeTagContext(requestedTagSlug)

  if (normalizedTagSlug && isArticleInTagContext(currentArticle, normalizedTagSlug)) {
    return {
      articles: resolveTagPagePosts(normalizedTagSlug),
      tagSlug: normalizedTagSlug,
    }
  }

  return {
    articles: resolveSeriesPagePosts(series),
    tagSlug: null,
  }
}
