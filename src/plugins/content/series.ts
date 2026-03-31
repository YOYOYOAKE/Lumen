import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import { seriesConfig } from '../../config/series.js'
import type { SeriesConfigItem, SeriesItemConfig, SeriesOrder } from '../../types/config.js'
import {
  RESERVED_SERIES_DIRS,
  SERIES_CONFIG_PATH,
  SERIES_ITEM_KEYS,
  SERIES_ORDERS,
} from './constants.js'
import { isRecord } from './helpers.js'

export function listSeriesDirectories(root: string): string[] {
  try {
    return readdirSync(root, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
      .map((entry) => entry.name)
      .sort((a, b) => a.localeCompare(b, 'zh-CN', { numeric: true, sensitivity: 'base' }))
  } catch {
    return []
  }
}

export function assertNoReservedSeriesDirectories(seriesDirs: string[], contentDir: string) {
  const conflicts = seriesDirs.filter((name) => RESERVED_SERIES_DIRS.has(name))
  if (conflicts.length === 0) return

  const detail = conflicts.map((name) => `"${name}" (${join(contentDir, name)})`).join(', ')

  throw new Error(
    `Reserved series directory name detected: ${detail}. Rename the series directory to avoid route conflicts.`,
  )
}

function parseSeriesConfigItem(
  input: unknown,
  index: number,
  knownSeriesDirs: Set<string>,
): SeriesConfigItem {
  const label = `${SERIES_CONFIG_PATH} -> seriesConfig[${index}]`
  if (!isRecord(input)) {
    throw new Error(`Invalid series item in ${label}: expected an object`)
  }

  const unknown = Object.keys(input).filter((k) => !SERIES_ITEM_KEYS.has(k))
  if (unknown.length > 0) {
    throw new Error(`Unknown series keys in ${label}: ${unknown.join(', ')}`)
  }

  const directory = input.directory
  const title = input.title
  const description = input.description
  const icon = input.icon
  const order = input.order
  const seriesVisible = input.seriesVisible

  if (typeof directory !== 'string' || directory.trim() === '') {
    throw new Error(`Invalid "directory" in ${label}`)
  }
  if (directory.includes('/') || directory.includes('\\')) {
    throw new Error(`Invalid "directory" in ${label}: nested path is not allowed`)
  }
  if (!knownSeriesDirs.has(directory)) {
    throw new Error(`Unknown series directory "${directory}" in ${label}`)
  }
  if (typeof title !== 'string' || title.trim() === '') {
    throw new Error(`Invalid "title" in ${label}`)
  }
  if (typeof description !== 'string' || description.trim() === '') {
    throw new Error(`Invalid "description" in ${label}`)
  }
  if (icon !== undefined && typeof icon !== 'string') {
    throw new Error(`Invalid "icon" in ${label}`)
  }
  if (
    order !== undefined &&
    (typeof order !== 'string' || !SERIES_ORDERS.has(order as SeriesOrder))
  ) {
    throw new Error(`Invalid "order" in ${label}`)
  }
  if (typeof seriesVisible !== 'boolean') {
    throw new Error(`Invalid "seriesVisible" in ${label}`)
  }

  const metadata: SeriesConfigItem = {
    directory,
    title,
    description,
    seriesVisible,
  }
  if (icon !== undefined) metadata.icon = icon
  if (order !== undefined) metadata.order = order as SeriesOrder

  return metadata
}

export function resolveSeriesConfig(seriesDirs: string[]): SeriesItemConfig[] {
  const knownSeriesDirs = new Set(seriesDirs)
  const parsed = seriesConfig.map((item, index) => parseSeriesConfigItem(item, index, knownSeriesDirs))

  const seen = new Set<string>()
  for (const item of parsed) {
    if (seen.has(item.directory)) {
      throw new Error(`Duplicate series directory "${item.directory}" in ${SERIES_CONFIG_PATH}`)
    }
    seen.add(item.directory)
  }

  const missing = seriesDirs.filter((dir) => !seen.has(dir))
  if (missing.length > 0) {
    throw new Error(
      `Missing series config entries in ${SERIES_CONFIG_PATH}: ${missing.join(', ')}`,
    )
  }

  return parsed
}
