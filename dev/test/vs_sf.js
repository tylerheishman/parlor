// Tempo level vs Stockfish 16 limited to a rating (UCI_Elo) or a skill level.
// usage: node vs_sf.js LEVEL N ELO|skill:K [sfMoveMs]
const {spawn}=require('child_process');const mk=require('../src/engine.js');
const [LV,N,ANCH,SFMS]=[+process.argv[2],+process.argv[3],process.argv[4],+(process.argv[5]||300)];
const sf=spawn('/usr/games/stockfish');let buf='',waiters=[];
sf.stdout.on('data',d=>{buf+=d;let i;while((i=buf.indexOf('\n'))>=0){const line=buf.slice(0,i).trim();buf=buf.slice(i+1);waiters=waiters.filter(w=>!w(line))}});
const send=s=>sf.stdin.write(s+'\n');const until=pred=>new Promise(r=>waiters.push(l=>{const v=pred(l);if(v){r(v);return true}return false}));
(async()=>{
  send('uci');await until(l=>l==='uciok');send('setoption name Threads value 1');send('setoption name Hash value 16');
  if(ANCH.startsWith('skill:'))send('setoption name Skill Level value '+ANCH.slice(6));
  else{send('setoption name UCI_LimitStrength value true');send('setoption name UCI_Elo value '+ANCH)}
  send('isready');await until(l=>l==='readyok');
  const ref=mk(),A=mk();const openings=ref.BOOK_LINES.map(l=>l.split(' '));
  let seed=999+LV;const rnd=()=>{seed=(seed*1103515245+12345)&0x7fffffff;return seed/0x7fffffff};
  let pts=0,w=0,d=0,l=0,ms=[];
  for(let g=0;g<N;g++){
    const op=openings[(Math.floor(g/2)*7)%openings.length].slice(0,4);const tWhite=g%2===0;const moves=op.slice();ref.load(ref.START,moves);
    send('ucinewgame');let res=null;
    while(!res){
      const st=ref.status();if(st.over){res=st;break}
      if(moves.length>300){res={result:'1/2-1/2',reason:'cap'};break}
      const white=ref.side===0;let uci;
      if(white===tWhite){A.load(ref.START,moves);const r=A.think({level:LV,noBook:true,seed:Math.floor(rnd()*1e9)});uci=r.uci;ms.push(r.ms)}
      else{send('position startpos moves '+moves.join(' '));send('go movetime '+SFMS);uci=(await until(l=>l.startsWith('bestmove')&&l)).split(' ')[1]}
      moves.push(uci);ref.make(ref.parseUci(uci));
    }
    const s=res.result==='1/2-1/2'?0.5:((res.result==='1-0')===tWhite?1:0);pts+=s;if(s===1)w++;else if(s===0)l++;else d++;
  }
  const sc=pts/N,c=Math.min(Math.max(sc,0.03),0.97);
  const perf=ANCH.startsWith('skill:')?'':` perf≈${Math.round(+ANCH+400*Math.log10(c/(1-c)))}`;
  console.log(`L${LV} vs SF ${ANCH}: n=${N} W${w} D${d} L${l} score ${(100*sc).toFixed(0)}%${perf} avgms=${Math.round(ms.reduce((a,b)=>a+b,0)/ms.length)}`);
  send('quit');process.exit(0)})();
