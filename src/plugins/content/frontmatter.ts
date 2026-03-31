import { canonicalizeFrontmatterDate } from '../../lib/frontmatter-date.js'
import { isRecord } from './helpers.js'

export interface ParsedArticleFrontmatter {
  title: string
  description: string
  createdAt: string
  updatedAt?: string
  completed: boolean
  top: boolean
  tags: string[]
}

function assertFrontmatterDate(
  input: unknown,
  filePath: string,
  field: 'createdAt' | 'updatedAt',
): string | undefined {
  if (input === undefined || input === null) return undefined

  if (!(input instanceof Date)) {
    throw new Error(
      `Invalid frontmatter "${field}" in ${filePath}: expected an unquoted YAML date like ${field}: 2025-12-21`,
    )
  }

  try {
    return canonicalizeFrontmatterDate(input)
  } catch {
    throw new Error(
      `Invalid frontmatter "${field}" in ${filePath}: expected an unquoted YAML date like ${field}: 2025-12-21`,
    )
  }
}

export function parseArticleFrontmatter(
  input: unknown,
  filePath: string,
): ParsedArticleFrontmatter | null {
  if (!isRecord(input)) {
    throw new Error(`Invalid frontmatter in ${filePath}`)
  }

  const title = input.title
  if (typeof title !== 'string' || title.trim() === '') {
    throw new Error(`Invalid or missing frontmatter "title" in ${filePath}`)
  }

  const description = input.description
  if (typeof description !== 'string' || description.trim() === '') {
    throw new Error(`Invalid or missing frontmatter "description" in ${filePath}`)
  }

  const createdAt = assertFrontmatterDate(input.createdAt, filePath, 'createdAt')
  if (!createdAt) {
    throw new Error(`Invalid or missing frontmatter "createdAt" in ${filePath}`)
  }

  const updatedAtValue = input.updatedAt
  let updatedAt: string | undefined
  if (updatedAtValue !== undefined) {
    updatedAt = assertFrontmatterDate(updatedAtValue, filePath, 'updatedAt')
    if (!updatedAt) {
      throw new Error(`Invalid frontmatter "updatedAt" in ${filePath}`)
    }
  }

  const completedValue = input.completed
  let completed = true
  if (completedValue !== undefined) {
    if (typeof completedValue !== 'boolean') {
      throw new Error(`Invalid frontmatter "completed" in ${filePath}: expected a boolean`)
    }
    completed = completedValue
  }
  if (!completed) return null

  const topValue = input.top
  let top = false
  if (topValue !== undefined) {
    if (typeof topValue !== 'boolean') {
      throw new Error(`Invalid frontmatter "top" in ${filePath}: expected a boolean`)
    }
    top = topValue
  }

  const tagsValue = input.tags
  let tags: string[] = []
  if (tagsValue !== undefined) {
    if (!Array.isArray(tagsValue)) {
      throw new Error(`Invalid frontmatter "tags" in ${filePath}: expected an array`)
    }
    tags = tagsValue.map((tag, index) => {
      if (typeof tag !== 'string' || tag.trim() === '') {
        throw new Error(
          `Invalid frontmatter "tags[${index}]" in ${filePath}: expected a non-empty string`,
        )
      }
      return tag
    })
  }

  return {
    title,
    description,
    createdAt,
    updatedAt,
    completed,
    top,
    tags,
  }
}
