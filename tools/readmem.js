// Lectura (solo lectura) de la memoria de configuración del ratón: 07 18 05 i DIR_L DIR_H 00 len-1 + GetFeature.
// Uso: node tools/readmem.js <dirección hex> <longitud> [bloque=8]
const HID = require('node-hid')
const d = HID.devices().find((x) => x.vendorId === 0x30fa && x.productId === 0x1040 && x.usagePage === 0xff01)
const h = new HID.HID(d.path)
const sleep = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms)
const start = parseInt(process.argv[2] || '18', 16), total = parseInt(process.argv[3] || '8'), blk = parseInt(process.argv[4] || '8')
const out = []
for (let a = start; a < start + total; a += blk) {
  const n = Math.min(blk, start + total - a)
  for (let i = 0; i < n; i++) {
    h.sendFeatureReport([0x07, 0x18, 0x05, i, a & 0xff, (a >> 8) & 0xff, 0x00, n - 1])
    sleep(2)
    out.push(h.getFeatureReport(7, 8)[1])
  }
  // Cierre de cada bloque (si no, el ratón repite el primero).
  h.sendFeatureReport([0x07, 0x18, 0, 0, 0, 0, 0, 0])
  sleep(2)
}
h.close()
for (let i = 0; i < out.length; i += 16) console.log((start + i).toString(16).padStart(4, '0'), out.slice(i, i + 16).map((b) => b.toString(16).padStart(2, '0')).join(' '))
