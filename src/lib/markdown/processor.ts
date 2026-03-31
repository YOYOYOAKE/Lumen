import rehypeCallouts from 'rehype-callouts'
import rehypeExternalLinks from 'rehype-external-links'
import rehypeKatex from 'rehype-katex'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
import rehypeSlug from 'rehype-slug'
import rehypeStringify from 'rehype-stringify'
import rehypeUnwrapImages from 'rehype-unwrap-images'
import remarkDirective from 'remark-directive'
import remarkDirectiveSugar from 'remark-directive-sugar'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import remarkSmartypants from 'remark-smartypants'
import { unified } from 'unified'
import type { TocHeading } from '../../types/content.js'
import { assertSupportedCallouts } from './callouts.js'
import { DANGER_CALLOUT_ICON, sanitizeSchema } from './constants.js'
import { rehypeExtractHeadings, rehypeShiki, remarkReadingTime } from './plugins.js'
import type { ProcessedMarkdown } from './types.js'

/** Process a markdown string and return rendered HTML + metadata */
export async function processMarkdown(
  content: string,
  source = 'markdown',
): Promise<ProcessedMarkdown> {
  assertSupportedCallouts(content, source)
  const headings: TocHeading[] = []

  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkSmartypants)
    .use(remarkDirective)
    .use(remarkDirectiveSugar, {
      badge: { presets: { n: { text: 'NEW' } } },
      link: {
        faviconSourceUrl: 'https://www.google.com/s2/favicons?domain={domain}&sz=128',
        imgProps: () => ({ 'aria-hidden': 'true' }),
      },
      image: { stripParagraph: false },
      video: {
        platforms: {
          bilibili: 'https://player.bilibili.com/player.html?bvid={id}&autoplay=0',
        },
      },
    })
    .use(remarkMath)
    .use(remarkReadingTime)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeSanitize, sanitizeSchema)
    .use(rehypeSlug)
    .use(rehypeUnwrapImages)
    .use(rehypeCallouts, {
      theme: 'vitepress',
      callouts: {
        danger: {
          title: 'DANGER',
          indicator: DANGER_CALLOUT_ICON,
        },
      },
    })
    .use(rehypeExternalLinks, {
      target: '_blank',
      rel: ['noopener', 'noreferrer'],
    })
    .use(rehypeKatex)
    .use(rehypeShiki)
    .use(rehypeExtractHeadings(headings))
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(content)

  return {
    html: String(file),
    headings,
    words: (file.data as any).words ?? 0,
    readingTime: (file.data as any).readingTime ?? 0,
  }
}
