import { articleBodyLoaders, articles, seriesMetadata } from 'virtual:content'
import type { ResolvedArticleBody, ResolvedArticleMeta } from '../../types/content.js'
import type { SeriesItemConfig } from '../../types/config.js'

export const articleMetaList = articles as ResolvedArticleMeta[]
export const seriesMetadataList = seriesMetadata as SeriesItemConfig[]
export const articleMetaByLookup = new Map<string, ResolvedArticleMeta>(
  articleMetaList.map((article) => [toLookupKey(article.series, article.slug), article]),
)
export const articleBodyCache = new Map<string, ResolvedArticleBody>()
export const articleBodyLoaderMap = articleBodyLoaders as Record<
  string,
  () => Promise<{ default: ResolvedArticleBody }>
>

export function toLookupKey(series: string, slug: string): string {
  return `${series}:${slug}`
}
