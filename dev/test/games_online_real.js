// For each game: 3 phones on the real database (emulator). Host, two join at the same moment, game starts,
// then each person hands their seat to the computer on their turn, and the game runs on for a while.
// Checks: start, seat counts, all phones stay in sync, the game keeps moving, no page errors.
const {chromium}=require('playwright');
const GAMES=process.argv.slice(2).length?process.argv.slice(2):['furrow','spades','setback','atoll','strand'];
const SET={furrow:{op:3,ob:1},spades:{op:3},setback:{op:3},atoll:{op:3,ob:1},strand:{op:3,ob:1}};
const RUN_MS=+process.env.RUN_MS||45000;let fail=0;
const ok=(c,m)=>{if(!c){fail++;console.log('FAIL',m)}else console.log('ok  ',m)};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  const b=await chromium.launch();
  for(const g of GAMES){
    console.log('=== '+g);const table='t'+Date.now().toString(36);const phones=[];
    for(const d of ['ph0','ph1','ph2']){
      const ctx=await b.newContext({viewport:{width:390,height:844},hasTouch:true});const page=await ctx.newPage();const errs=[];
      page.on('pageerror',e=>errs.push(String(e)));page.on('console',m=>{if(m.type()==='error'&&!/vibrate/.test(m.text()))errs.push(m.text())});
      await page.goto(`http://127.0.0.1:8080/${g}/?dev=${d}&table=${table}`);phones.push({page,errs,d});
    }
    const ready=async p=>{for(let i=0;i<60;i++){if(await p.page.evaluate(()=>!!(net.ready&&net.ref&&!net.off)))return true;await sleep(250)}return false};
    ok((await Promise.all(phones.map(ready))).every(Boolean),g+': all phones connect to online play');
    const S=SET[g];
    await phones[0].page.evaluate(S=>{Object.assign(ui.setup,S);return hostGame()},S);
    await sleep(1200);
    await Promise.all([phones[1].page.evaluate(()=>joinGame()),phones[2].page.evaluate(()=>joinGame())]);
    let started=false;for(let i=0;i<40&&!started;i++){await sleep(250);started=(await Promise.all(phones.map(p=>p.page.evaluate(()=>mode==='online'&&!!G)))).every(Boolean)}
    ok(started,g+': game started on all three phones after a simultaneous join');
    if(!started){console.log(await Promise.all(phones.map(p=>p.page.evaluate(()=>({mode,doc:net.doc&&net.doc.status,seats:net.doc&&net.doc.seats})))));continue}
    const info=await phones[0].page.evaluate(()=>({n:G.players.length,bots:G.players.filter(p=>p.bot).length,seats:net.doc.seats.filter(Boolean).length}));
    ok(info.seats===3&&info.n===3+(S.ob||(g==='spades'||g==='setback'?1:0)),g+`: ${info.seats} people + ${info.n-info.seats} computer seated`);
    const rev0=await phones[0].page.evaluate(()=>net.rev);
    const t0=Date.now();let handed=0;
    while(Date.now()-t0<RUN_MS){
      for(const p of phones){
        const h=await p.page.evaluate(()=>{try{if(!G||G.phase==='end')return 0;
          const act=(typeof actorIdx==='function')?actorIdx():(typeof actorOf==='function')?actorOf(G):G.turn;
          const fn=typeof handToComputer==='function'?handToComputer:(typeof handToBot==='function'?handToBot:null);
          const P=G.players[act];if(!P||P.bot)return 0;
          if(fn){if(act!==seat()){fn(act);return 1}return 0}
          if(mine()){P.bot=true;commit();render();return 1}return 0}catch(e){return 'err '+e}});
        if(h===1)handed++;else if(h&&h!==0)console.log(g,p.d,h);
      }
      await sleep(400);
      if((await phones[0].page.evaluate(()=>G&&G.phase))==='end')break;
    }
    await sleep(3000);
    const st=await Promise.all(phones.map(p=>p.page.evaluate(()=>({rev:net.rev,phase:G&&G.phase,h:JSON.stringify(G).length,g:JSON.stringify(G)}))));
    const same=st.every(x=>x.g===st[0].g);
    ok(st[0].rev>rev0+3,g+`: game moved on over the real database (rev ${rev0} → ${st[0].rev}, phase ${st[0].phase}, seats handed ${handed})`);
    ok(same,g+': all three phones show the identical game state'+(same?'':' revs '+st.map(x=>x.rev)));
    ok(phones.every(p=>p.errs.length===0),g+': no page errors '+JSON.stringify(phones.map(p=>p.errs.slice(0,2))));
    for(const p of phones)await p.page.context().close();
  }
  await b.close();console.log(fail?fail+' FAILED':'all games passed');process.exit(fail?1:0)})();
