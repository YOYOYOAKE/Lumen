import type { SeriesInfo, ResolvedArticleMeta } from '../../types/content.js'
import type { TagItem } from './tags.js'
import { compareLocalizedText, parseDateInput } from '../utils.js'

const compareArticleTitleAsc = (a: ResolvedArticleMeta, b: ResolvedArticleMeta) =>
  compareLocalizedText(a.frontmatter.title, b.frontmatter.title)

const compareArticleSlugAsc = (a: ResolvedArticleMeta, b: ResolvedArticleMeta) =>
  compareLocalizedText(a.slug, b.slug)

export const compareArticleByDateDesc = (a: ResolvedArticleMeta, b: ResolvedArticleMeta) => {
  const timeDiff =
    parseDateInput(b.frontmatter.createdAt).getTime() -
    parseDateInput(a.frontmatter.createdAt).getTime()
  if (timeDiff !== 0) return timeDiff

  const titleDiff = compareArticleTitleAsc(a, b)
  if (titleDiff !== 0) return titleDiff

  return compareArticleSlugAsc(a, b)
}

export const compareArticleByTitleAsc = (a: ResolvedArticleMeta, b: ResolvedArticleMeta) => {
  const titleDiff = compareArticleTitleAsc(a, b)
  if (titleDiff !== 0) return titleDiff

  return compareArticleSlugAsc(a, b)
}

export const comparePostByPinnedDateDesc = (a: ResolvedArticleMeta, b: ResolvedArticleMeta) => {
  const pinnedDiff = Number(Boolean(b.frontmatter.top)) - Number(Boolean(a.frontmatter.top))
  if (pinnedDiff !== 0) return pinnedDiff

  return compareArticleByDateDesc(a, b)
}

export const compareTagByNameAsc = (a: TagItem, b: TagItem) => {
  const nameDiff = compareLocalizedText(a.name, b.name)
  if (nameDiff !== 0) return nameDiff

  return compareLocalizedText(a.slug, b.slug)
}

export const compareSeriesByTitleAsc = (a: SeriesInfo, b: SeriesInfo) => {
  const titleDiff = compareLocalizedText(a.name, b.name)
  if (titleDiff !== 0) return titleDiff

  return compareLocalizedText(a.id, b.id)
}
