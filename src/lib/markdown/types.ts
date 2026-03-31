import type { TocHeading } from '../../types/content.js'

export interface ProcessedMarkdown {
  html: string
  headings: TocHeading[]
  words: number
  readingTime: number
}
