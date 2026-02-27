---
title: '基于 Notion + Github Action + Astro + Cloudflare 的全云端博客工作流'
slug: '20251222-71d5'
description: '这使用该工作流完成的首篇文章。'
createdAt: '2025-12-22 12:00'
updatedAt: '2026-01-03 15:32'
completed: true
top: false
tags: ['Litos(YOAKE Modified)']
---

我一直使用静态页面生成器来创建我的博客。但是这种方式在形式上和撰写代码没什么太大的区别，因为这两者都需要坐在电脑前、打开 VSCode 或者别的什么 IDE后才能编写文章，写完后还要推送到 Github 仓库，然后等待 CI/CD 流程自动部署。

对于工作和 VSCode 深度绑定的我来说，打开 VSCode 已经是一种负担了。如果说工作时打开 VSCode 是再正常不过的一件事，那么在偏向个人和日常的博客写作场景下再使用 VSCode，就显得有点命苦。

刚好之前使用 Vuepress 搭建的博客有点看腻了，打算换博客框架。借着这个机会，研究一下如何搭建一个心智负担更小、更加优雅便捷的博客工作流。

## 技术选型

首先明确需求：

- 我不希望打开 VSCode 或者别的什么 IDE 来写文章；
- 随时随地写作；
- 至少有一处能在我控制之下的文件副本；
- **免费**。

其实加上这几条限制之后，能用的产品就不多了。首先仓库托管和部署肯定离不开 Github 和 Cloudflare
Pages。而静态博客框架无非 Hexo、Astro、Vuepress 那几个。最后我在 Astro 和 Hexo 中间选择了前者。一是因为 Astro 的自定义程度更高，二是更加现代、性能更高。

在主题上，我选择了 [@Dnkk2](https://github.com/Dnzzk2) 制作的
[Litos](https://github.com/Dnzzk2/Litos)，简洁、优雅、美观。在 Litos 优秀设计的基础上，我进行了大量的改造，以适配博客结构。

最后是「不使用 VSCode 等 IDE 来写作」。这个需求还是很容易满足的，Obsidian、Notion、飞书平台都能满足需求。但是 Obsidian 的官方同步功能需要付费，而免费的 Github 插件虽然可以实现同步，但是该插件不能在移动端使用。飞书和 Notion 的内容则全部存在云端，允许随时随地写作。二者对比，飞书更偏向企业协作，Notion 更偏向于个人知识库搭建。同时，Notion 还提供了专用的 SDK 和 API 导出文章。结合这些优势，我最终选择了 Notion 作为写作平台。

## 初步工作流设计

虽然每一步都有现成的轮子可以用，但最大的难题在于如何把轮子拼成车。在经过了三天的研究、试错和开发后，最后得到的工作流是这样的：

1. 在 Notion 上完成写作；
2. 触发 Github Action 通过 Notion API 拉取文章；
3. 在 Github Action 完成语法转换和文件保存，然后提交到 Git 仓库中；
4. Cloudflare Pages 检测到提交行为，自动编译为静态页面并部署。

这里我按照实现难度从低到高的顺序来写。

### 自动部署

这一步的难度几乎为零。Cloudflare
Pages 完全傻瓜化，只需要点点点，就能把 Github 仓库中的 Astro 应用编译成静态页面发布。

### 自动拉取文章

自动拉取文章基本只能靠 Github
Action 了。原本的构想是自动、定时拉取。例如，在 Github 仓库根目录下维护一个`.notion-sync.yml`文件：

```yaml
- last_sync_time: YYYY-MM-DD hh:mm:ss
- entities:
 -
  name: alice
  last_edited_time: YYYY-MM-DD hh:mm:ss
 -
  name: bob
  last_edited_time: YYYY-MM-DD hh:mm:ss
```

然后读取上次同步时间、再读取数据库中所有文章的最后一次编辑时间、检索最后一次编辑晚于上次同步的文章、再更新文章。

但是这样会存在很多边界问题，例如：

- 检索到待更新的文章，但是由于各种原因拉取失败怎么办？
- 更新文章需要时间，如果在更新的过程中编辑了文章怎么办？
- …

而且我并不是时时刻刻都在写作，这也就意味着绝大部分时间定时拉取都在空转。尽管 Github Action 和 Notion
API 不要钱，但还是尽量不要浪费这些公共资源。

于是计划手动同步。为了把心智负担降低到最小，我选择每次只同步一篇指定的文章，这样就完全杜绝了上述的边界问题，而且控制粒度也精细了很多。

这在 Github Action 上是完全可行的，它支持在运行工作流前手动输入变量。大概类似于这样：

```yaml
on:
  workflow_dispatch:
    inputs:
      pageId:
      description: 'Notion page ID (32 chars without hyphens)'
      required: true
```

Notion Page
ID 很方便就可以得到，就是 URL 的后边跟着的那串 32 位无连字符的 UUID。然后在仓库中创建一个用于拉取文章的脚本，工作流运行时调用该脚本，就能自动拉取文章了。

```yaml
jobs: 
 sync:   
  runs-on: ubuntu-latest

  steps:
   - ...
      - name: Sync page
    run: pnpm tsx scripts/syncNotion.ts
    env:
     NOTION_TOKEN: ${{ secrets.NOTION_TOKEN }}
     NOTION_PAGE_ID: ${{ inputs.pageId }}
```

### 字段映射

Notion 的数据库可以统一管理所有文章的字段，也就是所有文章的元数据和对应 Markdown 文件的 Frontmatter。结合需求，设计以下字段映射：

| Notion 数据库字段  | Frontmatter 字段 | 备注             |
| ------------------ | ---------------- | ---------------- |
| `title`            | `title`          | 标题             |
| `description`      | `description`    | 描述             |
| `tags`             | `tags`           | 标签             |
| `completed`        | `completed`      | 是否写完         |
| `top`              | `top`            | 是否置顶         |
| `create_time`      | `createdAt`      | 创建时间         |
| `last_edited_time` | `updatedAt`      | 最后一次编辑时间 |
| `id`               | 无               | UUID             |

### 语法转换

这是最难的一步了。尽管标准 Markdown 语法在各种地方都支持，但是在非标准 Markdown 上，各家的语法就五花八门了。例如我想添加 Callout 块当做提示容器，Notion 直接导出到 Markdown 是这样的：

```
<aside>
...
<aside>
```

但是 Litos 主题的语法是这样的：

```
> [!tip]
> ...
```

再比如 Litos 的增强代码块：

```
----- Markdown 代码块 -----
// title='src/demo.ts' mark={1, 6-7} add={3, 9} del={4, 10}
type State =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; data: string[] }

function render(state: State) {
  switch (state.status) {
    case 'loading': return "加载中..."
    case 'error':   return `错误: ${state.message.toUpperCase()}`
    case 'success': return `获取到 ${state.data.length} 条数据`
  }
}
```

```typescript title='src/demo.ts' mark={1, 6-7} add={3, 9} del={4, 10}
type State =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; data: string[] }

function render(state: State) {
  switch (state.status) {
    case 'loading':
      return '加载中...'
    case 'error':
      return `错误: ${state.message.toUpperCase()}`
    case 'success':
      return `获取到 ${state.data.length} 条数据`
  }
}
```

Notion 根本不支持。

如果只考虑实现的话，几条简单的正则就能完成转换。但是在嵌套块上，正则表达式可能出现意想不到的问题。因此在这一步，我选择开源项目
[notion_to_md](/2d16deba1ad28012bfdfc57973be71d5)
进行语法转换。notion_to_md 以 Notion 块为基本单位，因此定义自定义转换器后，可以任何将 Notion 块转换为我想要的格式。

```typescript
function installCustomTransformer(n2m: NotionToMarkdown, notion: Client) {
  n2m.setCustomTransformer('code', async (block: any) => {
    return parseEnhanceCodeBlock(block, n2m)
  })

  n2m.setCustomTransformer('callout', async (block: any) => {
    return parseCalloutBlock(block, n2m, notion)
  })
}
```

## 更进一步

现在的触发方式虽然已经很好，但是这个过程还不够轻量无感。我需要复制文章 ID、打开 Github、输入 ID 后运行工作流。

最理想的方式应该是借助 Notion 提供的 Button 和 Webhook 功能来做。借助这两个功能以及 Cloudflare
Workers，就能实现点击页面上的按钮发布文章，整体更加无感：

1. 点击 Notion Button，触发 Webhook 发送文章 ID；
2. Cloudflare Workers 接收到文章 ID，自动开始运行 Github Action Workflow；
3. 全自动、零代码、低心智负担的 CI/CD 流程。

但是 Webhook 是付费功能，我又付不起每个月 12 美元的 Plus 订阅，所以需要另辟蹊径。

最后我选择在 Cloudflare Pages 上再部署一个静态页面，包含输入 Page
ID 的文本框和按钮替代 Notion 的 Button 和 Webhook 功能，甚至还更加强大。由于这个页面是完全自定义的，我还可以从 Worker 上获取实时的部署进度，并且随时查看 Github
Action 和 Cloudflare Pages 构建的实时日志。
