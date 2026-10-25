const HID=require('node-hid');
const d=HID.devices().find(d=>d.vendorId===0x30FA&&d.productId===0x1040&&d.usagePage===0xff01);
const h=new HID.HID(d.path);
const rd=()=>Buffer.from(h.getFeatureReport(7,8)).toString('hex');
console.log('antes ',rd());
const [r,g,b]=(process.argv[2]||'ff0000').match(/../g).map(x=>parseInt(x,16));
const mode=[0x07,0x13,0xFF,(0x0A<<4)&0xFF|0,(0<<4)|0xB,0xF-7,0x0A&0xF0,0x00];
console.log('modo  ',Buffer.from(mode).toString('hex')); h.sendFeatureReport(mode);
const R=0xF-(r>>4),G=0xF-(g>>4),B=0xF-(b>>4);
for(let i=0;i<=0xA;i+=2){const p=[0x07,0x14,(i<<4)|G,(R<<4)|B,0,0,0,0]; h.sendFeatureReport(p); if(i==0)console.log('color ',Buffer.from(p).toString('hex'));}
console.log('después',rd());
h.close();
