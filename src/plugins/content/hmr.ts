import type { HmrContext } from 'vite'
import { RESOLVED_ID } from './constants.js'

export function invalidateContentModules(context: HmrContext, moduleIds: Set<string>) {
  const { moduleGraph } = context.server

  const indexModule = moduleGraph.getModuleById(RESOLVED_ID)
  if (indexModule) {
    moduleGraph.invalidateModule(indexModule)
  }

  for (const moduleId of moduleIds) {
    const mod = moduleGraph.getModuleById(moduleId)
    if (mod) {
      moduleGraph.invalidateModule(mod)
    }
  }
}
