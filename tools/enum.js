const HID=require('node-hid');
const ds=HID.devices().filter(d=>d.vendorId===0x30FA);
for(const d of ds) console.log(JSON.stringify({path:d.path,iface:d.interface,usagePage:d.usagePage.toString(16),usage:d.usage.toString(16),product:d.product,manufacturer:d.manufacturer,release:d.release}));
