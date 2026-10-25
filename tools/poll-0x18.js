// Solo lectura: relee 0x10-0x1F cada 300 ms y muestra cada cambio (para ver dónde guarda el nivel de DPI).
const HID = require('node-hid')
const d = HID.devices().find((x) => x.vendorId === 0x30fa && x.productId === 0x1040 && x.usagePage === 0xff01)
const h = new HID.HID(d.path)
const sleep = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms)
function read(a) {
  const out = []
  for (let i = 0; i < 8; i++) { h.sendFeatureReport([7, 0x18, 5, i, a & 0xff, a >> 8, 0, 7]); sleep(2); out.push(h.getFeatureReport(7, 8)[1]) }
  h.sendFeatureReport([7, 0x18, 0, 0, 0, 0, 0, 0]); sleep(2)
  return out
}
const secs = Number(process.argv[2] || 40)
let last = ''
const end = Date.now() + secs * 1000
while (Date.now() < end) {
  const s = [...read(0x10), ...read(0x18)].map((b) => b.toString(16).padStart(2, '0')).join(' ')
  if (s !== last) { console.log(new Date().toLocaleTimeString(), s); last = s }
  sleep(300)
}
h.close()
