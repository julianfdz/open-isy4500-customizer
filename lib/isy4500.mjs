/**
 * Acceso USB (node-hid) al ratón ISY IGM 4500 WT. El protocolo está en protocol.mjs.
 */
import HID from 'node-hid'
import { DPI_LEVELS, PID, REPORT_ID, VID, hex, packetsFor } from './protocol.mjs'

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
      // Cada pulsación manda dos informes: 0N con el nivel nuevo y 8N; el segundo no aporta nada.
      if (!(b[2] & 0x80)) cb({ type: 'dpi', level: b[2] & 0x0f })
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

