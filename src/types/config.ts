// ============================================================
// Configuration Types — defines the shape of all site config
// ============================================================

/** Core site metadata */
export interface SiteConfig {
  /** Site title used in <title> and meta tags */
  title: string
  /** Site slogan displayed on homepage */
  slogan: string
  /** Author name */
  author: string
  /** Full site URL including protocol (e.g. "https://www.yoake.cc/") */
  url: string
  /** Language code (e.g. "zh-cn") */
  lang: string
  /** Base path for deployment (e.g. "/") */
  base: string
  /** Avatar image URL */
  avatar: string
  /** Footer copyright settings */
  copyright: {
    /** First year shown in copyright range */
    startYear: number
    /** Rights statement text */
    statement: string
  }
}

/** A navigation link */
export interface NavLink {
  label: string
  href: string
}

/** Navigation configuration */
export interface NavigationConfig {
  header: NavLink[]
  footer: NavLink[]
}

/** A social link with icon */
export interface SocialLink {
  name: string
  icon: string
  href: string
  /** Optional follower/subscriber count */
  count?: number
}

/** A skill item in the marquee */
export interface SkillItem {
  name: string
  icon: string
}

/** A row in the skills marquee */
export interface SkillRow {
  direction: 'left' | 'right'
  items: SkillItem[]
}

/** Skills card configuration */
export interface SkillsConfig {
  enabled: boolean
  title: string
  description: string
  rows: SkillRow[]
}

/** Recent posts section configuration */
export interface RecentPostsConfig {
  enabled: boolean
  title: string
  description: string
  /** Number of posts to show */
  count: number
}

/** Homepage configuration */
export interface HomePageConfig {
  title: string
  description: string
  intro: string[]
  social: SocialLink[]
  skills: SkillsConfig
  recentPosts: RecentPostsConfig
}

/** A friend link entry */
export interface FriendLink {
  name: string
  description: string
  website: string
  icon: string
}

/** Friends page configuration */
export interface FriendsPageConfig {
  title: string
  description: string
  links: FriendLink[]
}

/** Configuration for a single series */
export type SeriesOrder =
  | 'time-asc'
  | 'time-desc'
  | 'filename-asc'
  | 'filename-desc'
  | 'title-asc'
  | 'title-desc'

/** Optional sub-series mapping used for grouped menu display */
export interface SubSeriesConfig {
  /** Sub-series directory under content/<series>/ */
  directory: string
  /** Human-readable label shown in UI */
  title: string
}

/** Static series config item declared in src/config/series.ts */
export interface SeriesConfigItem {
  /** Directory name under content/ */
  directory: string
  title: string
  description: string
  icon?: string
  /** Sorting order for this series */
  order?: SeriesOrder
  /** Whether this series appears on /series page */
  seriesVisible: boolean
}

/** Resolved runtime metadata for one series */
export interface SeriesMetadata {
  title: string
  description: string
  icon?: string
  /** Sorting order for this series */
  order?: SeriesOrder
  /** Whether this series appears on /series page */
  seriesVisible: boolean
  /** Optional grouped directory mapping and display order */
  subSeries?: SubSeriesConfig[]
}

/** Resolved series metadata with explicit directory */
export interface SeriesItemConfig extends SeriesConfigItem, SeriesMetadata {}

/** Tags page configuration */
export interface TagsPageConfig {
  title: string
  description: string
}

/** All page configurations collected */
export interface PagesConfig {
  home: HomePageConfig
  friends: FriendsPageConfig
  tags: TagsPageConfig
}
