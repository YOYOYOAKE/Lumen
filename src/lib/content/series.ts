import type { ResolvedArticleMeta, SeriesInfo } from '../../types/content.js'
import type { SeriesItemConfig } from '../../types/config.js'
import { articleMetaList, seriesMetadataList } from './store.js'

/** Find a series config item by directory name */
export function getSeriesConfig(directory: string) {
  return seriesMetadataList.find((series) => series.directory === directory)
}

/** Get article metadata belonging to a specific series */
export function getArticlesBySeries(series: string): ResolvedArticleMeta[] {
  return articleMetaList.filter((article) => article.series === series)
}

/** Get all posts in the posts series */
export function getAllPosts(): ResolvedArticleMeta[] {
  return getArticlesBySeries('posts')
}

/** Get all jottings in the jottings series */
export function getAllJottings(): ResolvedArticleMeta[] {
  return getArticlesBySeries('jottings')
}

/** Get pinned (top) posts */
export function getPinnedPosts(): ResolvedArticleMeta[] {
  return getAllPosts().filter((post) => post.frontmatter.top)
}

/** Build the list of visible series for the /series index page */
export function getSeriesList(): SeriesInfo[] {
  return (seriesMetadataList as SeriesItemConfig[])
    .filter((cfg) => cfg.seriesVisible)
    .map((cfg) => ({
      id: cfg.directory,
      name: cfg.title,
      description: cfg.description,
      icon: cfg.icon,
      articleCount: getArticlesBySeries(cfg.directory).length,
    }))
}
