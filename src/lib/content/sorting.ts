import type { ResolvedArticleMeta } from '../../types/content.js'
import { compareLocalizedText, parseDateInput } from '../utils.js'

export const compareTitleAsc = (a: ResolvedArticleMeta, b: ResolvedArticleMeta) =>
  compareLocalizedText(a.frontmatter.title, b.frontmatter.title)

export const compareFilenameAsc = (a: ResolvedArticleMeta, b: ResolvedArticleMeta) =>
  compareLocalizedText(a.slug, b.slug)

export const compareTimeAsc = (a: ResolvedArticleMeta, b: ResolvedArticleMeta) =>
  parseDateInput(a.frontmatter.createdAt).getTime() -
  parseDateInput(b.frontmatter.createdAt).getTime()

export const compareTimeDesc = (a: ResolvedArticleMeta, b: ResolvedArticleMeta) =>
  compareTimeAsc(b, a)

export const compareSeriesTimeAsc = (a: ResolvedArticleMeta, b: ResolvedArticleMeta) => {
  const timeDiff = compareTimeAsc(a, b)
  if (timeDiff !== 0) return timeDiff
  const titleDiff = compareTitleAsc(a, b)
  if (titleDiff !== 0) return titleDiff
  return compareFilenameAsc(a, b)
}

export const compareSeriesTimeDesc = (a: ResolvedArticleMeta, b: ResolvedArticleMeta) => {
  const timeDiff = compareTimeDesc(a, b)
  if (timeDiff !== 0) return timeDiff
  const titleDiff = compareTitleAsc(a, b)
  if (titleDiff !== 0) return titleDiff
  return compareFilenameAsc(a, b)
}

export const compareSeriesFilenameAsc = (a: ResolvedArticleMeta, b: ResolvedArticleMeta) => {
  const filenameDiff = compareFilenameAsc(a, b)
  if (filenameDiff !== 0) return filenameDiff
  const timeDiff = compareTimeAsc(a, b)
  if (timeDiff !== 0) return timeDiff
  return compareTitleAsc(a, b)
}

export const compareSeriesFilenameDesc = (a: ResolvedArticleMeta, b: ResolvedArticleMeta) =>
  -compareSeriesFilenameAsc(a, b)

export const compareSeriesTitleAsc = (a: ResolvedArticleMeta, b: ResolvedArticleMeta) => {
  const titleDiff = compareTitleAsc(a, b)
  if (titleDiff !== 0) return titleDiff
  const timeDiff = compareTimeAsc(a, b)
  if (timeDiff !== 0) return timeDiff
  return compareFilenameAsc(a, b)
}

export const compareSeriesTitleDesc = (a: ResolvedArticleMeta, b: ResolvedArticleMeta) =>
  -compareSeriesTitleAsc(a, b)
