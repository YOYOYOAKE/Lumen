import { describe, expect, it } from 'vitest'
import {
  canonicalizeFrontmatterDateTime,
  isFrontmatterDateTime,
  parseFrontmatterDateTime,
} from '~/lib/frontmatter-date'
import { parseDateInput } from '~/lib/utils'

describe('frontmatter date contract', () => {
  it('accepts "YYYY-MM-DD HH:mm" format', () => {
    expect(canonicalizeFrontmatterDateTime('2026-02-15 12:00')).toBe('2026-02-15 12:00')
  })

  it('rejects non-contract frontmatter values', () => {
    expect(isFrontmatterDateTime('2026-02-15T12:00+08:00')).toBe(false)
    expect(isFrontmatterDateTime('2026-02-15 12:00:00')).toBe(false)
    expect(isFrontmatterDateTime('2026-02-15')).toBe(false)
    expect(() => canonicalizeFrontmatterDateTime('2026-02-15T12:00+08:00')).toThrowError(
      /Invalid frontmatter date/,
    )
  })

  it('parses to stable UTC instant', () => {
    const date = parseFrontmatterDateTime('2026-02-15 12:00')
    expect(date.toISOString()).toBe('2026-02-15T12:00:00.000Z')
  })

  it('keeps sorting deterministic via parseDateInput', () => {
    const values = ['2026-02-15 00:30', '2026-02-15 12:00', '2026-02-14 23:59']

    const sorted = [...values].sort((a, b) => parseDateInput(b).getTime() - parseDateInput(a).getTime())
    expect(sorted).toEqual([
      '2026-02-15 12:00',
      '2026-02-15 00:30',
      '2026-02-14 23:59',
    ])
  })
})
