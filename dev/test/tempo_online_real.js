// Two-phone online test: real UI in Playwright, three browser contexts, one shared in-memory fake db with leases and latency.
const {chromium}=require('playwright');
const TABLE='t'+Date.now().toString(36);const F='http://127.0.0.1:8080/tempo/',S='/tmp/claude-0/-home-claude/9a1a09a9-b86d-5558-a268-2e3f93923a87/scratchpad/site_build/test/shots/';require('fs').mkdirSync(S,{recursive:true});
const REST=async()=>{const r=await fetch(`http://127.0.0.1:9000/r/${TABLE}/tempo/games/current/v.json?ns=demo-family`);const v=await r.json();return v&&v.j?JSON.parse(v.j):null};
const scheme=process.argv[2]||'light';const SAME=process.argv[3]==='same';
const store={},leases={},phones=[];let fail=0;
const ok=(c,m)=>{if(!c){fail++;console.log('FAIL',m)}else console.log('ok  ',m)};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const clone=o=>o==null?null:JSON.parse(JSON.stringify(o));
function broadcast(path){const d=clone(store[path]);for(const ph of phones){ph.chain=ph.chain.then(()=>sleep(15+Math.random()*60)).then(()=>ph.page.evaluate(([p,d])=>window.__snap&&window.__snap(p,d),[path,d]).catch(()=>{}))}}
async function dbop(src,op,path,arg){
  await sleep(10+Math.random()*40);
  if(op==='get')return clone(store[path]);
  if(op==='set'){store[path]=clone(arg);broadcast(path);return null}
  if(op==='acquire'){const now=Date.now(),l=leases[path];if(l&&l.until>now&&l.h!==arg.holder)return{acquired:false};leases[path]={h:arg.holder,until:now+Math.max(1000,arg.ttlMs||30000)};return{acquired:true}}
}
const INIT=uid=>`(()=>{window.__UID=${JSON.stringify(uid)};const subs={};
 window.__snap=(p,d)=>{(subs[p]||[]).forEach(f=>{try{f({exists:d!=null,id:p.split('/').pop(),data:()=>d,metadata:{fromCache:false,hasPendingWrites:false}})}catch(e){console.error('snap handler',e&&e.stack||e)}})};
 const ref=p=>({id:p.split('/').pop(),path:p,get:async()=>{const d=await window.__dbop('get',p,null);return{exists:d!=null,data:()=>d}},
   set:async d=>{await window.__dbop('set',p,d)},acquire:async o=>window.__dbop('acquire',p,o),
   onSnapshot(n,e){(subs[p]=subs[p]||[]).push(n);window.__dbop('get',p,null).then(d=>n({exists:d!=null,data:()=>d,metadata:{}}));return()=>{}}});
 const user={id:async()=>window.__UID,can:async()=>true,isOwner:async()=>false,canEdit:async()=>true};
 window.claude={use:async n=>n==='db'?{doc:ref}:n==='user'?user:null};})();`;
async function phone(b,uid,name){
  const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,colorScheme:scheme,hasTouch:true});
  
  
  const page=await ctx.newPage();const ph={page,ctx,uid,name,errs:[],chain:Promise.resolve()};
  page.on('console',m=>{if(m.type()==='error')ph.errs.push(m.text())});page.on('pageerror',e=>ph.errs.push(String(e)));
  phones.push(ph);await page.goto(F+`?dev=${uid.replace(/[^a-z0-9]/g,'')}&table=${TABLE}`);await page.waitForTimeout(300);
  await page.evaluate(n=>{const p=JSON.parse(localStorage.getItem('tempo.prefs')||'{}');p.names=Object.assign(p.names||{},{me:n});localStorage.setItem('tempo.prefs',JSON.stringify(p))},name);
  await page.reload();await page.waitForTimeout(300);
  return ph;
}
const st=(ph,f)=>ph.page.evaluate(f);
const movesOf=ph=>st(ph,()=>__T.G?__T.G.moves.join(' '):null);
async function settle(ms){await sleep(ms||500);await Promise.all(phones.map(p=>p.chain))}
async function tapMove(ph,u){await ph.page.click(`.sq[data-sq=${u.slice(0,2)}]`);await ph.page.waitForTimeout(80);await ph.page.click(`.sq[data-sq=${u.slice(2,4)}]`);await settle(350)}
async function inSync(label){const ms=await Promise.all(phones.filter(p=>p.inGame).map(movesOf));ok(ms.every(m=>m===ms[0]),`${label}: all phones in sync (${ms[0]})`);return ms[0]}
(async()=>{
  const b=await chromium.launch();
  const host=await phone(b,SAME?'u_tyler':'u_tyler','Tyler'),leo=await phone(b,SAME?'u_tyler':'u_leo','Leo'),sam=await phone(b,SAME?'u_tyler':'u_sam','Sam');
  const ids=await Promise.all([host,leo,sam].map(p=>p.page.evaluate(()=>__T.net.me)));
  if(SAME)ok(new Set(ids).size===3&&ids.every(i=>i.startsWith('u_tyler~')),'same account on three devices gives three player ids: '+ids.join(', '));
  [host,leo,sam].forEach((p,i)=>p.pid=ids[i]);
  // ---- lobby
  await host.page.click('[data-do=go][data-s=online]');await settle(300);
  await host.page.click('[data-do=set][data-k=pick][data-v=w]');await host.page.click('[data-do=set][data-k=clock][data-v="10+5"]');
  await host.page.screenshot({path:S+`online_lobby_${scheme}.png`});
  await host.page.click('[data-do=host]');await settle(400);
  await host.page.screenshot({path:S+`online_waiting_${scheme}.png`});
  for(const p of [leo,sam]){await p.page.click('[data-do=go][data-s=online]')}
  await settle(400);
  await leo.page.screenshot({path:S+`online_join_${scheme}.png`});
  // join race: Leo and Sam tap Join at the same moment
  await Promise.all([leo.page.click('[data-do=join]'),sam.page.click('[data-do=join]')]);
  await sleep(3500);await settle(500);
  const cur=(await REST());
  ok(cur&&cur.status==='play','game started after join race');
  const seats=cur.seats;ok(seats[0]===host.pid&&seats.length===2&&seats[1]&&seats[1]!==host.pid,'host is White as picked; exactly one joiner seated');
  const winner=seats[1]===leo.pid?leo:sam,loser=winner===leo?sam:leo;
  console.log('     join race winner:',winner.name);
  // make the test deterministic: whoever won plays Black as "opp"
  const opp=winner;host.inGame=true;opp.inGame=true;
  ok(await st(host,()=>__T.ui.screen)==='game','host entered the game');
  ok(await st(opp,()=>__T.ui.screen)==='game','joiner entered the game');
  ok(await st(loser,()=>__T.ui.screen)==='online','race loser stayed in lobby (can watch)');
  // ---- play moves through the UI
  await tapMove(host,'e2e4');ok(await movesOf(opp)==='e2e4','opponent sees e4');
  ok((await st(opp,()=>document.title)).startsWith('Your turn'),'opponent title shows Your turn');
  const blocked=await st(host,()=>{const before=__T.G.moves.length;return before});
  await host.page.click('.sq[data-sq=d2]');await host.page.click('.sq[data-sq=d4]');await settle(300);
  ok(await movesOf(host)==='e2e4','host cannot move on opponent turn');
  await tapMove(opp,'e7e5');await tapMove(host,'g1f3');await tapMove(opp,'b8c6');
  await inSync('after 4 moves');
  const clk=await st(host,()=>__T.G.clock&&__T.G.clock.left.slice());ok(clk&&clk[0]>600000&&clk[0]<=610000,'clock: White got increments, stored remaining '+clk);
  // ---- takeback asked by the player who just moved (Black, non-mover)
  await opp.page.click('[data-do=undo]');await settle(500);
  ok(await st(host,()=>!!(__T.ui.dialog&&/take back/.test(__T.ui.dialog.text))),'host sees takeback request');
  await host.page.screenshot({path:S+`online_takeback_${scheme}.png`});
  await host.page.click('[data-a=yes]');await settle(600);
  ok((await inSync('after allowed takeback')).split(' ').length===3,'Black move taken back (3 plies left)');
  ok(await st(opp,()=>__T.R.side)===1,'Black to move again');
  await tapMove(opp,'g8f6');
  // ---- takeback asked by the side to move (2 plies), declined
  await host.page.click('[data-do=undo]');await settle(500);
  ok(await st(opp,()=>!!(__T.ui.dialog&&/reply/.test(__T.ui.dialog.text))),'Black sees 2-ply takeback request from White');
  await opp.page.click('[data-a=no]');await settle(600);
  ok((await movesOf(host)).split(' ').length===4,'declined takeback keeps moves');
  // ---- draw offer declined
  await host.page.click('[data-do=menu]');await host.page.click('[data-do=offerDraw]');await settle(500);
  ok(await st(opp,()=>!!(__T.ui.dialog&&__T.ui.dialog.title==='Draw offer')),'Black sees draw offer');
  await opp.page.click('[data-a=no]');await settle(500);
  ok(!(await st(host,()=>__T.effResult())),'draw declined, game continues');
  // ---- spectator
  await loser.page.click('[data-do=watch]');await settle(400);loser.inGame=true;
  ok(await st(loser,()=>__T.ui.screen==='game'&&__T.myColor()===-1),'third phone watches as spectator');
  await tapMove(host,'f1c4');await inSync('spectator follows');
  // ---- reconnect: Black reloads mid-game
  await opp.page.reload();await settle(1200);
  ok(await st(opp,()=>__T.ui.screen)==='game','Black reconnects into the game after reload');
  await inSync('after reconnect');
  await tapMove(opp,'f8c5');await inSync('move after reconnect');
  // ---- resign by the side NOT to move (Black after moving)
  await opp.page.click('[data-do=menu]');await opp.page.click('[data-do=askResign]');await opp.page.click('[data-a=doResign]');await settle(700);
  const r=await Promise.all([host,opp,loser].map(p=>st(p,()=>__T.effResult()&&__T.effResult().reason)));
  ok(r.every(x=>x==='resignation'),'all three phones show resignation: '+r);
  ok((await REST()).g.result&&(await REST()).g.result.reason==='resignation','mover folded the resignation into the shared game');
  await host.page.screenshot({path:S+`online_end_${scheme}.png`});
  // ---- rematch: both tap Rematch; colours swap
  const gid0=(await REST()).gid;
  await host.page.click('.rcard [data-do=rematch]');await settle(400);
  await opp.page.click('.rcard [data-do=rematch]');await settle(1200);
  const c2=(await REST());ok(c2.gid!==gid0&&c2.seats[0]===opp.pid&&c2.seats[1]===host.pid,'rematch started with colours swapped');
  ok(await st(host,()=>__T.myColor())===1&&await st(opp,()=>__T.myColor())===0,'both phones in the new game with new colours');
  ok(await st(loser,()=>__T.G&&__T.G.id)===c2.gid,'spectator followed into the rematch');
  // ---- 2-ply takeback asked by the side to move, accepted
  await tapMove(opp,'d2d4');await tapMove(host,'d7d5');
  await opp.page.click('[data-do=undo]');await settle(500);
  await host.page.click('[data-a=yes]');await settle(700);
  ok((await inSync('after accepted 2-ply takeback'))==='','both plies taken back, White to move again');
  await tapMove(opp,'d2d4');await tapMove(host,'d7d5');
  // ---- draw accepted
  await opp.page.click('[data-do=menu]');await opp.page.click('[data-do=offerDraw]');await settle(500);
  await host.page.click('[data-a=yes]');await settle(700);
  const r2=await Promise.all([host,opp,loser].map(p=>st(p,()=>__T.effResult()&&__T.effResult().reason)));
  ok(r2.every(x=>x==='agreement'),'draw by agreement on all phones: '+r2);
  for(const p of phones)ok(p.errs.length===0,`${p.name}: no console errors ${p.errs.join(' | ')}`);
  console.log(fail?fail+' FAILURES':'online test passed');
  await b.close();process.exit(fail?1:0);
})().catch(e=>{console.error('CRASH',e);process.exit(1)});
