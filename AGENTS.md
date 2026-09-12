# Agents.md

Bananmatte is a Norwegian math game for grades 1-2. It is a Vite + TypeScript PWA deployed to GitHub Pages.

## Commands

- npm install -- install dependencies
- npm test -- run Vitest once
- npm run dev -- local Vite server
- npm run build -- typecheck and production build
- npm run preview -- serve the production build

## Architecture

- src/types.ts -- shared types. Change these first when adding a mode or setting.
- src/math/ -- pure question generation, scoring, banana values. No DOM.
- src/storage/ -- localStorage settings and highscores. No network.
- src/game/ -- canvas loop, entities, collision, drawing, input, audio.
- src/screens/ -- menu, play, math overlay, highscore, settings, about, game over.
- src/app.ts -- screen state machine.
- Spec: docs/superpowers/specs/2026-09-12-bananmatte-design.md

## Rules

- UI copy is Bokmål Norwegian (Æ Ø Å, never AE O A as stand-ins), short sentences for 6-7 year olds.
- Persist only on device (localStorage). Never send scores or names off the phone.
- Logic changes need a failing Vitest test first.
- Keep files focused. Do not put question math inside canvas drawing.
- GitHub Pages base path is /bananmatte/.
- Do not add analytics, accounts, or a backend.
