// Icon artwork for each app, as SVG strings (512x512, full bleed; iOS rounds the corners).
const wave = (y, c, w = 10) => `<path d="M40 ${y} q 54 -26 108 0 t 108 0 t 108 0 t 108 0" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`;
const hex = (cx, cy, r) => Array.from({ length: 6 }, (_, i) => { const a = Math.PI / 180 * (60 * i - 30); return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`; }).join(' ');
const SPADE = 'M256 92 C 214 150 120 206 120 286 C 120 338 160 370 206 370 C 228 370 244 362 252 350 C 248 384 236 408 210 428 L 302 428 C 276 408 264 384 260 350 C 268 362 284 370 306 370 C 352 370 392 338 392 286 C 392 206 298 150 256 92 Z';
const CLUB = 'M256 96 a 64 64 0 1 1 -1 0 Z M170 214 a 64 64 0 1 1 -1 0 Z M342 214 a 64 64 0 1 1 -1 0 Z M244 250 h24 c 0 70 12 130 44 178 h-112 c 32 -48 44 -108 44 -178 Z';
module.exports = {
  furrow: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
    <rect width="512" height="512" fill="#3f5a2b"/>
    <path d="M0 330 Q256 250 512 330 V512 H0Z" fill="#6f553b"/>
    ${[350, 395, 440, 485].map((y, i) => `<path d="M-10 ${y} Q256 ${y - 70 + i * 6} 522 ${y}" fill="none" stroke="#bf9a5e" stroke-width="16" stroke-linecap="round"/>`).join('')}
    <path d="M150 300 V200 L256 120 L362 200 V300 Z" fill="#e3a90f"/><path d="M128 210 L256 108 L384 210" fill="none" stroke="#3e2a17" stroke-width="26" stroke-linejoin="round" stroke-linecap="round"/>
    <rect x="232" y="232" width="48" height="68" rx="6" fill="#3e2a17"/></svg>`,
  spades: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
    <defs><radialGradient id="g" cx=".5" cy=".38" r=".7"><stop offset="0" stop-color="#1c3366"/><stop offset="1" stop-color="#070f22"/></radialGradient>
    <linearGradient id="b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e9c66a"/><stop offset="1" stop-color="#a07a2a"/></linearGradient></defs>
    <rect width="512" height="512" fill="url(#g)"/>
    <rect x="44" y="44" width="424" height="424" rx="36" fill="none" stroke="#c79a3c" stroke-width="6" opacity=".7"/>
    <path d="${SPADE}" fill="url(#b)"/></svg>`,
  setback: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
    <defs><linearGradient id="w" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5a3a24"/><stop offset="1" stop-color="#2e1d12"/></linearGradient></defs>
    <rect width="512" height="512" fill="url(#w)"/>
    <circle cx="256" cy="256" r="196" fill="#6e1f22" stroke="#b8913f" stroke-width="14"/>
    <path d="${CLUB}" fill="#e9cf86" transform="translate(256 262) scale(.72) translate(-256 -262)"/></svg>`,
  atoll: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
    <rect width="512" height="512" fill="#0f4c5c"/>
    <circle cx="256" cy="256" r="210" fill="#2f8fa0"/>
    <polygon points="${hex(256, 256, 168)}" fill="#e8d39a"/>
    <polygon points="${hex(256, 256, 136)}" fill="#5f9b46"/>
    <polygon points="${hex(256, 256, 64)}" fill="#3d7a35"/>
    <circle cx="256" cy="256" r="38" fill="#f6eedc"/><text x="256" y="272" text-anchor="middle" font-family="DejaVu Sans, sans-serif" font-weight="700" font-size="46" fill="#10313a">8</text>
    <polygon points="${hex(256, 256, 168)}" fill="none" stroke="#f2b632" stroke-width="10"/></svg>`,
  strand: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
    <rect width="512" height="512" fill="#0f3a44"/>
    ${wave(380, '#7fb4bb', 14)}${wave(430, '#4f8f98', 12)}${wave(476, '#356f78', 10)}
    <path d="M70 360 L180 210 L250 270 L330 150 L450 360 Z" fill="#d4c39a"/>
    <path d="M330 150 L372 222 L350 214 L330 236 L310 212 L292 220 Z" fill="#f4efe2"/>
    <path d="M150 300 V256 L186 228 L222 256 V300 Z" fill="#c88a12"/><rect x="176" y="268" width="20" height="32" fill="#0f3a44"/>
    <circle cx="396" cy="104" r="34" fill="#f4efe2"/></svg>`,
  tempo: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
    <rect width="512" height="512" fill="#1d5a43"/>
    ${[0, 1, 2, 3].map(r => [0, 1, 2, 3].map(c => (r + c) % 2 ? `<rect x="${c * 128}" y="${r * 128}" width="128" height="128" fill="#174a37"/>` : '').join('')).join('')}
    <g transform="translate(256 270)"><path d="M-104 150 H112 V118 Q112 96 88 92 H-82 Q-104 96 -104 118 Z M-74 92 C-60 30 -6 4 8 -36 C-22 -18 -58 -16 -88 -42 C-98 -74 -60 -118 -30 -134 L-22 -176 L4 -142 C76 -138 124 -68 112 92 Z" fill="#f3f8f4"/>
    <circle cx="-34" cy="-96" r="11" fill="#1d5a43"/></g></svg>`,
  parlor: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
    <defs><linearGradient id="p" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3b2a1e"/><stop offset="1" stop-color="#1c140e"/></linearGradient></defs>
    <rect width="512" height="512" fill="url(#p)"/>
    <rect x="104" y="104" width="304" height="304" rx="58" fill="#f1e6cf" transform="rotate(-8 256 256)"/>
    <g fill="#2a1d14" transform="rotate(-8 256 256)"><circle cx="180" cy="180" r="30"/><circle cx="332" cy="180" r="30"/><circle cx="256" cy="256" r="30"/><circle cx="180" cy="332" r="30"/><circle cx="332" cy="332" r="30"/></g>
    <circle cx="256" cy="256" r="30" fill="#c0392b" transform="rotate(-8 256 256)"/></svg>`
};
