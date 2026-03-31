import type { ResolvedArticleMeta, SeriesInfo } from '../../types/content.js'
import type { SeriesItemConfig } from '../../types/config.js'
import { articleMetaList, seriesMetadataList } from './store.js'
import {
  compareSeriesFilenameAsc,
  compareSeriesFilenameDesc,
  compareSeriesTimeAsc,
  compareSeriesTimeDesc,
  compareSeriesTitleAsc,
  compareSeriesTitleDesc,
  compareTimeDesc,
  compareTitleAsc,
  compareFilenameAsc,
} from './sorting.js'

/** Find a series config item by directory name */
export function getSeriesConfig(directory: string) {
  return seriesMetadataList.find((series) => series.directory === directory)
}

/** Get article metadata belonging to a specific series */
export function getArticlesBySeries(series: string): ResolvedArticleMeta[] {
  const list = articleMetaList.filter((article) => article.series === series)
  const config = getSeriesConfig(series)
  const order = config?.order

  if (!order) return list

  return [...list].sort((a, b) => {
    switch (order) {
      case 'time-asc':
        return compareSeriesTimeAsc(a, b)
      case 'time-desc':
        return compareSeriesTimeDesc(a, b)
      case 'filename-asc':
        return compareSeriesFilenameAsc(a, b)
      case 'filename-desc':
        return compareSeriesFilenameDesc(a, b)
      case 'title-asc':
        return compareSeriesTitleAsc(a, b)
      case 'title-desc':
        return compareSeriesTitleDesc(a, b)
      default:
        return 0
    }
  })
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

/** Get latest N posts by createdAt (ignores top/pinned flag) */
export function getRecentPosts(count: number): ResolvedArticleMeta[] {
  return [...getAllPosts()]
    .sort((a, b) => {
      const timeDiff = compareTimeDesc(a, b)
      if (timeDiff !== 0) return timeDiff
      const titleDiff = compareTitleAsc(a, b)
      if (titleDiff !== 0) return titleDiff
      return compareFilenameAsc(a, b)
    })
    .slice(0, count)
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
