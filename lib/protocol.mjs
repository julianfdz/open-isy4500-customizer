/**
 * Protocolo del ratón ISY IGM 4500 WT (USB 30FA:1040, chip Instant Microelectronics).
 *
 * Es el mismo chip que OpenRGB soporta como «AntEsports GM600» (Controllers/InstantMouseController).
 * Todo va por feature reports de 8 bytes con report ID 0x07 en la colección vendor de la interfaz 1
 * (usage page 0xFF01, la COL04 de Windows). Comprobado en este ratón el 25/10/2026:
 *   - Modo:  07 13 FF MS DN 0B M0 00   (M = modo, S = velocidad 0-5, D = dirección, B = 0xF - brillo)
 *   - Color: 07 14 KG RB 00 00 00 00   (K = 2 × nivel de DPI 0-5; R, G, B = 0xF - canal/16: 4 bits invertidos)
 *   - Cada uno de los 6 niveles de DPI tiene su propio color.
 *   - Al pulsar el botón de DPI llega un input report por la colección 0xFF00 (COL03): 06 F6 0N, N = nivel 0-5.
 * Nada aquí escribe firmware: solo los dos comandos de iluminación de arriba.
 */

export const VID = 0x30fa
export const PID = 0x1040
export const REPORT_ID = 0x07
export const DPI_LEVELS = 6
export const SPEED_MAX = 5
export const BRIGHTNESS_MAX = 7

/**
 * Modos del firmware (valores de OpenRGB para el GM600, mismo PID). Excepción comprobada en el ISY:
 * 0x08 es la respiración de un color y 0x09 la multicolor (OpenRGB usa 0x09 como respiración simple en el GM600).
 */
export const MODES = [
  { id: 'static', name: 'Estático', value: 0x0a, color: true, brightness: true },
  { id: 'breathing', name: 'Respiración', value: 0x08, color: true, speed: true },
  { id: 'breathing-multi', name: 'Respiración multicolor', value: 0x09, speed: true },
  { id: 'rainbow', name: 'Ola arcoíris', value: 0x07, speed: true, direction: true },
  { id: 'spectrum', name: 'Ciclo de espectro', value: 0x06, speed: true },
  { id: 'fill', name: 'Llenar y vaciar', value: 0x03, speed: true, brightness: true, direction: true },
  { id: 'loop', name: 'Bucle', value: 0x04, speed: true, brightness: true, direction: true },
  { id: 'enraptured', name: 'Éxtasis', value: 0xbb, speed: true },
  { id: 'flicker', name: 'Parpadeo', value: 0xb8, speed: true },
  { id: 'ripple', name: 'Onda', value: 0xba, speed: true, direction: true },
  { id: 'startrek', name: 'Star Trek', value: 0xb9 },
  { id: 'off', name: 'Apagado', value: 0x0a }
]

export const DEFAULT_CONFIG = {
  mode: 'static',
  speed: 2,
  brightness: BRIGHTNESS_MAX,
  direction: 0,
  colors: ['#22e3ff', '#22e3ff', '#22e3ff', '#22e3ff', '#22e3ff', '#22e3ff']
}

const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, Math.round(Number(n) || 0)))

export function modeById(id) {
  const m = MODES.find((x) => x.id === id)
  if (!m) throw new Error(`Modo desconocido: ${id}. Modos: ${MODES.map((x) => x.id).join(', ')}`)
  return m
}

/** '#rrggbb' o 'rrggbb' → [r, g, b]. */
export function parseHex(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex).trim())
  if (!m) throw new Error(`Color no válido: ${hex} (usa #rrggbb)`)
  return [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16))
}

/** El ratón tiene 4 bits por canal: el color que de verdad se ve. */
export function quantize(hex) {
  return '#' + parseHex(hex).map((c) => ((c >> 4) * 17).toString(16).padStart(2, '0')).join('')
}

export function modePacket(mode, speed = 0, brightness = 0, direction = 0) {
  const v = mode.value
  return [REPORT_ID, 0x13, 0xff, ((v << 4) & 0xff) | (speed & 0xf), ((direction & 1) << 4) | 0x0b, 0xf - (brightness & 0xf), v & 0xf0, 0x00]
}

export function colorPacket(level, hex) {
  const [r, g, b] = parseHex(hex).map((c) => 0xf - (c >> 4))
  return [REPORT_ID, 0x14, ((level * 2) << 4) | g, (r << 4) | b, 0, 0, 0, 0]
}

/** Paquetes que aplican una configuración completa (los mismos que manda OpenRGB). */
export function packetsFor(config) {
  const c = { ...DEFAULT_CONFIG, ...config }
  const m = modeById(c.mode)
  if (m.id === 'off') return [modePacket(m, 0, 0, 0), ...Array.from({ length: DPI_LEVELS }, (_, i) => colorPacket(i, '#000000'))]
  const out = [
    modePacket(m, m.speed ? clamp(c.speed, 0, SPEED_MAX) : 0, m.brightness ? clamp(c.brightness, 0, BRIGHTNESS_MAX) : 0, m.direction ? clamp(c.direction, 0, 1) : 0)
  ]
  if (m.color) for (let i = 0; i < DPI_LEVELS; i++) out.push(colorPacket(i, c.colors[i] ?? c.colors[0]))
  return out
}

export const hex = (b) => Array.from(b, (x) => x.toString(16).padStart(2, '0')).join(' ')

const all = (c) => Array(DPI_LEVELS).fill(c)

/** Estilos predefinidos: una configuración completa cada uno. */
export const PRESETS = [
  { id: 'cian', name: 'Cian', config: { mode: 'static', brightness: 7, colors: all('#22e3ff') } },
  { id: 'blanco', name: 'Blanco puro', config: { mode: 'static', brightness: 7, colors: all('#ffffff') } },
  { id: 'rojo', name: 'Rojo', config: { mode: 'static', brightness: 7, colors: all('#ff0000') } },
  { id: 'matrix', name: 'Matrix', config: { mode: 'static', brightness: 7, colors: all('#00ff22') } },
  { id: 'violeta', name: 'Violeta', config: { mode: 'static', brightness: 7, colors: all('#9922ff') } },
  { id: 'fuego', name: 'Fuego por DPI', config: { mode: 'static', brightness: 7, colors: ['#ff0000', '#ff2200', '#ff4400', '#ff7700', '#ffaa00', '#ffdd00'] } },
  { id: 'hielo', name: 'Hielo por DPI', config: { mode: 'static', brightness: 7, colors: ['#ffffff', '#aaeeff', '#55ccff', '#2299ff', '#0055ff', '#2200ff'] } },
  { id: 'semaforo', name: 'Semáforo por DPI', config: { mode: 'static', brightness: 7, colors: ['#00ff00', '#77ff00', '#ffff00', '#ffaa00', '#ff5500', '#ff0000'] } },
  { id: 'arcoiris-dpi', name: 'Arcoíris por DPI', config: { mode: 'static', brightness: 7, colors: ['#ff0000', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#ff00ff'] } },
  { id: 'respira-cian', name: 'Respiración cian', config: { mode: 'breathing', speed: 2, colors: all('#22e3ff') } },
  { id: 'respira-rojo', name: 'Respiración roja', config: { mode: 'breathing', speed: 2, colors: all('#ff0000') } },
  { id: 'respira-multi', name: 'Respiración multicolor', config: { mode: 'breathing-multi', speed: 2 } },
  { id: 'ola', name: 'Ola arcoíris', config: { mode: 'rainbow', speed: 2, direction: 0 } },
  { id: 'espectro', name: 'Ciclo de espectro', config: { mode: 'spectrum', speed: 2 } },
  { id: 'apagado', name: 'Apagado', config: { mode: 'off' } }
]

/*
 * DPI (memoria de configuración, sacado del software oficial del Advance GTA 250, mismo chip).
 * Bloque 0x10: [0] función del botón 9 · [3] bit 4 del código de cada nivel (bit i = nivel i)
 *              [4] constante · [5..7] 4 bits bajos de los códigos, dos niveles por byte (nivel par en el nibble alto).
 * Códigos válidos: los 23 del software oficial (del 1 al 24 sin el 11). DPI aproximado = código × 200.
 */
export const DPI_BLOCK = 0x10
export const DPI_CODES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24]
export const FACTORY_DPI = [6, 8, 12, 13, 15, 18]
export const dpiOf = (code) => code * 200

export function decodeDpi(block) {
  const lo = [block[5] >> 4, block[5] & 15, block[6] >> 4, block[6] & 15, block[7] >> 4, block[7] & 15]
  return lo.map((l, i) => l | (((block[3] >> i) & 1) << 4))
}

/** Bloque nuevo con otros códigos, conservando los bytes que no son del DPI. */
export function encodeDpi(block, codes) {
  if (codes.length !== DPI_LEVELS) throw new Error(`Hacen falta ${DPI_LEVELS} valores de DPI.`)
  codes.forEach((c) => {
    if (!DPI_CODES.includes(c)) throw new Error(`Código de DPI no válido: ${c}. Válidos: ${DPI_CODES.join(', ')}`)
  })
  const b = [...block]
  b[3] = (block[3] & 0xc0) | codes.reduce((a, c, i) => a | (((c >> 4) & 1) << i), 0)
  b[5] = ((codes[0] & 15) << 4) | (codes[1] & 15)
  b[6] = ((codes[2] & 15) << 4) | (codes[3] & 15)
  b[7] = ((codes[4] & 15) << 4) | (codes[5] & 15)
  return b
}

/*
 * Mapa de botones (bloque 0x08): un byte por botón; los 5 bits bajos son la función y los altos, banderas que se conservan.
 * Solo se ofrecen funciones comprobadas en este ratón (25/10/2026). Sin confirmar: 0x0C (bajar DPI?), 0x09 (disparo?), 0x17.
 */
export const BUTTON_BLOCK = 0x08
export const BUTTONS = [
  { id: 'izquierdo', name: 'Botón izquierdo' },
  { id: 'derecho', name: 'Botón derecho' },
  { id: 'rueda', name: 'Clic de rueda' },
  { id: 'trasero', name: 'Lateral trasero' },
  { id: 'delantero', name: 'Lateral delantero' },
  { id: 'dpi', name: 'Botón DPI' }
]
export const FUNCTIONS = [
  { id: 'izquierdo', name: 'Clic izquierdo', code: 0x01 },
  { id: 'derecho', name: 'Clic derecho', code: 0x02 },
  { id: 'central', name: 'Clic central', code: 0x03 },
  { id: 'atras', name: 'Atrás', code: 0x04 },
  { id: 'adelante', name: 'Adelante', code: 0x05 },
  { id: 'ciclo-dpi', name: 'Siguiente nivel de DPI', code: 0x06 },
  { id: 'dpi-mas', name: 'Subir DPI (hasta el máximo)', code: 0x0b },
  { id: 'desactivado', name: 'Desactivado', code: 0x15 }
]
export const FACTORY_BUTTONS = [0x01, 0x02, 0x03, 0x04, 0x05, 0x06]
export const functionOf = (code) => FUNCTIONS.find((f) => f.code === code) ?? null

export const decodeButtons = (block) => BUTTONS.map((_, i) => block[i] & 0x1f)

/** Bloque nuevo con otras funciones para los 6 botones; conserva las banderas y los bytes 6-7. */
export function encodeButtons(block, codes) {
  if (codes.length !== BUTTONS.length) throw new Error(`Hacen falta ${BUTTONS.length} funciones, una por botón.`)
  codes.forEach((c) => {
    if (!functionOf(c)) throw new Error(`Función no permitida: 0x${c.toString(16)}`)
  })
  if (!codes.includes(0x01)) throw new Error('Algún botón tiene que quedar como clic izquierdo.')
  return block.map((b, i) => (i < BUTTONS.length ? (b & 0xe0) | codes[i] : b))
}
