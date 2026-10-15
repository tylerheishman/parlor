#!/usr/bin/env python3
"""Assemble the standalone Parlor site into ./site from the six game files.
Usage: build.py [--config config.js]   (config.js holds window.FAMILY_CONFIG)"""
import json, os, re, shutil, sys, hashlib

ROOT = os.path.dirname(os.path.abspath(__file__))
SP = os.path.dirname(ROOT)
OUT = os.path.join(ROOT, 'site')
GAMES = [
    # id, source, name, short name, theme color, background color
    ('tempo', 'games/chess/tempo.html', 'Tempo', 'Tempo', '#1d5a43', '#e6ebe3'),
    ('strand', 'games/hybrid/strand.html', 'Strand', 'Strand', '#0f3a44', '#efe6d4'),
    ('furrow', 'furrow.html', 'Furrow', 'Furrow', '#3f5a2b', '#e4e8d8'),
    ('atoll', 'games/isles/atoll.html', 'Atoll', 'Atoll', '#0f4c5c', '#cfe6e4'),
    ('spades', 'games/spades/spades.html', 'Midnight Spades', 'Spades', '#0b1730', '#070f22'),
    ('setback', 'games/setback/setback.html', 'Setback Tavern', 'Setback', '#3d2819', '#2e1d12'),
]
NOCONN = "Online play is not available right now. Check your internet connection, then reload."
TEXT = {
    'furrow': [
        ("t available in this view. Open the page signed in to claude.ai. Other players need it shared with them as Editors.", "t available right now. Check your internet connection, then reload."),
        ("Others open this page on their phones and tap Join. Each needs their own claude.ai account.", "Others open Furrow on their phones, with the same table code, and tap Join."),
        ("Each person opens the page signed in to their own claude.ai account. The owner shares it with them as an Editor from the Share menu.", "Each person opens Furrow on their own phone, with the same table code."),
    ],
    'spades': [("t available in this view. Open the page signed in to claude.ai. Each friend needs it shared with them as an Editor.", "t available right now. Check your internet connection, then reload.")],
    'setback': [("Online play needs this page opened on claude.ai while signed in. Other players need it shared with them as Editors.", NOCONN)],
    'atoll': [("Online play needs this page opened on claude.ai while signed in. Each player opens it on their own phone.", NOCONN)],
    'strand': [
        ("Online play is not available in this view. Open the page signed in to claude.ai. Other players need it shared with them as Editors.", NOCONN),
        ("Others open this page on their phones and tap Join. Each needs their own claude.ai account.", "Others open Strand on their phones, with the same table code, and tap Join."),
    ],
    'tempo': [
        ("Open Tempo from claude.ai while signed in. Each device counts as its own player, so two devices on the same claude.ai account can play each other. A different account needs the owner to share Tempo with it as an Editor.", NOCONN),
        (" It can be signed in to the same claude.ai account as this one.", " Both phones need the same table code."),
        (" Two devices signed in to the same claude.ai account work fine: each device is its own player.", " Both need the same table code."),
    ],
}

HOME_BTN = r"""<script>
(function(){
  /* Parlor: a small way home when a game was opened from the installed Parlor app */
  var standalone=(window.matchMedia&&matchMedia('(display-mode: standalone)').matches)||navigator.standalone;
  var from=false;try{from=sessionStorage.getItem('fg_from')==='1'}catch(e){}
  if(standalone&&from){
    var b=document.createElement('a');b.href='../';b.setAttribute('aria-label','Back to Parlor');
    b.innerHTML='<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg>';
    b.style.cssText='position:fixed;z-index:2147483000;left:6px;top:50%;width:30px;height:44px;margin-top:-22px;border-radius:0 12px 12px 0;display:flex;align-items:center;justify-content:center;background:rgba(30,22,15,.55);color:#fff;text-decoration:none;-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);opacity:.75;left:0';
    document.body.appendChild(b);
  }
  if('serviceWorker' in navigator)navigator.serviceWorker.register('../sw.js',{scope:'../'}).catch(function(){});
})();
</script>"""


def manifest(name, short, start, scope, icon_base, theme, bg):
    return json.dumps({
        "name": name, "short_name": short, "start_url": start, "scope": scope, "display": "standalone",
        "orientation": "portrait", "theme_color": theme, "background_color": bg,
        "icons": [{"src": f"{icon_base}-192.png", "sizes": "192x192", "type": "image/png"},
                  {"src": f"{icon_base}-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any"},
                  {"src": f"{icon_base}-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"}]}, indent=1)


def build(config_path):
    if os.path.exists(OUT):
        shutil.rmtree(OUT)
    os.makedirs(OUT + '/lib'); os.makedirs(OUT + '/icons')
    for f in os.listdir(ROOT + '/icons'):
        if f.endswith('.png') and f != 'sheet.png':
            shutil.copy(ROOT + '/icons/' + f, OUT + '/icons/' + f)
    for f in ('firebase-app-compat.js', 'firebase-database-compat.js'):
        shutil.copy(ROOT + '/emu/node_modules/firebase/' + f, OUT + '/lib/' + f)
    shutil.copy(ROOT + '/src/shim.js', OUT + '/shim.js')
    shutil.copy(config_path, OUT + '/config.js')
    shutil.copy(ROOT + '/src/portal.html', OUT + '/index.html')
    open(OUT + '/manifest.webmanifest', 'w').write(manifest('Parlor', 'Parlor', './', './', 'icons/parlor', '#241911', '#1b140e'))
    open(OUT + '/.nojekyll', 'w').write('')
    files = ['./', 'index.html', 'manifest.webmanifest', 'config.js', 'shim.js', 'lib/firebase-app-compat.js', 'lib/firebase-database-compat.js']
    files += ['icons/' + f for f in sorted(os.listdir(OUT + '/icons'))]

    for gid, src, name, short, theme, bg in GAMES:
        html = open(os.path.join(SP, src), encoding='utf-8').read()
        for a, b in TEXT.get(gid, []):
            n = html.count(a)
            if n == 0:
                sys.exit(f'{gid}: text not found: {a[:60]}')
            html = html.replace(a, b)
        left = re.findall(r'[^\s>"\'`]{0,30}claude\.ai[^<"\'`]{0,30}', html)
        if left:
            sys.exit(f'{gid}: claude.ai text left: {left}')
        head = (f'<link rel="manifest" href="manifest.webmanifest"><link rel="apple-touch-icon" href="../icons/{gid}-180.png">'
                f'<link rel="icon" type="image/png" href="../icons/{gid}-192.png"><meta name="apple-mobile-web-app-title" content="{short}">'
                f'<meta name="mobile-web-app-capable" content="yes">'
                f'<script src="../config.js"></script><script src="../shim.js" data-game="{gid}"></script>')
        if not html.lstrip().lower().startswith('<!doctype'):
            html = ('<!doctype html><html lang="en"><head><meta charset="utf-8">'
                    '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
                    f'<meta name="theme-color" content="{theme}"><meta name="apple-mobile-web-app-capable" content="yes">'
                    + head + '</head><body>' + html + HOME_BTN + '</body></html>')
        else:
            m = re.search(r'<meta charset[^>]*>', html, re.I) or re.search(r'<head[^>]*>', html, re.I)
            html = html[:m.end()] + head + html[m.end():]
            i = html.lower().rfind('</body>')
            html = html[:i] + HOME_BTN + html[i:]
        import subprocess, tempfile
        scripts = re.findall(r'<script(?![^>]*src=)[^>]*>([\s\S]*?)</script>', html)
        for k, js in enumerate(scripts):
            with tempfile.NamedTemporaryFile('w', suffix='.js', delete=False) as tf:
                tf.write(js)
            r = subprocess.run(['node', '--check', tf.name], capture_output=True, text=True)
            if r.returncode:
                sys.exit(f'{gid}: script {k} has a syntax error:\n{r.stderr[:600]}')
        os.makedirs(f'{OUT}/{gid}')
        open(f'{OUT}/{gid}/index.html', 'w', encoding='utf-8').write(html)
        open(f'{OUT}/{gid}/manifest.webmanifest', 'w').write(manifest(name, short, './', './', f'../icons/{gid}', theme, bg))
        files += [f'{gid}/', f'{gid}/manifest.webmanifest']

    digest = hashlib.sha1()
    for f in sorted(os.listdir(OUT)):
        pass
    for dp, dn, fn in os.walk(OUT):
        for f in sorted(fn):
            digest.update(open(os.path.join(dp, f), 'rb').read())
    sw = open(ROOT + '/src/sw.js').read().replace('__VERSION__', digest.hexdigest()[:10]).replace('__FILES__', json.dumps(files))
    open(OUT + '/sw.js', 'w').write(sw)
    print('built', OUT, 'version', digest.hexdigest()[:10])


if __name__ == '__main__':
    cfg = sys.argv[sys.argv.index('--config') + 1] if '--config' in sys.argv else ROOT + '/config.js'
    build(cfg)
