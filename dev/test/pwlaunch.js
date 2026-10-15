// Launch Chromium through the workspace proxy (to reach the real Firebase).
// Requests to the local site are answered straight from disk, so they never touch the proxy.
const {chromium}=require('playwright');const fs=require('fs'),path=require('path');
const SITE=path.join(__dirname,'..','site');
const TYPES={'.html':'text/html','.js':'text/javascript','.png':'image/png','.webmanifest':'application/manifest+json','.json':'application/json'};
module.exports=async()=>{const u=new URL(process.env.HTTPS_PROXY);
  const b=await chromium.launch({proxy:{server:`${u.protocol}//${u.host}`,username:decodeURIComponent(u.username)||undefined,password:decodeURIComponent(u.password)||undefined}});
  const nc=b.newContext.bind(b);
  b.newContext=async(o)=>{const c=await nc(Object.assign({ignoreHTTPSErrors:true,serviceWorkers:'block'},o||{}));
    await c.route('http://127.0.0.1:8080/**',route=>{let p=new URL(route.request().url()).pathname;if(p.endsWith('/'))p+='index.html';
      const f=path.join(SITE,p);if(!fs.existsSync(f))return route.fulfill({status:404,body:'nf'});
      route.fulfill({status:200,contentType:TYPES[path.extname(f)]||'application/octet-stream',body:fs.readFileSync(f)})});return c};
  return b};
