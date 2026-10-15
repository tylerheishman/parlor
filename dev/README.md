# Building Parlor

- `games/` holds the six source games (each one self-contained HTML, also published on claude.ai).
- `build.py` copies them into the site, adds the Firebase connection (`src/shim.js`), app icons, manifests and offline support (`src/sw.js`), and checks every script for syntax errors.
- Tests in `test/` run in Playwright against the Firebase emulator (`firebase emulators:start --only database`) or the live database.

Note: build.py was written for the original workspace layout (game sources under scratchpad/games). Point its GAMES paths at dev/games before rebuilding.
