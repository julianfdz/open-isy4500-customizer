/**
 * Acceso USB (node-hid) al teclado Sino Wealth 258A:0090. Solo luz: el protocolo está en keyboard-protocol.mjs.
 * El canal de control solo admite escrituras (leerlo da error), así que no se puede saber qué efecto tiene puesto.
 */
import HID from 'node-hid'
import { KB_PID, KB_RESTORE, KB_VID, kbKeyPackets, kbModePackets, kbRawPackets, kbStepPackets } from './keyboard-protocol.mjs'

export * from './keyboard-protocol.mjs'

/** Información del teclado conectado, o null. */
export function findKeyboard() {
  const all = HID.devices().filter((d) => d.vendorId === KB_VID && d.productId === KB_PID)
  const ctl = all.find((d) => d.usagePage === 0xff00 && d.usage === 2)
  if (!ctl) return null
  return { product: (ctl.product || '').trim(), manufacturer: (ctl.manufacturer || '').trim(), release: ctl.release, path: ctl.path }
}

function send(packets) {
  const info = findKeyboard()
  if (!info) throw new Error('No encuentro el teclado Sino Wealth (USB 258A:0090). ¿Está conectado?')
  const h = new HID.HID(info.path)
  try {
    packets.forEach((p) => h.sendFeatureReport(p))
  } finally {
    h.close()
  }
  return packets.length
}

/** Pone un efecto: { mode, brightness 0-4, speed 0-4, color }. */
export const setKbEffect = (effect) => send(kbModePackets(effect))

/** Colorea tecla a tecla: colors = { idTecla: '#rrggbb' }; keys = distribución (la de fábrica o la calibrada). */
export const setKbKeys = (colors, brightness = 4, keys) => send(kbKeyPackets(colors, brightness, keys))

/** Calibración: apaga todos los LEDs posibles (modo tecla a tecla). */
export const kbCalibStart = () => send(kbRawPackets({}))

/** Calibración: apaga el LED anterior y enciende el siguiente en blanco. */
export const kbCalibStep = (prev, cur) => send(kbStepPackets(prev, cur))

/** Vuelve a la luz de siempre (estático rojo). */
export const restoreKb = () => send(kbModePackets(KB_RESTORE))
