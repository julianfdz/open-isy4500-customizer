export interface ModeDef {
  id: string
  name: string
  value: number
  color?: boolean
  speed?: boolean
  brightness?: boolean
  direction?: boolean
}
export interface LightConfig {
  mode: string
  speed: number
  brightness: number
  direction: number
  colors: string[]
}
export const VID: number
export const PID: number
export const REPORT_ID: number
export const DPI_LEVELS: number
export const SPEED_MAX: number
export const BRIGHTNESS_MAX: number
export const MODES: ModeDef[]
export const DEFAULT_CONFIG: LightConfig
export function modeById(id: string): ModeDef
export function parseHex(hex: string): [number, number, number]
export function quantize(hex: string): string
export function modePacket(mode: ModeDef, speed?: number, brightness?: number, direction?: number): number[]
export function colorPacket(level: number, hex: string): number[]
export function packetsFor(config: Partial<LightConfig>): number[][]
export function hex(b: ArrayLike<number>): string
export interface Preset {
  id: string
  name: string
  config: Partial<LightConfig>
}
export const PRESETS: Preset[]
export const DPI_BLOCK: number
export const DPI_CODES: number[]
export const FACTORY_DPI: number[]
export function dpiOf(code: number): number
export function decodeDpi(block: ArrayLike<number>): number[]
export function encodeDpi(block: ArrayLike<number>, codes: number[]): number[]
export interface ButtonDef { id: string; name: string }
export interface FunctionDef { id: string; name: string; code: number }
export const BUTTON_BLOCK: number
export const BUTTONS: ButtonDef[]
export const FUNCTIONS: FunctionDef[]
export const FACTORY_BUTTONS: number[]
export function functionOf(code: number): FunctionDef | null
export function decodeButtons(block: ArrayLike<number>): number[]
export function encodeButtons(block: number[], codes: number[]): number[]
