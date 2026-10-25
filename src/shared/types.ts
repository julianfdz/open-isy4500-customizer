import type { LightConfig } from '../../lib/protocol.mjs'

export type { LightConfig, ModeDef, Preset } from '../../lib/protocol.mjs'

export interface Device {
  connected: boolean
  product?: string
  manufacturer?: string
  release?: number
  interfaces?: { interface: number; usagePage: number; usage: number }[]
}

export interface Saved {
  config: LightConfig
  reapplyOnStart: boolean
}

export interface DpiState {
  codes: number[]
  active: number
  enabled: number
}

export type DpiResult = { ok: true; state: DpiState } | { ok: false; error: string }

export type ButtonsResult = { ok: true; codes: number[] } | { ok: false; error: string }

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
  onDevice(cb: (d: Device) => void): () => void
  onMouse(cb: (e: MouseEvent) => void): () => void
  onSaved(cb: (s: Saved) => void): () => void
}
