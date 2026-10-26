// Enciende en blanco solo los LEDs indicados del teclado Sino Wealth (el resto apagado). Uso: node tools/kb-light.js 14 21 22 …
const HID = require('node-hid')
import('../lib/keyboard-protocol.mjs').then((m) => {
  const d = HID.devices().find((x) => x.vendorId === 0x258a && x.productId === 0x0090 && x.usagePage === 0xff00 && x.usage === 2)
  const h = new HID.HID(d.path)
  const leds = process.argv.slice(2).map(Number)
  m.kbRawPackets(Object.fromEntries(leds.map((l) => [l, '#ffffff']))).forEach((p) => h.sendFeatureReport(p))
  h.close()
  console.log('encendidos:', leds.join(' '))
})
