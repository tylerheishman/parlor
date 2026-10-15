# Strand — design doc

A new island has risen from a cold northern sea. Each family lands on the strand, builds houses and halls, lays roads across the island, and tries to feed a growing family through ten moons.

Mix: a shared hex island that produces goods (Settlers), worker placement with blocking, accumulating piles and feasts you must feed (Agricola), a public market of crafts that grow your engine (Splendor), and secret route charters you race to connect (Ticket to Ride).

## Components
- Island: 19 hexes (2–4 players) or 24 hexes (5 players). Terrains: Forest (wood), Clay pit (clay), Crag (stone), Field (grain), Meadow (wool), Shoal (food), one Ash dune (nothing; the raider starts here). Number tokens 2–12 (no 7). No 6/8 next to each other.
- Harbors on the coast: 2:1 for one good, or 3:1 for any good.
- Six landmarks on the coast (Gull Rock, Seal Point, Old Beacon, Whalebone, Fog Cove, Raven Stack).
- Tide deck: 36 cards with the same spread as two dice (one 2, two 3s, … six 7s … one 12). Three are flipped each moon, so one deck lasts the whole game. Players can count it.
- Goods: wood, clay, stone, grain, wool. Food is separate.

## Setup
1. Each player gets 3 secret charters and keeps 2 or 3.
2. Snake order (1→n, n→1): place a house and a road next to it. Distance rule: no building on a corner next to another building. Your second house gives you 1 good from each hex around it.
3. Each player starts with 2 kin (family members) and 3 food. The last seat to land holds the Helm for moon 1; the first seat gets +1 food.

## A moon (round), 10 moons
1. **Reveal** the moon's new action (stages: moons 1–2, 3–5, 6–8, 9–10; Kinfolk is always moon 3).
2. **Refill** accumulating spaces.
3. **Tides**: flip 3 tide cards. Every hex with a flipped number produces: each house next to it gets 1, each hall 2. The hex with the raider produces nothing.
   For each 7: **squall**. Anyone with more than 10 goods (food does not count) loses half of them, from the biggest piles. Then the Helm player moves the raider to a new hex and steals 1 random good from a player with a building there.
4. **Work**: starting with the Helm player, take turns placing one kin on an empty action space and doing it. Before you place, you may trade freely: 4:1 with the supply (harbors 3:1 or 2:1), or post / accept an offer with other players.
5. **Return** kin home. Newborns work from the next moon.
6. **Feast** after moons 3, 6, 8 and 10: each kin eats 2 food (a newborn since the last feast eats 1). You may eat grain or wool for 1 food each (crafts improve this). Each missing food is a hardship: −2 points.

## Action spaces
Always (2 players): Helm (go first next moon, steer squalls, +1 food) · Timber (+2 wood each moon, piles up) · Clay pit (+1 clay, piles up) · Barley (+1 grain, piles up) · Nets (+2 food, piles up) · Odd jobs (1 food + 1 good of your choice) · Settle (build up to 2 roads — the first is free — then 1 house or upgrade 1 house to a hall) · Bazaar (+1 food, then trade 2:1 as often as you like) · Workshop (buy 1 craft) · Raid (move the raider, steal 2 goods from a player beside it).
3+ players add Copse (+1 wood +1 clay, piles up) and Road crew (build up to 2 roads). 4+ add Outpost (a second Settle) and Orchard (+1 wood +1 grain, piles up). 5 adds Weir (+1 food, piles up) and Guild (a second Workshop).

Revealed, one per moon:
- Moons 1–2: Quarry (+1 stone, piles up), Shearing (+1 wool, piles up).
- Moons 3–5: Kinfolk (moon 3: a new kin, needs a free bed), Masons (upgrade up to 2 houses to halls, each 1 stone cheaper), Charter house (draw 2 charters, keep any; +1 good).
- Moons 6–8: Shipyard (build up to 3 roads, wood only), Market day (take 2 goods of your choice), Feast hall (+1 food per kin).
- Moons 9–10: Great works (build as much as you can pay for), Wayfarers (a new kin, no bed needed).

## Costs
Road: wood + clay. House: wood + clay + grain + wool. Hall (upgrade a house): 2 grain + 3 stone.
Beds: house 1, hall 2. Max 5 kin, 5 houses, 4 halls, 15 roads.

## Crafts (Workshop)
A public market: 3 Tier-I slots, 2 Tier-II, 1 Tier-III, refilled from shuffled decks. Each craft has a cost, points and a lasting effect (better feast rates, extra goods from spaces, cheaper building, trade rates, an extra bed, end-game point formulas).

## Charters (secret)
- Routes: connect two landmarks with your own unbroken road network (an opponent's building breaks it). Worth 3–7 by distance.
- Ambitions: 5 kin, 2 halls, 5 buildings, 4 crafts, touch 5 terrains, buildings on 2 harbors, no hardship, 9 roads, touch 2 shoals.
Done: score the points. Not done: −2 each.

## Scoring
House 1 · Hall 2 · Kin 2 each · craft points · charters · Longest road (5+, holder keeps ties) 3 · hardship −2 each. Tie-break: most goods + food left.

## House rules (settings)
- Calm seas: squalls never take goods (default off).
- Forgiving charters: no −2 for unfinished charters (default off).
- Open charters: everyone's charters are visible (default off).

## Why these choices
- Three tides at the start of each moon (not per turn) keep the Settlers "my number came up" moment and the raider without slowing the worker-placement turns. A 36-card tide deck instead of dice cuts swing and rewards counting.
- Building is an action space, so the island race and the action board block each other: if someone takes Settle first, you trade, raid, or take the Helm to be first next moon.
- Player trades are standing offers you accept on your own turn. No one waits for answers, so it works on separate phones.
- Beds come from houses and halls, so the island is the family engine: more buildings → more kin → more actions → more mouths at the feast.

## Changes made during self-play balancing
- **Barley moved to the base board** (all player counts). Bots measured only ~5 grain per player per game, and every house and hall needs grain, so almost nothing got built. With Barley, grain is ~8 per player.
- **Settle and Outpost give the first road free.** A new house always needs a road first (distance rule), so a house really cost 6 goods; bots built ~2.6 buildings per game. The free road makes island growth a real option from moon 1.
- **Wayfarers (growth without a bed) moved to moons 9–10**, Feast hall to 6–8. Early bed-free growth let everyone reach 5 kin without building; now beds come from the island until the end.
- **Raid steals 2** (the squall's raider steals 1). One Raid space means at most one raid per moon.
- **First-player balance.** With the first seat holding the Helm in moon 1 and the last seat getting +1 food, strong bots won 68% from seat 1 in 2-player games (n=50). Giving moon 1's Helm to the last seat (who also lands twice in a row) and +1 food to the first seat measured 25/25 at 2p, 19/26/15 at 3p (n=60), 15/15/12/14 at 4p (n=56).
- Kept: 3 tides per moon, 36-card tide deck, hardship −2, kin 2 points, charters −2 if unfinished.
