export * from './keyboard-protocol.mjs'
import type { KbEffect, KbKey } from './keyboard-protocol.mjs'

export function findKeyboard(): { product: string; manufacturer: string; release: number; path: string } | null
export function setKbEffect(effect: KbEffect): number
export function setKbKeys(colors: Record<string, string>, brightness?: number, keys?: KbKey[]): number
export function kbCalibStart(): number
export function kbCalibStep(prev: number | null, cur: number | null): number
export function restoreKb(): number
