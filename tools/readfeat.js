const HID=require('node-hid');
const d=HID.devices().find(d=>d.vendorId===0x30FA&&d.usagePage===0xff01);
const h=new HID.HID(d.path);
for(let i=0;i<3;i++){ try{console.log(Buffer.from(h.getFeatureReport(7,8)).toString('hex'))}catch(e){console.log('ERR',e.message)} }
h.close();
