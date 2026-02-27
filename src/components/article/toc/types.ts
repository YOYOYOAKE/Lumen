export type TocNavLinkType = 'anchor' | 'route'

export interface TocNavItem {
  id: string
  text: string
  displayOrder: string
  linkType: TocNavLinkType
  link: string
  indentClass?: string
  trackingId?: string
}

export interface TocNavSection {
  levelOne: TocNavItem
  levelTwoItems: TocNavItem[]
}
