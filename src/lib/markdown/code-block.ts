import { CODE_BLOCK_COPIED_ICON, CODE_BLOCK_COPY_ICON } from './constants.js'

export function escapeHtml(input: string): string {
  return input
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

export function buildCodeBlockHeader(label: string): string {
  const copyButtonHtml =
    `<button class="code-block-copy" type="button" aria-label="Copy code" title="Copy code">` +
    `<span class="code-block-copy-icon code-block-copy-icon-clipboard" aria-hidden="true">${CODE_BLOCK_COPY_ICON}</span>` +
    `<span class="code-block-copy-icon code-block-copy-icon-check" aria-hidden="true">${CODE_BLOCK_COPIED_ICON}</span>` +
    '</button>'

  return `<div class="code-block-header"><span class="code-block-lang">${label}</span>${copyButtonHtml}</div>`
}

export function buildPlainTextCodeBlock(codeText: string, label: string): string {
  const escapedCode = escapeHtml(codeText)
  const escapedLabel = escapeHtml(label)
  const headerHtml = buildCodeBlockHeader(escapedLabel)

  return `<figure class="code-block">${headerHtml}<pre><code>${escapedCode}</code></pre></figure>`
}
