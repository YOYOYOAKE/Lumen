import { computed } from 'vue'
import {
  getArticlesBySeries,
  getPostsByTagSlug,
  getSeriesConfig,
  getTagNameBySlug,
} from '~/lib/content'

export type SeriesStandardPageProps =
  | { kind: 'series'; series: string }
  | { kind: 'tag'; tagSlug: string }

export function useSeriesStandardPage(props: SeriesStandardPageProps) {
  const tagName = computed(() => (props.kind === 'tag' ? getTagNameBySlug(props.tagSlug) : null))

  const posts = computed(() =>
    props.kind === 'tag' ? getPostsByTagSlug(props.tagSlug) : getArticlesBySeries(props.series),
  )

  const title = computed(() => {
    if (props.kind === 'tag') return `#${tagName.value ?? props.tagSlug}`
    return getSeriesConfig(props.series)?.title ?? props.series
  })

  const description = computed(() => {
    if (props.kind === 'tag') return `${posts.value.length} posts`
    return getSeriesConfig(props.series)?.description ?? `${posts.value.length} articles`
  })

  const baseUrl = computed(() => {
    if (props.kind === 'tag') return '/posts'
    return `/${props.series}`
  })

  return {
    posts,
    title,
    description,
    baseUrl,
  }
}
