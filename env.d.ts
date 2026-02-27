/// <reference types="vite/client" />
/// <reference types="vite-ssg" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, any>
  export default component
}

declare module 'virtual:content' {
  import type { ResolvedArticleBody, ResolvedArticleMeta } from '~/types/content'
  import type { SeriesItemConfig } from '~/types/config'

  export const articles: ResolvedArticleMeta[]
  export const seriesMetadata: SeriesItemConfig[]
  export const articleBodyLoaders: Record<
    string,
    () => Promise<{ default: ResolvedArticleBody }>
  >
}
