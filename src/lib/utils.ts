import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { parseFrontmatterDate } from './frontmatter-date'

/** Merge Tailwind CSS class names, deduplicating conflicting utilities */
export function cn(...classes: ClassValue[]): string {
  return twMerge(clsx(classes))
}

export type DateFormat = 'default' | 'dot' | 'short' | 'iso' | 'chinese'
const MONTH_NAMES_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const MONTH_NAMES_LONG = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

/** Parse a frontmatter date in stable "YYYY-MM-DD" form */
export function parseDateInput(date: Date | string): Date {
  if (date instanceof Date) return date

  return parseFrontmatterDate(date.trim())
}

/** Compare titles/slugs using locale-aware ordering that works for letters and Chinese pinyin */
export function compareLocalizedText(a: string, b: string): number {
  return a.localeCompare(b, 'zh-CN', {
    numeric: true,
    sensitivity: 'base',
  })
}

function getDateParts(date: Date) {
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
    hour: date.getUTCHours(),
    minute: date.getUTCMinutes(),
  }
}

/** Format a date according to the specified format */
export function formatDate(date: Date | string, format: DateFormat = 'default'): string {
  const d = parseDateInput(date)
  const { year, month, day } = getDateParts(d)

  switch (format) {
    case 'dot': {
      return `${year}.${String(month).padStart(2, '0')}.${String(day).padStart(2, '0')}`
    }
    case 'short':
      return `${MONTH_NAMES_SHORT[month - 1]} ${day}, ${year}`
    case 'iso': {
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    }
    case 'chinese': {
      return `${year}年${month}月${day}日`
    }
    default:
      return `${MONTH_NAMES_LONG[month - 1]} ${day}, ${year}`
  }
}

/** Sort articles: pinned first, then by createdAt descending */
export function sortArticles<
  T extends { slug: string; frontmatter: { top?: boolean; title: string; createdAt: Date | string } },
>(articles: T[]): T[] {
  return [...articles].sort((a, b) => {
    const topDiff = Number(Boolean(b.frontmatter.top)) - Number(Boolean(a.frontmatter.top))
    if (topDiff !== 0) return topDiff

    const aDate = parseDateInput(a.frontmatter.createdAt)
    const bDate = parseDateInput(b.frontmatter.createdAt)
    const timeDiff = bDate.getTime() - aDate.getTime()
    if (timeDiff !== 0) return timeDiff

    const titleDiff = compareLocalizedText(a.frontmatter.title, b.frontmatter.title)
    if (titleDiff !== 0) return titleDiff

    return compareLocalizedText(a.slug, b.slug)
  })
}

/** Check if a URL string is external */
export function isExternalLink(url: string): boolean {
  return /^https?:\/\//i.test(url)
}

/** Check if a string is an iconify class name */
export function isIconClass(icon: string): boolean {
  return icon.startsWith('icon-[') || icon.startsWith('icon-')
}
