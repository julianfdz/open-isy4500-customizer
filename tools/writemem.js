// Escribe un bloque de la memoria de configuración con la misma secuencia que el software oficial (Advance GTA 250):
//   07 18 03 i DIR_L DIR_H dato len-1   (cada byte)  → espera 4 ms
//   07 18 09 00 DIR_L DIR_H 00 len-1    (grabar)     → espera 2 ms
//   07 18 00 00 DIR_L DIR_H 00 00       (cierre)
// El cambio no se aplica hasta desenchufar y enchufar el ratón (lee la configuración al arrancar).
// --reload: 07 18 10 … recarga la configuración al momento (lo manda el software oficial al guardar); borra la luz de la RAM.
// Ojo: 0x08-0x0F es el MAPA DE BOTONES (21 22 23 24 25 26 = cada botón con su función); el 25/10/2026 escribir
// 26 en 0x08 convirtió el clic izquierdo en el botón DPI. Restaurar con la copia de backups/ y reenchufar.
// Uso: node tools/writemem.js <dirección hex> <bytes hex…> [--reload] --yes      (sin --yes solo enseña los paquetes)
const HID = require('node-hid')
const args = process.argv.slice(2)
const yes = args.includes('--yes'), reload = args.includes('--reload')
const [addrHex, ...rest] = args.filter((a) => !a.startsWith('--'))
const addr = parseInt(addrHex, 16), data = rest.map((b) => parseInt(b, 16))
if (!(addr >= 8) || data.length < 1 || data.length > 8 || data.some((b) => !(b >= 0 && b <= 255))) {
  console.error('Uso: node tools/writemem.js <dir hex ≥ 08> <1-8 bytes hex> --yes  (la cabecera 0x00 no se toca)')
  process.exit(1)
}
const n = data.length
const pkts = data.map((b, i) => [7, 0x18, 3, i, addr & 0xff, addr >> 8, b, n - 1])
const commit = [[7, 0x18, 9, 0, addr & 0xff, addr >> 8, 0, n - 1], [7, 0x18, 0, 0, addr & 0xff, addr >> 8, 0, 0]]
const hex = (p) => p.map((b) => b.toString(16).padStart(2, '0')).join(' ')
if (!yes) {
  ;[...pkts, ...commit].forEach((p) => console.log(hex(p)))
  console.log('(simulación: añade --yes para enviarlo)')
  process.exit(0)
}
const d = HID.devices().find((x) => x.vendorId === 0x30fa && x.productId === 0x1040 && x.usagePage === 0xff01)
const h = new HID.HID(d.path)
const sleep = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms)
pkts.forEach((p) => h.sendFeatureReport(p))
sleep(4)
h.sendFeatureReport(commit[0]); sleep(2)
h.sendFeatureReport(commit[1])
if (reload) { sleep(2); h.sendFeatureReport([7, 0x18, 0x10, 0, 0, 0, 0, 0]); sleep(5); h.sendFeatureReport([7, 0x18, 0, 0, 0, 0, 0, 0]); sleep(50) }
h.close()
console.log(`escrito en 0x${addr.toString(16)}: ${hex(data)} ${reload ? ' + recarga' : ' (se aplica al reenchufar el ratón)'}`)
