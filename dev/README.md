# Building and publishing Parlor

The source of truth for each game is one self-contained HTML file in `dev/games/`.
Every change goes to two places:

1. **claude.ai artifact**: publish the file in `dev/games/` to its artifact URL (table below).
2. **Website**: `dev/publish.sh "What changed"` rebuilds the site from `dev/games/` and pushes it.

| Game | Source | claude.ai artifact |
|---|---|---|
| Tempo (chess) | games/tempo.html | https://claude.ai/artifact/L6r2ne1k5UHCEtuT4Jggdv |
| Strand | games/strand.html | https://claude.ai/artifact/SgFsSENSHkbdmZ8PT7gzg4 |
| Furrow | games/furrow.html | https://claude.ai/artifact/9kANE5dYrYfqgPw3BAuwwv |
| Atoll | games/atoll.html | https://claude.ai/artifact/BJRVSSpdby7LfuRzTUHLjm |
| Midnight Spades | games/spades.html | https://claude.ai/artifact/DkZ1QHvRQN2y9SK4Gx2Z2S |
| Setback Tavern | games/setback.html | https://claude.ai/artifact/CnQAjcD8WfzFcpQ3iJ95FG |

Artifacts use capabilities `{db:{}, user:{}}` (claude.ai online play).

## What the build does
- Copies each game to `<game>/index.html`, adds the Firebase connection (`src/shim.js` provides the same
  `window.claude.use('db'|'user')` API the games use on claude.ai), app icon and manifest, offline support (`src/sw.js`).
- Replaces claude.ai-specific text (`TEXT` in build.py) and fails if any claude.ai mention is left.
- Runs `node --check` on every inline script and fails on a syntax error.
- Leaves `dev/`, `README.md` and `.git` alone.

## Settings
- `dev/config.js`: Firebase web settings and the default table code. Online data lives under `r/<table>/<game>/` in the
  Realtime Database `parlor-th`. Rules: `{"rules":{"r":{"$table":{"$game":{".read":true,".write":true}}}}}`.

## Tests (Playwright)
- `test/shim_test.js`, `test/games_online_real.js`, `test/tempo_online_real.js`: three phones against the Firebase emulator
  (`npx firebase emulators:start --only database --project demo-family`, site served on 127.0.0.1:8080 built with an emulator config).
- `test/live_site.js`: two phones on the live site and live database (uses a throwaway `selftest-…` table).
- `strand-design.md`: the Strand ruleset and balance notes.
