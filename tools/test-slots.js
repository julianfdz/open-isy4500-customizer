const HID=require('node-hid');
const d=HID.devices().find(d=>d.vendorId===0x30FA&&d.productId===0x1040&&d.usagePage===0xff01);
const h=new HID.HID(d.path);
h.sendFeatureReport([0x07,0x13,0xFF,0xA0,0x0B,0x08,0x00,0x00]);
const cols=['ff0000','00ff00','0000ff','ffff00','ff00ff','00ffff'];
cols.forEach((c,k)=>{const [r,g,b]=c.match(/../g).map(x=>parseInt(x,16));const R=0xF-(r>>4),G=0xF-(g>>4),B=0xF-(b>>4);
 h.sendFeatureReport([0x07,0x14,((2*k)<<4)|G,(R<<4)|B,0,0,0,0]);});
h.close(); console.log('ok');
