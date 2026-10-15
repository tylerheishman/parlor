const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();
for(const g of ['','tempo/','strand/','furrow/','atoll/','spades/','setback/']){
  const ctx=await b.newContext({viewport:{width:390,height:844}});const p=await ctx.newPage();const errs=[];
  p.on('pageerror',e=>errs.push('PAGEERR '+e));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
  await p.goto('http://127.0.0.1:8080/'+g+'?dev=x1');await p.waitForTimeout(2500);
  const info=await p.evaluate(()=>({title:document.title,fam:window.FAMILY||null,net:typeof net!=='undefined'?{ready:net.ready,off:net.off,ref:!!net.ref}:'none',sw:!!navigator.serviceWorker.controller}));
  console.log(g||'portal',JSON.stringify(info),errs.slice(0,3));await ctx.close()}
await b.close()})();
