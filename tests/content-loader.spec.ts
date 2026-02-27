import { afterEach, describe, expect, it, vi } from 'vitest'

afterEach(() => {
  vi.resetModules()
  vi.unmock('virtual:content')
})

describe('loadArticle', () => {
  it('loads article body lazily and caches per lookup key', async () => {
    const loader = vi.fn(async () => ({
      default: {
        html: '<p>Hello</p>',
        headings: [{ depth: 2, slug: 'hello', text: 'Hello' }],
      },
    }))

    vi.doMock('virtual:content', () => ({
      articles: [
        {
          slug: '20260215-e184',
          series: 'posts',
          frontmatter: {
            slug: '20260215-e184',
            title: 'Hello',
            description: 'World',
            createdAt: '2026-02-15 12:00',
            completed: true,
            top: false,
            tags: [],
            words: 100,
            readingTime: 1,
          },
        },
      ],
      seriesMetadata: [],
      articleBodyLoaders: {
        'posts:20260215-e184': loader,
      },
    }))

    const { loadArticle } = await import('~/lib/content')

    const first = await loadArticle('posts', '20260215-e184')
    const second = await loadArticle('posts', '20260215-e184')

    expect(first).not.toBeNull()
    expect(first?.html).toBe('<p>Hello</p>')
    expect(second?.html).toBe('<p>Hello</p>')
    expect(loader).toHaveBeenCalledTimes(1)
  })

  it('returns null when metadata or loader is missing', async () => {
    vi.doMock('virtual:content', () => ({
      articles: [
        {
          slug: 'known',
          series: 'posts',
          frontmatter: {
            slug: 'known',
            title: 'Known',
            description: 'Known',
            createdAt: '2026-02-15 12:00',
            completed: true,
            top: false,
            tags: [],
            words: 100,
            readingTime: 1,
          },
        },
      ],
      seriesMetadata: [],
      articleBodyLoaders: {},
    }))

    const { loadArticle } = await import('~/lib/content')

    expect(await loadArticle('posts', 'unknown')).toBeNull()
    expect(await loadArticle('posts', 'known')).toBeNull()
  })
})
