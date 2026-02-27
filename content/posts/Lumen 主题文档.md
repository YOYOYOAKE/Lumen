---
title: 'Lumen 主题文档'
slug: '20251221-bb5c'
description: '基于当前仓库实现的内容规范与写作语法说明。'
createdAt: '2025-12-21 12:00'
updatedAt: '2026-02-27 23:15'
completed: true
top: true
tags: ['Lumen']
---

## 配置与内容组织

### 配置

### 内容组织

内容目录约定如下：

- 系列配置：`src/config/series.ts`
- 文章文件：`content/<series>/<file>.md`
- 或子系列文章：`content/<series>/<subSeries>/<file>.md`
- 子系列（`subSeries`）由目录结构自动识别，名称取子目录名

Frontmatter 字段约束：

- 必填：`slug`、`title`、`description`、`createdAt`
- 可选：`updatedAt`、`completed`、`top`、`tags`
- 时间格式必须是 `YYYY-MM-DD HH:mm`

系列配置编码在 `src/config/series.ts` 中。

站点配置编码在 `src/config/index.ts` 中。

可配置项主要包括：

- 站点基础信息（`siteConfig`）
- 头部/底部导航（`navigationConfig`）
- 页面配置（`pagesConfig`，包括 Home、Friends、Tags）

## 写作语法

### 标准 Markdown

Lumen 遵循标准 Markdown 渲染规则。为保持结构清晰，建议正文从二级标题开始。

### 标注

支持 4 类标注：`note`、`tip`、`warning`、`danger`。

示例：

```md
> [!note] 这里是一条笔记
> 经砖家研究，21 世纪出生的儿童无一活过三十岁。
```

> [!note] 这里是一条笔记
> 经砖家研究，21 世纪出生的儿童无一活过三十岁。

```md
> [!tip] 温馨提示
> 砖家建议不要在空腹的状态下进食。
```

> [!tip] 温馨提示
> 砖家建议不要在空腹的状态下进食。

```md
> [!warning] 重要说明
> 口渴的时候一定要喝水。
```

> [!warning] 重要说明
> 口渴的时候一定要喝水。

```md
> [!danger] 当心
> 水是剧毒的。
```

> [!danger] 当心
> 水是剧毒的。

### 代码块

当前版本支持标准 fenced code block + Shiki 高亮。

```typescript
function render(state: 'loading' | 'success' | 'error') {
  switch (state) {
    case 'loading':
      return '加载中...'
    case 'success':
      return '成功'
    case 'error':
      return '失败'
  }
}
```
