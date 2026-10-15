# Tempo levels vs Stockfish 16 (limited strength)

Stockfish's UCI_Elo is calibrated to a computer rating list (CCRL Blitz), not to human ratings.
Each match: 12 games (4 for the first probe), alternating colours, 4-ply book openings. Stockfish at 300 ms or 1000 ms per move.
Raw results: tempo_vs_stockfish.log plus the first probe (L8 0/4, L12 4/4, L16 4/4 vs 1320 at 300 ms).

| Level | Results | Estimate |
|---|---|---|
| 16 | 8.5/12 vs 2400, 6.5/12 vs 2700 (300 ms); 10.5/12 vs 2400 (1000 ms) | ~2600–2700 |
| 15 | 4.5/12 vs 2400 | ~2300–2500 |
| 14 | 12/12 vs 1800, 9.5/12 vs 2200 | ~2400 |
| 13 | 12/12 vs 1900; 11/12 vs 2200 (300 ms); 6/12 vs 2200 (1000 ms) | ~2300 |
| 12 | 10/12 vs 1600; 9.5/12 vs 1900 (300 ms); 12/12 vs 1900 (1000 ms) | ~2100 |
| 11 | 9/12 vs 1600 | ~1800 |
| 10 | 19/24 vs 1320 | ~1550 |
| 9 | 13.5/24 vs 1320 | ~1350 |
| 8 | 0/4 vs 1320 | below ~1100 |
| 1–7 | below Stockfish's weakest setting | not measured |
