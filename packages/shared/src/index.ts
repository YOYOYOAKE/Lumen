export const API_PREFIX = '/api/v1'

export const COLLECTIONS = ['posts', 'jottings', 'docs'] as const

export type Collection = (typeof COLLECTIONS)[number]
