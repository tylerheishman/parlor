# Parlor

Family game night in the browser: Tempo (chess), Strand, Furrow, Atoll, Midnight Spades and Setback Tavern.

- Open the site, pick a game, and play against the computer or with family on separate phones.
- Phones with the same **table code** share online games. Online play uses a Firebase Realtime Database (settings in `config.js`).
- Add the site, or any single game, to an iPhone Home Screen from Safari's Share menu.

Each game folder holds one self-contained page. `shim.js` connects the games to the database; `sw.js` keeps them working offline.
