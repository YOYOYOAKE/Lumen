import type { Plugin } from 'vite'
import { existsSync, statSync } from 'node:fs'
import {
  ARTICLE_MODULE_PREFIX,
  CONTENT_DIR,
  RESOLVED_ARTICLE_MODULE_PREFIX,
  RESOLVED_ID,
  SERIES_CONFIG_PATH,
  VIRTUAL_MODULE_ID,
} from './constants.js'
import {
  isContentRelatedFile,
  isMarkdownFile,
  isSeriesConfigFile,
  resolvePathVariants,
} from './helpers.js'
import { invalidateContentModules } from './hmr.js'
import { buildContentPayload, type BuiltContentPayload, createIndexModuleSource } from './payload.js'

export function contentPlugin(): Plugin {
  const contentDir = CONTENT_DIR
  const seriesConfigPath = SERIES_CONFIG_PATH
  const contentDirCandidates = resolvePathVariants(contentDir)
  const seriesConfigCandidates = resolvePathVariants(seriesConfigPath)
  let cachedPayload: BuiltContentPayload | null = null

  const ensurePayload = async () => {
    if (!cachedPayload) {
      cachedPayload = await buildContentPayload(contentDir)
    }
    return cachedPayload
  }

  const invalidateCache = () => {
    cachedPayload = null
  }

  return {
    name: 'lumen-content',
    buildStart() {
      console.info(`[lumen-content] content directory: ${contentDir}`)
      if (!existsSync(contentDir)) {
        throw new Error(`Content directory does not exist: ${contentDir}`)
      }
      if (!statSync(contentDir).isDirectory()) {
        throw new Error(`Content path is not a directory: ${contentDir}`)
      }
      invalidateCache()
    },
    resolveId(id) {
      if (id === VIRTUAL_MODULE_ID) return RESOLVED_ID
      if (id.startsWith(ARTICLE_MODULE_PREFIX)) return `\0${id}`
    },
    async load(id) {
      if (id === RESOLVED_ID) {
        const payload = await ensurePayload()
        this.addWatchFile(seriesConfigPath)
        for (const watchedFile of payload.watchedFiles) {
          this.addWatchFile(watchedFile)
        }
        return createIndexModuleSource(payload)
      }

      if (!id.startsWith(RESOLVED_ARTICLE_MODULE_PREFIX)) return

      const payload = await ensurePayload()
      const encodedKey = id.slice(RESOLVED_ARTICLE_MODULE_PREFIX.length)
      const lookupKey = decodeURIComponent(encodedKey)
      const body = payload.byLookupKey.get(lookupKey)

      if (!body) {
        throw new Error(`Unable to resolve article body for key "${lookupKey}"`)
      }

      return `export default ${JSON.stringify(body)};`
    },
    watchChange(id) {
      if (isSeriesConfigFile(id, seriesConfigCandidates)) {
        invalidateCache()
        return
      }
      if (!isContentRelatedFile(id, contentDirCandidates)) return
      if (!isMarkdownFile(id)) return
      invalidateCache()
    },
    handleHotUpdate(context) {
      if (isSeriesConfigFile(context.file, seriesConfigCandidates)) {
        invalidateContentModules(context, cachedPayload?.bodyModuleIds ?? new Set())
        invalidateCache()
        context.server.ws.send({ type: 'full-reload' })
        return []
      }
      if (!isContentRelatedFile(context.file, contentDirCandidates)) return
      if (!isMarkdownFile(context.file)) return

      invalidateContentModules(context, cachedPayload?.bodyModuleIds ?? new Set())
      invalidateCache()
      context.server.ws.send({ type: 'full-reload' })

      return []
    },
  }
}
