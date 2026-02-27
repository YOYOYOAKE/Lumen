import type { NavigationConfig, PagesConfig, SiteConfig } from '../types/config'

export const siteConfig: SiteConfig = {
  title: 'Lumen',
  slogan: 'Birds are born with no shackles.',
  author: 'YOAKE',
  url: 'https://www.yoake.cc/',
  lang: 'zh-cn',
  base: '/',
  avatar: 'https://img.yoake.cc/avatars/yoake.webp',
  copyright: {
    startYear: 2024,
    statement: 'All rights reserved',
  },
}

export const navigationConfig: NavigationConfig = {
  header: [
    { label: 'Home', href: '/' },
    { label: 'Posts', href: '/posts' },
    { label: 'Jottings', href: '/jottings' },
    { label: 'Series', href: '/series' },
    { label: 'Friends', href: '/friends' },
  ],
  footer: [
    { label: 'Posts', href: '/posts' },
    { label: 'Jottings', href: '/jottings' },
    { label: 'Series', href: '/series' },
    { label: 'Friends', href: '/friends' },
    { label: 'Tags', href: '/tags' },
  ],
}

export const pagesConfig: PagesConfig = {
  home: {
    title: 'Lumen',
    description: 'Birds are born with no shackles.',
    intro: ['欢迎到访，我是 YOAKE。这个词来源于日语「夜明け」的罗马音，意为「黎明」。'],
    social: [
      {
        name: 'GitHub',
        icon: 'icon-[mdi--github]',
        href: 'https://github.com/yoyoyoake',
      },
      {
        name: 'Gmail',
        icon: 'icon-[mdi--gmail]',
        href: 'mailto:yo2yoake@gmail.com',
      },
    ],
    skills: {
      enabled: true,
      title: 'Skills',
      description: '技多不压身',
      rows: [
        {
          direction: 'left',
          items: [
            { name: 'HTML', icon: 'icon-[skill-icons--html]' },
            { name: 'CSS', icon: 'icon-[skill-icons--css]' },
            { name: 'JavaScript', icon: 'icon-[skill-icons--javascript]' },
            { name: 'TypeScript', icon: 'icon-[skill-icons--typescript]' },
            { name: 'Node.js', icon: 'icon-[skill-icons--nodejs-light]' },
            { name: 'Vue', icon: 'icon-[skill-icons--vuejs-light]' },
            { name: 'Vite', icon: 'icon-[skill-icons--vite-light]' },
          ],
        },
        {
          direction: 'right',
          items: [
            { name: 'Python', icon: 'icon-[skill-icons--python-light]' },
            { name: 'FastAPI', icon: 'icon-[skill-icons--fastapi]' },
            { name: 'Flask', icon: 'icon-[skill-icons--flask-light]' },
            { name: 'Go', icon: 'icon-[skill-icons--golang]' },
            { name: 'SQLite', icon: 'icon-[skill-icons--sqlite]' },
            { name: 'PostgreSQL', icon: 'icon-[skill-icons--postgresql-light]' },
          ],
        },
        {
          direction: 'left',
          items: [
            { name: 'Git', icon: 'icon-[skill-icons--git]' },
            { name: 'Debian', icon: 'icon-[skill-icons--debian-light]' },
            { name: 'Ubuntu', icon: 'icon-[skill-icons--ubuntu-light]' },
            { name: 'Docker', icon: 'icon-[skill-icons--docker]' },
            { name: 'Cloudflare', icon: 'icon-[skill-icons--cloudflare-light]' },
          ],
        },
      ],
    },
    recentPosts: {
      enabled: true,
      title: 'Recent',
      description: '新篇速递',
      count: 3,
    },
  },
  friends: {
    title: 'Friends',
    description: '心有高朋身自富，君有奇才我不贫。',
    links: [
      {
        name: 'AJohn',
        description: 'Never, ever, ever give up.',
        website: 'https://www.ajohn.top/',
        icon: 'https://img.yoake.cc/avatars/ajohn.webp',
      },
      {
        name: 'Zephyr',
        description: '不要温和地走进那个良夜。',
        website: 'https://zephyrus612.netlify.app/',
        icon: 'https://img.yoake.cc/avatars/zephyr.webp',
      },
    ],
  },
  tags: {
    title: 'Tags',
    description: '一旦你给我贴上标签，你就否定了我。',
  },
}
