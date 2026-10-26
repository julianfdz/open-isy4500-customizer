export interface KbColor { id: string; name: string; value: number; css: string }
export interface KbMode { id: string; name: string; value: number; color?: boolean; custom?: boolean }
export interface KbKey { id: string; label: string; idx: number; row: number; col: number; w: number; code?: string; x?: number; top?: number; h?: number }
export interface KbEffect { mode: string; brightness?: number; speed?: number; color?: string }
export interface KbCalibEntry { led: number; code: string }
export const KB_VID: number
export const KB_PID: number
export const KB_REPORT_ID: number
export const KB_COMMIT_KEY: number
export const KB_BRIGHTNESS_MAX: number
export const KB_SPEED_MAX: number
export const KB_COLORS: KbColor[]
export const KB_MODES: KbMode[]
export const KB_KEYS: KbKey[]
export const KB_RESTORE: Required<KbEffect>
export const KB_PRESETS: { id: string; name: string }[]
export const KB_TEMPLATES: { id: string; name: string; colors: (keys?: KbKey[]) => Record<string, string> }[]
export const KB_TEXT_MAX: number
export const kbTextChars: string
export const KB_LED_MAX: number
export const KB_CALIB_LEDS: number[]
export function kbModeById(id: string): KbMode
export function kbModePackets(effect: KbEffect): number[][]
export function kbKeyPackets(colors: Record<string, string>, brightness?: number, keys?: KbKey[]): number[][]
export function kbPreset(id: string, keys?: KbKey[]): Record<string, string>
export function kbText(text: string, fg?: string, bg?: string, keys?: KbKey[]): { colors: Record<string, string>; lost: number; total: number }
export function kbRawPackets(colorsByLed: Record<number, string>, brightness?: number): number[][]
export function kbStepPackets(prev: number | null, cur: number | null): number[][]
export function kbCodeLabel(code: string): string
export function kbKeysFromCalibration(entries: KbCalibEntry[]): KbKey[]
