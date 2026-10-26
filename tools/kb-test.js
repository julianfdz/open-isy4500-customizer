// Prueba de luz del teclado Sino Wealth 258A:0090 (protocolo OpenRGB «Genesis Thor 300»): solo iluminación.
// Uso: node tools/kb-test.js mode <modo> <brillo 0-4> <velocidad 0-4> <color 0-7>
//      node tools/kb-test.js key <tecla hex> <r> <g> <b>   (manda la tecla y el commit 0x89)
const HID = require('node-hid')
const d = HID.devices().find((x) => x.vendorId === 0x258a && x.productId === 0x0090 && x.usagePage === 0xff00 && x.usage === 2)
if (!d) throw new Error('No encuentro el canal 0x0A del teclado')
const h = new HID.HID(d.path)
const send = (...a) => { const p = [0x0a, ...a]; while (p.length < 8) p.push(0); console.log(p.map((b) => b.toString(16).padStart(2, '0')).join(' ')); h.sendFeatureReport(p) }
const [cmd, ...v] = process.argv.slice(2)
const n = v.map((x) => parseInt(x))
if (cmd === 'mode') { send(0x03, 0x01); send(0x0a, ...n) }
else if (cmd === 'key') { send(0x0c, 0x01, parseInt(v[0], 16), n[1], n[2], n[3]); send(0x0c, 0x01, 0x89, 0, 0, 0) }
h.close()
