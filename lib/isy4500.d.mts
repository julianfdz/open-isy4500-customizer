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
export interface DpiState {
  codes: number[]
  active: number
  enabled: number
  block: string
}
export function getDpi(): DpiState
export function setDpi(codes: number[], opts?: { applyNow?: boolean }): { changed: boolean; codes: number[]; before?: string; after?: string }
export function setActiveLevel(level: number): { changed: boolean; active: number }
export function getButtons(): { codes: number[]; block: string }
export function setButtons(codes: number[]): { changed: boolean; codes: number[]; before?: string; after?: string }
