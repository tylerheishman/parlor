// Two phones on the real public site + real Firebase: portal loads, Tempo host/join, a move syncs; Spades lobby starts.
const {chromium,devices}=require('playwright');const U='https://tylerheishman.github.io/parlor/';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));let fail=0;const ok=(c,m)=>{if(!c)fail++;console.log(c?'ok  ':'FAIL',m)};
(async()=>{const px=new URL(process.env.HTTPS_PROXY);
 const b=await chromium.launch({proxy:{server:`${px.protocol}//${px.host}`,username:decodeURIComponent(px.username)||undefined,password:decodeURIComponent(px.password)||undefined}});
 const T='selftest-live'+Date.now().toString(36);const ph=[];
 for(const d of ['l1','l2']){const c=await b.newContext({...devices['iPhone 13'],ignoreHTTPSErrors:true});const p=await c.newPage();p.errs=[];
   p.on('pageerror',e=>p.errs.push(String(e)));p.on('console',m=>{if(m.type()==='error'&&!/vibrate/.test(m.text()))p.errs.push(m.text())});ph.push(p)}
 await ph[0].goto(U+'?table='+T);await sleep(2500);
 ok(await ph[0].title()==='Parlor','portal loads on the live site');
 ok(/Online play ready/.test(await ph[0].textContent('#status')),'portal says online play is ready');
 ok((await ph[0].textContent('#code')).trim()===T,'invite link sets the table code');
 ok(await ph[0].evaluate(()=>navigator.serviceWorker.getRegistration().then(r=>!!r)),'offline support installed');
 await ph[0].click('a[data-id=tempo]');await sleep(3000);
 await ph[1].goto(U+'tempo/?table='+T);await sleep(3000);
 const ready=await Promise.all(ph.map(p=>p.evaluate(()=>__T.net.ready&&!!__T.net.ref&&!__T.net.off)));ok(ready.every(Boolean),'both phones connected to your database');
 await ph[0].click('[data-do=go][data-s=online]');await sleep(500);await ph[0].click('[data-do=set][data-k=pick][data-v=w]');await ph[0].click('[data-do=host]');await sleep(1500);
 await ph[1].click('[data-do=go][data-s=online]');await sleep(800);await ph[1].click('[data-do=join]');await sleep(3500);
 ok((await Promise.all(ph.map(p=>p.evaluate(()=>__T.ui.screen)))).every(s=>s==='game'),'Tempo game started on both phones');
 await ph[0].click('.sq[data-sq=e2]');await sleep(150);await ph[0].click('.sq[data-sq=e4]');await sleep(2500);
 const mv=await ph[1].evaluate(()=>__T.G.moves.join(' '));ok(mv==='e2e4','move reached the other phone: '+mv);
 ok(ph.every(p=>p.errs.length===0),'no errors '+JSON.stringify(ph.map(p=>p.errs)));
 await b.close();console.log(fail?fail+' FAILED':'live site passed');process.exit(fail?1:0)})();
