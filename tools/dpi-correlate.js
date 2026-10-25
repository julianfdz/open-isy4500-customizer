// Solo lectura: al pulsar el botón de DPI, relee 0x00-0x7F y muestra qué bytes cambian.
const HID = require('node-hid')
const all = HID.devices().filter((x) => x.vendorId === 0x30fa && x.productId === 0x1040)
const ctl = new HID.HID(all.find((x) => x.usagePage === 0xff01).path)
const ev = new HID.HID(all.find((x) => x.usagePage === 0xff00).path)
const sleep = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms)
function read(start, total) {
  const out = []
  for (let a = start; a < start + total; a += 8) {
    for (let i = 0; i < 8; i++) { ctl.sendFeatureReport([7, 0x18, 5, i, a & 0xff, a >> 8, 0, 7]); sleep(2); out.push(ctl.getFeatureReport(7, 8)[1]) }
    ctl.sendFeatureReport([7, 0x18, 0, 0, 0, 0, 0, 0]); sleep(2)
  }
  return out
}
let prev = read(0, 0x80)
let busy = false
ev.on('data', (b) => {
  if (busy || b[1] !== 0xf6 || b[2] & 0x80) return
  busy = true
  setTimeout(() => {
    const cur = read(0, 0x80)
    const diff = cur.map((v, i) => (v !== prev[i] ? `${i.toString(16)}:${prev[i].toString(16)}→${v.toString(16)}` : null)).filter(Boolean)
    console.log(`DPI nivel ${b[2] & 0xf} (índice) | cambios: ${diff.join(' ') || 'ninguno'}`)
    prev = cur; busy = false
  }, 150)
})
setTimeout(() => { ev.close(); ctl.close(); process.exit(0) }, 30000)
console.log('listo')
