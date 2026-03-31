import {
  CALLOUT_MARKER_REGEX,
  LEGACY_CALLOUT_REPLACEMENTS,
  SUPPORTED_CALLOUT_TYPES,
} from './constants.js'

export function assertSupportedCallouts(content: string, source: string): void {
  const lines = content.split(/\r?\n/)
  for (const [index, line] of lines.entries()) {
    const match = line.match(CALLOUT_MARKER_REGEX)
    if (!match?.groups?.type) continue

    const calloutType = match.groups.type.toLowerCase()
    if (SUPPORTED_CALLOUT_TYPES.has(calloutType)) continue

    const replacement = LEGACY_CALLOUT_REPLACEMENTS[calloutType]
    const hint = replacement ? ` Use "[!${replacement}]" instead.` : ''
    throw new Error(
      `Unsupported callout type "[!${calloutType}]" in ${source}:${index + 1}. Supported types: note, tip, warning, danger.${hint}`,
    )
  }
}
