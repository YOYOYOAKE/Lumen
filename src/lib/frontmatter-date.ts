const FRONTMATTER_DATE_TIME = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})$/

interface DateParts {
  year: number
  month: number
  day: number
  hour: number
  minute: number
}

function pad2(value: number): string {
  return String(value).padStart(2, '0')
}

function parseDateParts(value: string): DateParts | null {
  const match = value.match(FRONTMATTER_DATE_TIME)
  if (!match) return null

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const hour = Number(match[4])
  const minute = Number(match[5])

  if (
    Number.isNaN(year) ||
    Number.isNaN(month) ||
    Number.isNaN(day) ||
    Number.isNaN(hour) ||
    Number.isNaN(minute)
  ) {
    return null
  }

  const utcMs = Date.UTC(year, month - 1, day, hour, minute, 0)
  const normalized = new Date(utcMs)

  if (
    normalized.getUTCFullYear() !== year ||
    normalized.getUTCMonth() + 1 !== month ||
    normalized.getUTCDate() !== day ||
    normalized.getUTCHours() !== hour ||
    normalized.getUTCMinutes() !== minute
  ) {
    return null
  }

  return {
    year,
    month,
    day,
    hour,
    minute,
  }
}

export function isFrontmatterDateTime(value: string): boolean {
  return parseDateParts(value.trim()) !== null
}

export function canonicalizeFrontmatterDateTime(value: string): string {
  const parts = parseDateParts(value.trim())
  if (!parts) {
    throw new Error('Invalid frontmatter date: expected "YYYY-MM-DD HH:mm"')
  }

  return `${parts.year}-${pad2(parts.month)}-${pad2(parts.day)} ${pad2(parts.hour)}:${pad2(parts.minute)}`
}

export function parseFrontmatterDateTime(value: string): Date {
  const parts = parseDateParts(value.trim())
  if (!parts) {
    throw new Error(`Invalid frontmatter date "${value}": expected "YYYY-MM-DD HH:mm"`)
  }

  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, 0))
}

export function formatDateToFrontmatterDateTime(value: Date): string {
  const year = value.getUTCFullYear()
  const month = value.getUTCMonth() + 1
  const day = value.getUTCDate()
  const hour = value.getUTCHours()
  const minute = value.getUTCMinutes()

  return `${year}-${pad2(month)}-${pad2(day)} ${pad2(hour)}:${pad2(minute)}`
}
