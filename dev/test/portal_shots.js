const {chromium,devices}=require('playwright');
(async()=>{const b=await chromium.launch();const errs=[];
for(const scheme of ['light','dark']){
  const ctx=await b.newContext({...devices['iPhone 13'],colorScheme:scheme});const p=await ctx.newPage();
  p.on('pageerror',e=>errs.push(String(e)));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
  await p.goto('http://127.0.0.1:8080/');await p.waitForTimeout(1500);
  await p.screenshot({path:`shots/portal_${scheme}.png`,fullPage:true});
  const w=await p.evaluate(()=>[document.documentElement.scrollWidth,innerWidth]);console.log(scheme,'width',w);
  // offline: game served from cache
  await p.click('a[data-id=tempo]');await p.waitForTimeout(1500);
  await ctx.setOffline(true);await p.goto('http://127.0.0.1:8080/strand/');await p.waitForTimeout(1500);
  console.log(scheme,'offline strand title:',await p.title());
  await p.goto('http://127.0.0.1:8080/');console.log(scheme,'offline portal title:',await p.title());
  await ctx.close()}
console.log('errors',errs.filter(e=>!/ERR_INTERNET_DISCONNECTED|Failed to load resource|fonts/.test(e)));await b.close()})();
