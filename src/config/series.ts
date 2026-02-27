import type { SeriesConfigItem } from '~/types/config'

export const seriesConfig: SeriesConfigItem[] = [
  {
    directory: 'posts',
    title: 'Posts',
    description: '风带来故事的种子，时间使其发芽。',
    seriesVisible: false,
  },
  {
    directory: 'jottings',
    title: 'Jottings',
    description: '我有一杯酒，足以慰风尘。尽倾江海里，赠饮天下人。',
    seriesVisible: false,
  },
  {
    directory: 'go',
    title: 'Go 入门教程',
    description: '更多的是面对已经有编程基础的教程，可能并非入门？',
    icon: 'icon-[skill-icons--golang]',
    order: 'filename-asc',
    seriesVisible: true,
  },
]
