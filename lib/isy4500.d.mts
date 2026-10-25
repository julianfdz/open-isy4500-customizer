export * from './protocol.mjs'
import type { LightConfig } from './protocol.mjs'

export interface MouseInfo {
  product: string
  manufacturer: string
  release: number
  controlPath: string
  eventPath: string | null
  interfaces: { interface: number; usagePage: number; usage: number }[]
}
export type MouseEvent = { type: 'dpi'; level: number } | { type: 'raw'; hex: string }

export function find(): MouseInfo | null
export function apply(config: Partial<LightConfig>): string[]
export function readState(): string
export function listen(cb: (e: MouseEvent) => void, onError?: (e: Error) => void): () => void
