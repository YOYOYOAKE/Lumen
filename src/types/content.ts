// ============================================================
// Content Types — defines the shape of all content collections
// ============================================================

/** Base frontmatter shared by all article-like content */
export interface ArticleFrontmatter {
  slug: string
  title: string
  description: string
  createdAt: string
  updatedAt?: string
  completed: boolean
  top: boolean
  tags: string[]
}

/** Computed fields injected during content processing */
export interface ArticleComputedFields {
  /** Word count of the article body */
  words: number
  /** Estimated reading time in minutes */
  readingTime: number
}

/** A heading extracted from the markdown content */
export interface TocHeading {
  depth: number
  slug: string
  text: string
}

/** Metadata required by list and index pages */
export interface ResolvedArticleMeta {
  /** Unique slug from article frontmatter */
  slug: string
  /** Optional sub-series directory derived from parent folder under series root */
  subSeries?: string
  /** The series this article belongs to (e.g. "posts", "jottings", "go") */
  series: string
  /** Parsed frontmatter */
  frontmatter: ArticleFrontmatter & ArticleComputedFields
}

/** Markdown body data loaded on-demand for article pages */
export interface ResolvedArticleBody {
  /** Rendered HTML content */
  html: string
  /** Table of contents headings */
  headings: TocHeading[]
}

/** Fully resolved article ready for rendering */
export type ResolvedArticle = ResolvedArticleMeta & ResolvedArticleBody

/** Series metadata for the /series index page */
export interface SeriesInfo {
  /** Series identifier (directory name, e.g. "go") */
  id: string
  /** Display name */
  name: string
  /** Description */
  description: string
  /** Icon class or URL */
  icon?: string
  /** Number of articles in this series */
  articleCount: number
}
