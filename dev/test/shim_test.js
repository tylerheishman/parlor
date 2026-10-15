// Conformance test of shim.js against the Firebase database emulator, in real browsers (separate devices).
const {chromium}=require('playwright');
const B='http://127.0.0.1:8080/';let fail=0;const ok=(c,m)=>{if(!c){fail++;console.log('FAIL',m)}else console.log('ok  ',m)};
(async()=>{
  const b=await chromium.launch();const pages=[];
  for(const d of ['a1','b2','c3']){const ctx=await b.newContext();const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e)));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
    await p.goto(B+'shim_probe.html?dev='+d+'&table=t'+process.pid);p.errs=errs;pages.push(p)}
  const [A,Bp,C]=pages;
  const r=await A.evaluate(async()=>{const db=await claude.use('db');const u=await claude.use('user');window.ref=db.doc('games/current');return {id:await u.id(),can:await u.can('data.write')}});
  ok(r.id==='d_a1'&&r.can===true,'user id per device: '+r.id);
  for(const p of [Bp,C])await p.evaluate(async()=>{const db=await claude.use('db');window.ref=db.doc('games/current');window.seen=[];window.ref.onSnapshot(s=>window.seen.push(s.exists?s.data():null))});
  const body={status:'lobby',seats:['x',null,null],names:['T','',''],empty:[],nested:{a:[null,[],{}],b:0,c:false,d:''},rev:0};
  await A.evaluate(b=>window.ref.set(b),body);
  await new Promise(r=>setTimeout(r,600));
  const seenB=await Bp.evaluate(()=>window.seen[window.seen.length-1]);
  ok(JSON.stringify(seenB)===JSON.stringify(body),'other device receives exact body (nulls, empty arrays, falsy values)');
  const got=await C.evaluate(async()=>{const s=await window.ref.get();return s.exists?s.data():null});
  ok(JSON.stringify(got)===JSON.stringify(body),'get returns exact body');
  // lease race: three devices acquire at once; exactly one wins
  const res=await Promise.all(pages.map((p,i)=>p.evaluate(h=>window.ref.acquire({holder:h,ttlMs:1500}),'h'+i)));
  ok(res.filter(x=>x.acquired).length===1,'lease: exactly one of three wins a simultaneous acquire '+JSON.stringify(res.map(x=>x.acquired)));
  const win=res.findIndex(x=>x.acquired);
  const again=await pages[win].evaluate(h=>window.ref.acquire({holder:h,ttlMs:1500}),'h'+win);
  ok(again.acquired,'lease: holder can renew');
  await new Promise(r=>setTimeout(r,1700));
  const other=(win+1)%3;const after=await pages[other].evaluate(h=>window.ref.acquire({holder:h,ttlMs:1500}),'h'+other);
  ok(after.acquired,'lease: another device gets it after expiry');
  await A.evaluate(()=>window.ref.update({rev:5,nested:{b:9}}));await new Promise(r=>setTimeout(r,400));
  const up=await C.evaluate(async()=>(await window.ref.get()).data());
  ok(up.rev===5&&up.nested.b===9&&Array.isArray(up.nested.a)&&up.status==='lobby','update merges fields');
  await A.evaluate(()=>window.ref.delete());await new Promise(r=>setTimeout(r,400));
  const del=await C.evaluate(async()=>(await window.ref.get()).exists);ok(del===false,'delete removes document');
  // tables are separate
  const T2=await (await b.newContext()).newPage();await T2.goto(B+'shim_probe.html?dev=z9&table=other'+process.pid);
  await A.evaluate(b=>window.ref.set(b),body);await new Promise(r=>setTimeout(r,300));
  const iso=await T2.evaluate(async()=>(await (await claude.use('db')).doc('games/current').get()).exists);ok(iso===false,'different table code sees a separate game');
  const big={g:{log:Array.from({length:3000},(_,i)=>({s:i,t:'move '+i,arr:[1,2,null]}))}};
  const t0=Date.now();await A.evaluate(b=>window.ref.set(b),big);await new Promise(r=>setTimeout(r,500));
  const bigB=await Bp.evaluate(()=>window.seen[window.seen.length-1]);ok(bigB&&bigB.g.log.length===3000,'large state (~'+Math.round(JSON.stringify(big).length/1024)+' KB) syncs in '+(Date.now()-t0)+' ms incl. wait');
  ok(pages.every(p=>p.errs.length===0),'no console errors '+JSON.stringify(pages.map(p=>p.errs)));
  await b.close();console.log(fail?fail+' FAILED':'shim conformance passed');process.exit(fail?1:0)})();
