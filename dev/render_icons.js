const {chromium}=require('playwright');const fs=require('fs');const I=require('./src/icons.js');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:512,height:512}});
fs.mkdirSync('icons',{recursive:true});
for(const [k,svg] of Object.entries(I)){
  await p.setContent(`<html><body style="margin:0">${svg.replace('<svg ','<svg width="512" height="512" ')}</body></html>`);
  for(const s of [512,192,180]){await p.setViewportSize({width:512,height:512});const buf=await p.screenshot({clip:{x:0,y:0,width:512,height:512}});
    if(s===512)fs.writeFileSync(`icons/${k}-512.png`,buf);}
}
// sheet preview
await p.setViewportSize({width:7*140,height:140});
await p.setContent(`<body style="margin:0;display:flex;gap:10px;padding:10px;background:#ddd">${Object.values(I).map(s=>`<div style="width:120px;height:120px;border-radius:27px;overflow:hidden">${s.replace('<svg ','<svg width="120" height="120" ')}</div>`).join('')}</body>`);
await p.screenshot({path:'icons/sheet.png'});await b.close()})();
