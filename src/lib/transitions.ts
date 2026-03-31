export type SceneKind = 'standard' | 'article' | 'plain'

type TransitionClassProps = {
  mode: 'out-in'
  enterActiveClass: string
  enterToClass: string
  leaveActiveClass: string
  enterFromClass: string
  leaveFromClass: string
  leaveToClass: string
}

export const standardSceneTransitionProps: TransitionClassProps = {
  mode: 'out-in',
  enterActiveClass: 'scene-fade-enter-active',
  enterToClass: 'scene-fade-enter-to',
  leaveActiveClass: 'scene-fade-leave-active',
  enterFromClass: 'scene-fade-enter-from',
  leaveFromClass: 'scene-fade-leave-from',
  leaveToClass: 'scene-fade-leave-to',
}

export const articleSceneTransitionProps: TransitionClassProps = {
  mode: 'out-in',
  enterActiveClass: 'article-scene-enter-active',
  enterToClass: 'article-scene-enter-to',
  leaveActiveClass: 'article-scene-leave-active',
  enterFromClass: 'article-scene-enter-from',
  leaveFromClass: 'article-scene-leave-from',
  leaveToClass: 'article-scene-leave-to',
}

export const standardToArticleTransitionProps: TransitionClassProps = {
  mode: 'out-in',
  enterActiveClass: 'article-scene-enter-active',
  enterToClass: 'article-scene-enter-to',
  leaveActiveClass: 'scene-fade-leave-active',
  enterFromClass: 'article-scene-enter-from',
  leaveFromClass: 'scene-fade-leave-from',
  leaveToClass: 'scene-fade-leave-to',
}

export const standardAfterArticleTransitionProps: TransitionClassProps = {
  mode: 'out-in',
  enterActiveClass: 'scene-fade-enter-active',
  enterToClass: 'scene-fade-enter-to',
  leaveActiveClass: 'scene-fade-leave-active',
  enterFromClass: 'scene-fade-enter-from',
  leaveFromClass: 'scene-fade-leave-from',
  leaveToClass: 'scene-fade-leave-to',
}

export const articleContentTransitionProps: TransitionClassProps = {
  mode: 'out-in',
  enterActiveClass: 'article-content-enter-active',
  enterToClass: 'article-content-enter-to',
  leaveActiveClass: 'article-content-leave-active',
  enterFromClass: 'article-content-enter-from',
  leaveFromClass: 'article-content-leave-from',
  leaveToClass: 'article-content-leave-to',
}

export const standardContentTransitionProps: TransitionClassProps = {
  mode: 'out-in',
  enterActiveClass: 'standard-content-enter-active',
  enterToClass: 'standard-content-enter-to',
  leaveActiveClass: 'standard-content-leave-active',
  enterFromClass: 'standard-content-enter-from',
  leaveFromClass: 'standard-content-leave-from',
  leaveToClass: 'standard-content-leave-to',
}

export function resolveAppSceneTransitionProps(
  currentScene: SceneKind,
  previousScene: SceneKind,
): TransitionClassProps {
  if (currentScene === 'article' && previousScene === 'standard') {
    return standardToArticleTransitionProps
  }

  if (currentScene === 'article') {
    return articleSceneTransitionProps
  }

  if (previousScene === 'article') {
    return standardAfterArticleTransitionProps
  }

  return standardSceneTransitionProps
}
