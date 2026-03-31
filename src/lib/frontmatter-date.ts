const FRONTMATTER_DATE = /^(\d{4})-(\d{2})-(\d{2})$/

interface DateParts {
  year: number
  month: number
  day: number
}

function pad2(value: number): string {
  return String(value).padStart(2, '0')
}

function parseDateParts(value: string): DateParts | null {
  const match = value.match(FRONTMATTER_DATE)
  if (!match) return null

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])

  if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) {
    return null
  }

  const normalized = new Date(Date.UTC(year, month - 1, day))
  if (
    normalized.getUTCFullYear() !== year ||
    normalized.getUTCMonth() + 1 !== month ||
    normalized.getUTCDate() !== day
  ) {
    return null
  }

  return { year, month, day }
}

function parseYamlDate(value: unknown): DateParts | null {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    return null
  }

  const year = value.getUTCFullYear()
  const month = value.getUTCMonth() + 1
  const day = value.getUTCDate()

  if (
    value.getUTCHours() !== 0 ||
    value.getUTCMinutes() !== 0 ||
    value.getUTCSeconds() !== 0 ||
    value.getUTCMilliseconds() !== 0
  ) {
    return null
  }

  return { year, month, day }
}

export function canonicalizeFrontmatterDate(value: unknown): string {
  const parts = parseYamlDate(value)
  if (!parts) {
    throw new Error('Invalid frontmatter date: expected an unquoted YAML date like 2025-12-21')
  }

  return `${parts.year}-${pad2(parts.month)}-${pad2(parts.day)}`
}

export function parseFrontmatterDate(value: string): Date {
  const parts = parseDateParts(value.trim())
  if (!parts) {
    throw new Error(`Invalid frontmatter date "${value}": expected "YYYY-MM-DD"`)
  }

  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day, 12, 0, 0))
}
