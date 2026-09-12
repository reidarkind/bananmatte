# Bananmatte Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship Bananmatte as a Norwegian grades 1-2 banana-catching math PWA on GitHub Pages.

**Architecture:** Pure TypeScript domain logic (math, scoring, storage, collision) tested with Vitest. Canvas playfield plus HTML screens. No backend. localStorage only.

**Tech Stack:** Vite 6, TypeScript 5, Vitest, vanilla DOM, Web Audio, GitHub Actions Pages.

**Spec:** `docs/superpowers/specs/2026-09-12-bananmatte-design.md`

## Global Constraints

- UI language is Norwegian Bokmål (Æ Ø Å, never AE O A as stand-ins), short sentences for ages 6-7.
- Vite `base` is `/bananmatte/`.
- Persist only in localStorage keys `bananmatte.settings.v1` and `bananmatte.highscores.v1`.
- Score cannot go below 0.
- Two missed normal bananas end the game.
- Hundrevenn exists only when `max_n === 1000` and the setting is enabled.
- Empty selected-mode list falls back to `tiervenn`.
- Arcade names are exactly 3 characters from `ABCDEFGHIJKLMNOPQRSTUVWXYZÆØÅ`.
- Do not add analytics, accounts, or a backend.
- Logic modules must not import DOM APIs except `src/storage` which may read `globalThis.localStorage` behind a small adapter.

## File map

- Create: `package.json`, `package-lock.json`, `tsconfig.json`, `tsconfig.node.json`, `vite.config.ts`, `vitest.config.ts`, `index.html`, `.gitignore`
- Create: `public/manifest.webmanifest`, `public/sw.js`, `public/icons/*`
- Create: `.github/workflows/deploy.yml`
- Create: `src/types.ts`, `src/main.ts`, `src/app.ts`, `src/pwa.ts`, `src/styles.css`
- Create: `src/math/rng.ts`, `src/math/modes.ts`, `src/math/banana-values.ts`, `src/math/questions.ts`, `src/math/scoring.ts`
- Create: `src/storage/adapter.ts`, `src/storage/settings.ts`, `src/storage/highscores.ts`
- Create: `src/game/collision.ts`, `src/game/entities.ts`, `src/game/loop.ts`, `src/game/input.ts`, `src/game/backgrounds.ts`, `src/game/draw.ts`, `src/game/audio.ts`, `src/game/rules.ts`
- Create: `src/screens/*.ts`
- Test: `src/math/*.test.ts`, `src/storage/*.test.ts`, `src/game/collision.test.ts`, `src/game/rules.test.ts`

---

### Task 1: Scaffold Vite + Vitest

**Files:**
- Create: `package.json`, `tsconfig.json`, `tsconfig.node.json`, `vite.config.ts`, `vitest.config.ts`, `index.html`, `.gitignore`

**Interfaces:**
- Consumes: nothing
- Produces: npm scripts `dev`, `build`, `test`, `preview`; Vite base `/bananmatte/`

- [ ] **Step 1:** Write package manifests and configs as specified in the execute notes below.
- [ ] **Step 2:** Run `npm install`.
- [ ] **Step 3:** Confirm `npx vitest run` exits 0 on an empty suite or a placeholder test.

### Task 2: Types + RNG + banana values + scoring (TDD)

**Files:**
- Create: `src/types.ts`, `src/math/rng.ts`, `src/math/banana-values.ts`, `src/math/scoring.ts`
- Test: `src/math/banana-values.test.ts`, `src/math/scoring.test.ts`

**Interfaces:**
- Produces:
  - `createRng(seed: number): () => number`
  - `nextBananaValue(maxN: number, remaining: number, rng: () => number): number`
  - `applyScore(score: number, delta: number): number`
  - `SCORE_CATCH = 10`, `SCORE_MISS = -5`, `SCORE_ROTTEN = -20`, `mathBonus(level: number) = 50 + level * 10`

- [ ] **Step 1:** Write failing tests for banana values and score clamp.
- [ ] **Step 2:** Run tests, expect FAIL.
- [ ] **Step 3:** Implement minimal code.
- [ ] **Step 4:** Run tests, expect PASS.

### Task 3: Question generation (TDD)

**Files:**
- Create: `src/math/modes.ts`, `src/math/questions.ts`
- Test: `src/math/questions.test.ts`

**Interfaces:**
- Consumes: types, rng
- Produces: `planRound(input: PlanRoundInput): RoundPlan` with `catchTarget`, `mode`, `prompt`, `kind`, `answer`, `explanation`, `operand?`

- [ ] **Step 1:** Write failing tests for every mode using a seeded rng, including tiervenn 3→7 and 18→2, hundrevenn gate, addition bound, integer division, selected fallback.
- [ ] **Step 2:** Run tests, expect FAIL.
- [ ] **Step 3:** Implement `planRound`.
- [ ] **Step 4:** Run tests, expect PASS.

### Task 4: Storage (TDD)

**Files:**
- Create: `src/storage/adapter.ts`, `src/storage/settings.ts`, `src/storage/highscores.ts`
- Test: `src/storage/settings.test.ts`, `src/storage/highscores.test.ts`

**Interfaces:**
- Produces: `loadSettings`, `saveSettings`, `isHundrevennAvailable`, `availableModes`, `loadHighscores`, `submitHighscore`, `qualifies`

- [ ] **Step 1:** Write failing tests with an in-memory storage adapter.
- [ ] **Step 2:** Implement and make tests pass.

### Task 5: Collision + catch rules (TDD)

**Files:**
- Create: `src/game/collision.ts`, `src/game/rules.ts`
- Test: `src/game/collision.test.ts`, `src/game/rules.test.ts`

**Interfaces:**
- Produces: `intersects(a, b)`, `resolveCatch({lives, score, collected, target, item})` returning next lives/score/collected/ended/reason

- [ ] **Step 1:** Write failing tests: two misses end game; rotten catch does not cost a life; collect reaches target.
- [ ] **Step 2:** Implement and make tests pass.

### Task 6: Canvas playfield

**Files:**
- Create: `src/game/entities.ts`, `src/game/loop.ts`, `src/game/input.ts`, `src/game/backgrounds.ts`, `src/game/draw.ts`, `src/game/audio.ts`

**Interfaces:**
- Consumes: rules, banana values, audio setting
- Produces: `createPlaySession(opts)` with `start`, `stop`, `setPointerX`, `onRoundComplete`, `onGameOver`

### Task 7: Screens + app shell

**Files:**
- Create: `src/styles.css`, `src/app.ts`, `src/main.ts`, `src/screens/menu.ts`, `src/screens/game.ts`, `src/screens/math.ts`, `src/screens/highscore.ts`, `src/screens/settings.ts`, `src/screens/about.ts`, `src/screens/gameover.ts`

**Interfaces:**
- Produces: screen state machine wired to play session, settings, and highscores.

### Task 8: PWA + GitHub Actions + docs/icons

**Files:**
- Create: `public/manifest.webmanifest`, `public/sw.js`, `public/icons/*`, `src/pwa.ts`, `.github/workflows/deploy.yml`, `README.md`

**Interfaces:**
- Produces: installable PWA and Pages deploy on `main`.
