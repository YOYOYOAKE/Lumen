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

/** Check if a URL string is external */
export function isExternalLink(url: string): boolean {
  return /^https?:\/\//i.test(url)
}

/** Check if a string is an iconify class name */
export function isIconClass(icon: string): boolean {
  return icon.startsWith('icon-[') || icon.startsWith('icon-')
}
