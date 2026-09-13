# Bonus Ride Design

Date: 2026-09-13
Product: Bananmatte
Audience: Norwegian grades 1–2

## Goal

After a correct answer on level 10, 20, 30 and so on, play a short bonus ride. It is fun only. It cannot end the main game, change the score, or write a highscore.

## When it starts

After a correct math answer, if the current level is 10, 20, 30… (any multiple of 10 at least 10), start the bonus before the next regular round.

A cheat code can start a chosen bonus from any level. After the bonus, the run continues at the next regular level. The cheat does not jump the main level and does not add points.

## What the bank does

Nothing. The ape reaches the bank and “deposits” as theatre. Score, lives, rotten meter and highscores stay unchanged.

## Ride

One fake-3D corridor (California Speed, 2D canvas). The ape is seen from behind. Steer freely left and right, same as harvest: pointer/touch on the canvas and arrow keys / A D.

First vehicle is a soapbox car (olabil) on a hill. Later milestones reuse the same engine with a new skin and backdrop:

- 10 soapbox, hill
- 20 car, road
- 30 boat, river
- 40 helicopter, valley
- 50 small plane, clouds
- 60+ large plane, sky

v1 ships the engine, soapbox, Hopp over, cheat, and simple stand-in skins for later vehicles.

## Obstacles

Three kinds, same rules on every vehicle:

- Banana (soft): splat aside. Ride continues.
- Banana crate (hard): crash. Bonus ends. Main game continues.
- Math book: pause the ride and use the existing math overlay. Correct answer resumes the ride. Wrong answer shows the solution, then the bonus ends (same as a crate). The main game continues. Never game over.

The last stretch is clear. The endpoint is the bank theatre, then the next regular level.

## Skip

Anyone may press Hopp over / Avbryt. That ends the bonus with no penalty and continues the main run.

## Cheat

On a number answer, the typed buffer may be `1337` + the correct digits + a milestone that is a multiple of 10 and at least 10.

Examples when the answer is 23: `13372310` opens the level-10 bonus, `13372320` opens the level-20 bonus. When the answer is 2: `1337210` opens the level-10 bonus.

Parse by stripping the `1337` prefix, then trying suffixes that are multiples of 10 (shortest first). The middle must equal the expected answer as text, so negatives work (`1337-510` when the answer is −5).

The cheat only works on number answers (the numpad). Parity and compare stay as they are.

## Main-game contract

- Correct regular answer still adds the usual math bonus and increments the level, after the bonus (or immediately if there is no bonus).
- Wrong regular answer still ends the run.
- Bonus crate / skip / failed-then-retried book never call game over.
- Persist only on the device. No network.

## Architecture

- `src/bonus/cheat.ts` — parse the cheat. No DOM.
- `src/bonus/milestones.ts` — which levels open a bonus, which vehicle skin.
- `src/bonus/ride.ts` — steer, move, collide, phases. No canvas drawing of math.
- `src/bonus/draw.ts` — fake-3D road and sprites.
- `src/bonus/session.ts` — canvas loop for the bonus layer.
- `src/screens/bonus.ts` — Hopp over chrome and math pause host.
- `src/app.ts` — start bonus after a correct answer, then resume the regular round.
- Math overlay may pass the raw digit buffer so the cheat can be read. Do not put question math in canvas drawing.

## Out of scope for v1

A real savings pot, extra score for reaching the bank, 3D WebGL, analog-only three-lane snap, and polished vehicle art beyond clear silhouettes.
