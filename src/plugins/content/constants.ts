import { join } from 'node:path'
import type { SeriesOrder } from '../../types/config.js'

export const VIRTUAL_MODULE_ID = 'virtual:content'
export const RESOLVED_ID = '\0' + VIRTUAL_MODULE_ID
export const ARTICLE_MODULE_PREFIX = 'virtual:content/article/'
export const RESOLVED_ARTICLE_MODULE_PREFIX = '\0' + ARTICLE_MODULE_PREFIX
export const CONTENT_DIR = join(process.cwd(), 'content')
export const SERIES_CONFIG_PATH = join(process.cwd(), 'src', 'config', 'series.ts')
export const SERIES_FILE = 'series.md'

export const SERIES_ORDERS: Set<SeriesOrder> = new Set([
  'time-asc',
  'time-desc',
  'filename-asc',
  'filename-desc',
  'title-asc',
  'title-desc',
])

export const SERIES_ITEM_KEYS = new Set([
  'directory',
  'title',
  'description',
  'icon',
  'order',
  'seriesVisible',
])

export const RESERVED_SERIES_DIRS = new Set(['series', 'tags', 'friends', '404'])

export const ARTICLE_FRONTMATTER_KEYS = new Set([
  'title',
  'description',
  'createdAt',
  'updatedAt',
  'completed',
  'top',
  'tags',
])
