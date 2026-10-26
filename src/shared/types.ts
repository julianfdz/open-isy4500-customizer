import type { LightConfig } from '../../lib/protocol.mjs'
import type { KbCalibEntry, KbEffect } from '../../lib/keyboard-protocol.mjs'

export type { LightConfig, ModeDef, Preset } from '../../lib/protocol.mjs'

export interface Device {
  connected: boolean
  product?: string
  manufacturer?: string
  release?: number
  interfaces?: { interface: number; usagePage: number; usage: number }[]
}

/** Luz del teclado: efecto del firmware o tecla a tecla. */
export interface KbSaved {
  effect: Required<KbEffect>
  keys: Record<string, string>
  perKey: boolean
  /** Qué LED hay bajo cada tecla física de este teclado (si se ha calibrado). */
  calibration?: KbCalibEntry[]
}

export interface Saved {
  config: LightConfig
  reapplyOnStart: boolean
  keyboard?: KbSaved
}

export interface DpiState {
  codes: number[]
  active: number
  enabled: number
}

export type DpiResult = { ok: true; state: DpiState } | { ok: false; error: string }

export type ButtonsResult = { ok: true; codes: number[] } | { ok: false; error: string }

export type KbResult = { ok: true } | { ok: false; error: string }

export type ApplyResult = { ok: true; packets: string[] } | { ok: false; error: string }

/** Lo que llega del ratón: nivel de DPI o un informe sin interpretar. */
export type MouseEvent = { type: 'dpi'; level: number; at: number } | { type: 'raw'; hex: string; at: number }

export interface Api {
  device(): Promise<Device>
  saved(): Promise<Saved>
  save(s: Saved): Promise<void>
  apply(config: LightConfig): Promise<ApplyResult>
  readState(): Promise<string | null>
  getDpi(): Promise<DpiResult>
  setDpi(codes: number[]): Promise<DpiResult>
  setLevel(level: number): Promise<DpiResult>
  getButtons(): Promise<ButtonsResult>
  setButtons(codes: number[]): Promise<ButtonsResult>
  appInfo(): Promise<{ version: string; cli: string }>
  kbStatus(): Promise<{ connected: boolean; product?: string }>
  kbApply(kb: KbSaved): Promise<KbResult>
  kbRestore(): Promise<KbResult>
  kbCalibStart(): Promise<KbResult>
  kbCalibStep(prev: number | null, cur: number | null): Promise<KbResult>
  onKb(cb: (s: { connected: boolean; product?: string }) => void): () => void
  onDevice(cb: (d: Device) => void): () => void
  onMouse(cb: (e: MouseEvent) => void): () => void
  onSaved(cb: (s: Saved) => void): () => void
}
