const HID=require('node-hid');
const all=HID.devices().filter(d=>d.vendorId===0x30FA&&d.productId===0x1040);
const f=new HID.HID(all.find(d=>d.usagePage===0xff01).path);
const ev=new HID.HID(all.find(d=>d.usagePage===0xff00).path);
ev.on('data',b=>console.log(Date.now()%100000,'COL03',Buffer.from(b).toString('hex')));
ev.on('error',e=>console.log('evErr',e.message));
let last='';const t=setInterval(()=>{const s=Buffer.from(f.getFeatureReport(7,8)).toString('hex');if(s!==last){console.log(Date.now()%100000,'FEAT',s);last=s}},100);
setTimeout(()=>{clearInterval(t);ev.close();f.close();process.exit(0)},25000);
