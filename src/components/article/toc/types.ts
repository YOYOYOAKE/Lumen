import type { RouteLocationRaw } from 'vue-router'

export type TocNavLinkType = 'anchor' | 'route'

export interface TocNavItem {
  id: string
  text: string
  linkType: TocNavLinkType
  link: string | RouteLocationRaw
  indentClass?: string
  trackingId?: string
}

export interface TocNavSection {
  levelOne: TocNavItem
  levelTwoItems: TocNavItem[]
}
