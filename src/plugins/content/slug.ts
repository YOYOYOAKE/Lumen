export function hashText(text: string): string {
  let hash = 0x811c9dc5
  for (const char of text) {
    hash ^= char.codePointAt(0) ?? 0
    hash = Math.imul(hash, 0x01000193) >>> 0
  }
  return hash.toString(16).padStart(8, '0')
}

export function buildArticleSlug(createdAt: string, title: string): string {
  const date = createdAt.slice(0, 10).replaceAll('-', '')
  const hash = hashText(title.trim()).slice(-8)
  return `${date}-${hash}`
}
