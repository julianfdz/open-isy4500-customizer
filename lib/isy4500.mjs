/**
 * Acceso USB (node-hid) al ratón ISY IGM 4500 WT. El protocolo está en protocol.mjs.
 */
import HID from 'node-hid'
import { BUTTON_BLOCK, DPI_BLOCK, DPI_LEVELS, PID, REPORT_ID, VID, decodeButtons, decodeDpi, encodeButtons, encodeDpi, hex, packetsFor } from './protocol.mjs'

export * from './protocol.mjs'

const isOurs = (d) => d.vendorId === VID && d.productId === PID

/** Información del ratón conectado, o null. */
export function find() {
  const all = HID.devices().filter(isOurs)
  const ctl = all.find((d) => d.usagePage === 0xff01)
  if (!ctl) return null
  return {
    product: (ctl.product || '').trim(),
    manufacturer: (ctl.manufacturer || '').trim(),
    release: ctl.release,
    controlPath: ctl.path,
    eventPath: all.find((d) => d.usagePage === 0xff00)?.path ?? null,
    interfaces: all.map((d) => ({ interface: d.interface, usagePage: d.usagePage, usage: d.usage }))
  }
}

function withControl(fn) {
  const info = find()
  if (!info) throw new Error('No encuentro el ratón ISY IGM 4500 (USB 30FA:1040). ¿Está conectado?')
  const h = new HID.HID(info.controlPath)
  try {
    return fn(h)
  } finally {
    h.close()
  }
}

/** Envía la configuración al ratón. Devuelve los paquetes enviados (hex). */
export function apply(config) {
  const pkts = packetsFor(config)
  withControl((h) => pkts.forEach((p) => h.sendFeatureReport(p)))
  return pkts.map(hex)
}

/** Lee (solo lectura) el feature report 0x07: estado interno sin documentar. */
export function readState() {
  return withControl((h) => hex(h.getFeatureReport(REPORT_ID, 8)))
}

/**
 * Escucha el canal de eventos del ratón (colección 0xFF00).
 * cb({ type: 'dpi', level }) al cambiar de nivel de DPI; cb({ type: 'raw', hex }) con cualquier otro informe,
 * para poder descubrir qué más manda (el botón de modos RGB, por ejemplo).
 * Devuelve una función para dejar de escuchar. onError se llama si el ratón se desconecta.
 */
export function listen(cb, onError) {
  const info = find()
  if (!info?.eventPath) throw new Error('No encuentro el canal de eventos del ratón.')
  const h = new HID.HID(info.eventPath)
  h.on('data', (b) => {
    if (b[0] === 0x06 && b[1] === 0xf6 && (b[2] & 0x0f) < DPI_LEVELS) {
      // Cada pulsación manda dos informes: 0N (el nivel de antes) y 8N (el nivel nuevo). Vale el segundo.
      if (b[2] & 0x80) cb({ type: 'dpi', level: b[2] & 0x0f })
    } else cb({ type: 'raw', hex: hex(b) })
  })
  h.on('error', (e) => {
    try { h.close() } catch { /* ya cerrado */ }
    onError?.(e)
  })
  return () => {
    try { h.close() } catch { /* ya cerrado */ }
  }
}


/*
 * Memoria de configuración (07 18 …), con la misma secuencia que el software oficial:
 *   leer:   07 18 05 i DIR_L DIR_H 00 len-1 + GetFeature (byte 1)  · cierre 07 18 00 … tras cada bloque
 *   grabar: 07 18 03 i DIR_L DIR_H dato len-1 (cada byte) → 07 18 09 00 DIR_L DIR_H 00 len-1 → 07 18 00 00 DIR_L DIR_H 00 00
 *   recargar: 07 18 10 00 … → 07 18 00 … (aplica la memoria al momento; borra los colores puestos en RAM)
 * Solo se escriben tres bloques: 0x08 (botones, con funciones comprobadas y siempre con un clic izquierdo), 0x10 (DPI) y
 * 0x18 (nivel activo). Un error en 0x08 deja el ratón sin clic izquierdo hasta restaurarlo.
 */
const sleep = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms)

function readBlock(h, addr, n = 8) {
  const out = []
  for (let i = 0; i < n; i++) {
    h.sendFeatureReport([REPORT_ID, 0x18, 0x05, i, addr & 0xff, addr >> 8, 0, n - 1])
    sleep(2)
    out.push(h.getFeatureReport(REPORT_ID, 8)[1])
  }
  h.sendFeatureReport([REPORT_ID, 0x18, 0, 0, 0, 0, 0, 0])
  sleep(2)
  return out
}

const STATE_BLOCK = 0x18

function writeBlock(h, addr, data) {
  if (![BUTTON_BLOCK, DPI_BLOCK, STATE_BLOCK].includes(addr)) throw new Error('Solo se permite escribir los bloques de botones (0x08), DPI (0x10) y nivel activo (0x18).')
  const n = data.length
  data.forEach((b, i) => h.sendFeatureReport([REPORT_ID, 0x18, 0x03, i, addr & 0xff, addr >> 8, b, n - 1]))
  sleep(4)
  h.sendFeatureReport([REPORT_ID, 0x18, 0x09, 0, addr & 0xff, addr >> 8, 0, n - 1])
  sleep(2)
  h.sendFeatureReport([REPORT_ID, 0x18, 0, 0, addr & 0xff, addr >> 8, 0, 0])
  sleep(2)
}

function reload(h) {
  h.sendFeatureReport([REPORT_ID, 0x18, 0x10, 0, 0, 0, 0, 0])
  sleep(5)
  h.sendFeatureReport([REPORT_ID, 0x18, 0, 0, 0, 0, 0, 0])
  sleep(50)
}

/** DPI guardado en el ratón: códigos por nivel, nivel activo (0-5) y niveles habilitados. */
export function getDpi() {
  return withControl((h) => {
    const dpi = readBlock(h, DPI_BLOCK)
    const state = readBlock(h, STATE_BLOCK)
    return { codes: decodeDpi(dpi), active: state[0] & 7, enabled: state[1] & 0x3f, block: hex(dpi) }
  })
}

/**
 * Graba los códigos de DPI (uno por nivel). Lee el bloque, cambia solo el DPI, comprueba lo escrito
 * y, con applyNow, recarga el ratón para que se note sin reenchufar (después hay que volver a mandar la luz).
 */
export function setDpi(codes, { applyNow = true } = {}) {
  return withControl((h) => {
    const before = readBlock(h, DPI_BLOCK)
    const after = encodeDpi(before, codes)
    if (hex(after) === hex(before)) return { changed: false, codes: decodeDpi(before) }
    writeBlock(h, DPI_BLOCK, after)
    const check = readBlock(h, DPI_BLOCK)
    if (hex(check) !== hex(after)) {
      // Algo no cuadra: se deja como estaba.
      writeBlock(h, DPI_BLOCK, before)
      throw new Error(`El ratón no ha guardado bien el DPI (leído ${hex(check)}); se ha restaurado el anterior.`)
    }
    if (applyNow) reload(h)
    return { changed: true, codes: decodeDpi(check), before: hex(before), after: hex(check) }
  })
}

/** Cambia el nivel de DPI activo (0-5) sin pulsar el botón: graba los 3 bits del nivel en 0x18 y recarga. */
export function setActiveLevel(level) {
  if (!Number.isInteger(level) || level < 0 || level >= DPI_LEVELS) throw new Error(`Nivel no válido: ${level}`)
  return withControl((h) => {
    const before = readBlock(h, STATE_BLOCK)
    if (!((before[1] >> level) & 1)) throw new Error(`El nivel ${level + 1} está deshabilitado en el ratón.`)
    const after = [...before]
    after[0] = (before[0] & 0xf8) | level
    if (after[0] === before[0]) return { changed: false, active: level }
    writeBlock(h, STATE_BLOCK, after)
    const check = readBlock(h, STATE_BLOCK)
    if (hex(check) !== hex(after)) {
      writeBlock(h, STATE_BLOCK, before)
      throw new Error(`El ratón no ha guardado bien el nivel (leído ${hex(check)}); se ha restaurado el anterior.`)
    }
    reload(h)
    return { changed: true, active: level }
  })
}

/** Función de cada botón físico (códigos de FUNCTIONS). */
export function getButtons() {
  return withControl((h) => {
    const block = readBlock(h, BUTTON_BLOCK)
    return { codes: decodeButtons(block), block: hex(block) }
  })
}

/** Graba las funciones de los 6 botones, comprueba lo escrito y recarga (después hay que volver a mandar la luz). */
export function setButtons(codes) {
  return withControl((h) => {
    const before = readBlock(h, BUTTON_BLOCK)
    const after = encodeButtons(before, codes)
    if (hex(after) === hex(before)) return { changed: false, codes: decodeButtons(before) }
    writeBlock(h, BUTTON_BLOCK, after)
    const check = readBlock(h, BUTTON_BLOCK)
    if (hex(check) !== hex(after)) {
      writeBlock(h, BUTTON_BLOCK, before)
      throw new Error(`El ratón no ha guardado bien los botones (leído ${hex(check)}); se ha restaurado el anterior.`)
    }
    reload(h)
    return { changed: true, codes: decodeButtons(check), before: hex(before), after: hex(check) }
  })
}
