## 1. Project Setup

- [x] 1.1 Add `jimp` (devDependency, for the pixelation script) and `vitest` (devDependency, for engine-logic tests) to `frontend/package.json`; add a `"test": "vitest run"` script; verify `pnpm install` succeeds
- [x] 1.2 Create feature directory structure: `frontend/src/features/jewel/` with subdirs `engine/`, `actors/`, `scenes/`, `levels/`, `config/`, `components/`
- [x] 1.3 Create `frontend/src/features/jewel/config/constants.ts` with default values (`DEFAULT_GRID_SIZE=8`, `DEFAULT_PALETTE` of 5 colors, `DEFAULT_PICK_SHAPE='plus'`, `DEFAULT_MAX_STACKS=12`, `DEFAULT_MAX_STACK_SIZE=8`, `DEFAULT_ROTATION_PERIOD_MS=8000`) and verify the file exports and type-checks

## 2. Pure Game Logic (shuffle, board, belt) — build and unit-test before any rendering

- [x] 2.1 Implement `frontend/src/features/jewel/engine/shuffle.ts`: `shuffleBoard(targetColors, config, rng)` using paired flood-fill region growth and swap, per design.md Decision 6; verify with `vitest` that output is always a valid color-count-preserving permutation of the input (spec: jewel-board "Shuffled board is a valid permutation")
- [x] 2.2 Add a seeded PRNG helper (e.g. mulberry32) used by tests and by non-seeded production calls (seeded from `Date.now()`); verify a fixed seed produces identical shuffle output across runs
- [x] 2.3 Implement `frontend/src/features/jewel/engine/BoardEngine.ts`: holds `targetColors`/`jewels` grids, `isLocked(r,c)`, `computePickGroup(r,c,pickShape)` (plus/block3x3, clipped at edges, excluding empty/locked), `isSolved()`; verify with `vitest` covering interior pick, edge/corner clipping, and locked/empty exclusion (spec: jewel-board pick-group requirement)
- [x] 2.4 Implement `frontend/src/features/jewel/engine/BeltEngine.ts`: `insertJewel(color)` (stack-or-new-random-slot-or-fail), `clone()`, `canAcceptGroup(colors)` (clone + simulate), `hasAnyLegalPick(board)` (stuck-state scan per design.md Decision 5), `tick(elapsedMs)` advancing `ringRotationDeg`, `collectEjectCandidates()` returning slots that just crossed the eject point this tick; verify with `vitest` covering: stacking onto existing color, new-stack-on-random-free-slot, insertion failure when full, `canAcceptGroup` partial-failure blocking a whole group, and `hasAnyLegalPick` true/false cases (spec: jewel-belt capacity, pick-validation, and stuck-state requirements)
- [x] 2.5 Implement eject resolution: given eject-crossing slots and the current board, pick a random matching empty cell per color and apply it (decrementing/freeing the slot, locking the board cell); verify with `vitest` using a seeded RNG that a match ejects, a non-match leaves the stack unchanged, and the chosen cell is only ever a valid empty+matching one (spec: jewel-belt ejection requirement)
- [x] 2.6 Run `pnpm test` (or `pnpm vitest run`) and confirm all engine-logic tests pass

## 3. Level Data

- [x] 3.1 Define `LevelDef` type in `frontend/src/features/jewel/levels/types.ts` per design.md's configuration shape (gridSize, palette, targetColors, pickShape, shuffle config, belt config), with documented defaults for any omitted field
- [x] 3.2 Create `frontend/scripts/pixelate-image.mjs`: takes an input image path, grid size, and palette; downsamples via `jimp` and quantizes each cell to the nearest palette color; writes a `levels/levelN.ts` file matching `LevelDef`'s `targetColors` shape; verify by running it against one real source image and inspecting the output grid's dimensions and color values
- [x] 3.3 Run the script to produce `frontend/src/features/jewel/levels/level1.ts` (the one shipped MVP level) and visually sanity-check the resulting grid resembles the source image when rendered
- [x] 3.4 Create `frontend/src/features/jewel/levels/index.ts` exporting the levels array

## 4. Engine Bootstrap and Scene

- [x] 4.1 Create `frontend/src/features/jewel/engine/createEngine.ts` — Excalibur `Engine` factory with zero gravity and its own canvas dimensions, independent of `features/game/engine/createEngine.ts`
- [x] 4.2 Create `frontend/src/features/jewel/engine/GameEventBus.ts` with event types: `level-started`, `board-updated`, `belt-updated`, `pick-blocked`, `level-complete`, `level-failed`
- [x] 4.3 Create `frontend/src/features/jewel/actors/BoardCellActor.ts` — renders a cell's target-color background, locked-cell highlight, and (if present) the jewel on top
- [x] 4.4 Create `frontend/src/features/jewel/actors/JewelActor.ts` and an inline-SVG jewel renderer: one shared faceted-gem SVG template parameterized by fill color, producing one `ImageSource` per palette color via data URI (per design.md — no external asset files)
- [x] 4.5 Create `frontend/src/features/jewel/actors/BeltSlotActor.ts` — renders a belt slot's jewel stack (overlapping icons + count badge) at its current ring angle
- [x] 4.6 Create `frontend/src/features/jewel/scenes/JewelScene.ts`: builds the board (upper canvas) and belt ring (lower canvas) from a `LevelDef`, owns one `BoardEngine` and one `BeltEngine`, wires pointer-click → pick-group → belt-accept-or-block flow, drives belt `tick()` and eject resolution in `onPreUpdate`, and emits `level-complete`/`level-failed` via the event bus (spec: jewel-board win condition, jewel-belt stuck-state and ejection requirements, jewel-level blocked-pick feedback requirement)
- [x] 4.7 Implement the `pick-blocked` visual feedback: a brief (~300ms) red flash on the clicked cell's actor, triggered by the event bus, with no underlying state change

## 5. React Components and Routing

- [x] 5.1 Create `frontend/src/features/jewel/components/JewelCanvas.tsx` — mounts the canvas, creates the engine, adds `JewelScene`, starts the engine, and cleans up on unmount (mirrors `GameCanvas.tsx`)
- [x] 5.2 Create `frontend/src/features/jewel/components/JewelHUD.tsx` (+ `.css`) — subscribes to the event bus; shows occupied-stacks-out-of-max, and a win/loss banner with a restart button
- [x] 5.3 Create `frontend/src/features/jewel/components/JewelPage.tsx` (+ `.css`) — composes `JewelHUD` and `JewelCanvas` (mirrors `GamePage.tsx`)
- [x] 5.4 Create `frontend/src/features/jewel/index.ts` barrel export
- [x] 5.5 Add `export * from './jewel'` to `frontend/src/features/index.ts`
- [x] 5.6 Add `/jewel` route to `frontend/src/App.tsx` pointing at `JewelPage`
- [x] 5.7 Add a "Jewel" nav link to `frontend/src/components/Header.tsx`'s `NAV_LINKS`
- [x] 5.8 Implement restart: re-run the shuffle (new random seed) and reset `BoardEngine`/`BeltEngine` state when the player clicks restart after a win or loss

## 6. Verification and Polish

- [x] 6.1 Run the dev server, navigate to `/jewel`, and manually verify: starting board shows visible chunky (not per-cell) scrambled regions; picking a cell moves the expected plus-shape group to the belt; the belt visibly rotates; jewels eventually eject back onto matching empty cells only after passing the eject point
- [x] 6.2 Manually verify a blocked pick: fill the belt toward capacity and confirm an over-capacity pick is rejected outright (cell flashes, nothing moves) rather than partially applied
- [x] 6.3 Manually verify the win path: play a level to completion and confirm the win banner and restart button appear
- [x] 6.4 Manually verify the loss path: deliberately drive the belt into a stuck state (no legal pick remains) and confirm the loss banner appears, distinct from simply having a near-full belt with at least one legal pick still available
- [x] 6.5 Verify engine cleanup: navigate away from and back to `/jewel` multiple times; confirm no duplicate engines or console errors
- [x] 6.6 Run `pnpm build` and confirm TypeScript strict-mode passes with no new errors
- [x] 6.7 Run `pnpm lint` and fix any ESLint issues
- [x] 6.8 Run `pnpm test` and confirm all engine-logic unit tests still pass
