# Bananmatte design spec

See README.md for the player-facing description.

Date: 2026-09-12
Product: Bananmatte
Audience: Norwegian grades 1-2
Platform: Vite TypeScript PWA on GitHub Pages

## Chosen approach

Vite + TypeScript + Canvas/HTML PWA. No backend. localStorage only.

Rejected: React Native (no GitHub Pages), Phaser (heavier than needed).

## Screens

Menu, Game, Highscore, Settings, About, Game over. Internal state, no URL routes.

## Catch rules

Bananas fall from the top. Player moves a gorilla with a basket along the bottom.
Each round has target x. Collect banana value until sum >= x.
Two missed normal bananas end the game. Missed banana subtracts points. Score cannot go below 0.
From level 3, rotten bananas spawn. Catching them subtracts points but does not cost a life.
Each level increases fall speed. Backgrounds rotate and gain non-colliding distractors.

## Banana values

x is always the math number in 1..max_n.

- max_n 10: value 1
- max_n 50: 1 or 5
- max_n 100: 1, 5 or 10
- max_n 1000: 1, 10, 50 or 100

Next banana value is always <= remaining target. Math uses x.

## Modes

- tiervenn: (10 - (x % 10)) % 10. Friend of 3 is 7. Friend of 18 is 2.
- hundrevenn: (100 - (x % 100)) % 100. Only when max_n is 1000 and setting enabled.
- addisjon: y random, y < max_n - x, y >= 0. If x == max_n, redraw x in [1, max_n-1].
- subtraksjon-positiv: x - y >= 0
- subtraksjon-negativ: y in [1, max_n], result may be negative
- multiplikasjon-mini: x * k, k in 1-5
- multiplikasjon-liten: x * k, k in 1-10
- divisjon-mini: catch numerator x, divisor d in {1,2,3}, x multiple of d
- divisjon-liten: 50% catch numerator (divisor 1-10), 50% catch denominator x in [1, min(10,max_n)], numerator = x * quotient
- partall-oddetall: is x even or odd
- partall-oddetall-addisjon: is x+y even or odd, y in [1, max_n]
- partall-oddetall-subtraksjon: is x-y even or odd, y in [0, x]

Mix: random mode each round.
Selected: mix from checked modes. Empty selection falls back to tiervenn.

Number modes use a keypad. Parity modes use two big buttons.
UI language is Norwegian Bokmål. Use Æ Ø Å, never AE O A as stand-ins.

## Settings

max_n: 10, 50, 100, 1000
Mode: single, mix, or selected
Hundrevenn toggle visible only at max_n 1000 (default on)
Sound on/off
Storage key: bananmatte.settings.v1

## Scoring

Caught banana: +10 * value
Missed banana: -5
Caught rotten: -20
Correct math: +50 + level * 10

Highscores: top 10 per max_n. Arcade name: 3 chars from A–Z plus Æ Ø Å.
Fields: name, score, level, date ISO
Storage key: bananmatte.highscores.v1

## Speed

Fall speed factor: 1 + 0.12 * (level - 1)
Backgrounds: jungle, beach, night, school, volcano, underwater, space, candy

## PWA

manifest + service worker
Vite base /bananmatte/
GitHub Actions: test, build, deploy-pages on main

## Architecture

src/types.ts, src/math/, src/storage/, src/game/, src/screens/, src/app.ts, src/pwa.ts
Pure TypeScript logic, no DOM. Vitest covers math, scoring, storage, collision.

## Out of scope

Accounts, online scores, multiplayer, app store binaries, analytics, English UI.
