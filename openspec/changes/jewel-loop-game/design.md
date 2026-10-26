## Context

See `proposal.md` - Why. This design reuses the same architectural pattern as the existing `/game` platformer (see `openspec/changes/archive/2026-04-16-browser-puzzle-game/design.md`): Excalibur.js owns a `<canvas>`, React owns the surrounding chrome, and an event bus bridges the two. The jewel game is a **new, independent feature directory** — no runtime code is shared with `features/game/`, since that feature's engine factory, constants, and actors are platformer-specific (gravity, tile collision, sprite sheets) and don't fit a grid-matching game.

The jewel game's own logic (shuffling, the belt ring, pick-group selection) is deliberately kept framework-free — plain TypeScript classes/functions with no Excalibur imports — so it can be unit tested directly, unlike the platformer's logic which lives inside Excalibur `Scene`/`Actor` subclasses.

## Goals / Non-Goals

**Goals:**
- A playable jewel-matching game at `/jewel`, visually distinct from the platformer, using the same engine/page-composition conventions
- Deterministic, testable core logic (shuffle, belt, pick validation) decoupled from rendering
- Per-level configuration (grid size, palette, pick shape, shuffle/belt parameters) so difficulty can be tuned without code changes
- A repeatable pipeline for turning a real image into a level's target-color grid

**Non-Goals:**
- Multiple shipped levels (plumbing supports it; only one ships)
- Any persistence (no localStorage/cross-session state, unlike the platformer's collected-hats tracking)
- Backend/API integration of any kind
- Broader test infrastructure for the rest of the repo — `vitest` is added scoped to this feature's pure-logic files only

## Decisions

### Decision 1: Reuse Excalibur.js, but with an independent engine setup

**Chosen**: A second `createEngine.ts` inside `features/jewel/engine/`, mirroring the platformer's factory shape (`Engine({ canvasElementId, width, height, displayMode, antialiasing: false })`) but with `physics.gravity` set to zero — this game has no falling bodies, only pointer-driven grid picks and a programmatically-rotated ring.

**Rationale**: Keeps the two games fully independent (one can change without risking the other) while still following the established "Excalibur canvas + React chrome" pattern from Decision 2 of the platformer's design.

**Alternatives considered**: Sharing one `createEngine` across both features — rejected, since the platformer's factory bakes in platformer-only constants (`GAME_WIDTH`, `GAME_HEIGHT`, `GRAVITY`) and parameterizing it for two unrelated games adds coupling for no reuse benefit beyond a few lines of boilerplate.

### Decision 2: One Scene renders both the board and the belt

**Chosen**: A single `JewelScene` draws the board grid in the upper portion of the canvas and the conveyor ring in the lower portion, matching the requested "board on top, belt below" layout in one canvas rather than stacking two separate canvases/components.

**Rationale**: Simplest composition; the two halves need to interact every frame (eject moves a jewel from belt-space to board-space), which is easier within one Scene's update loop than coordinating two.

**Alternatives considered**: Separate `<canvas>` per half with cross-component event wiring — rejected as unnecessary indirection for a single-screen game.

### Decision 3: Pure, Excalibur-free game-logic modules

**Chosen**: `shuffle.ts`, `BoardEngine.ts`, and `BeltEngine.ts` contain zero Excalibur imports. `JewelScene` owns instances of `BoardEngine`/`BeltEngine`, calls into them on pointer input and on each `onPreUpdate` tick, and reads their state to position Actors — but all the actual rules (can a jewel be inserted, has the player won, is the belt stuck) live in plain TS.

**Rationale**: This is the part of the game most likely to have subtle bugs (capacity math, randomized eject/insert choices, stuck-state detection) and the part most worth covering with fast unit tests. Keeping it framework-free also means tests don't need a DOM/canvas environment.

**Alternatives considered**: Logic embedded directly in `JewelScene` (as the platformer's `LevelScene` does for its own mechanics) — rejected here specifically because this game's belt/stuck-detection logic is more combinatorial and error-prone than the platformer's, and is worth isolating for testing. The platformer precedent is not a hard constraint to replicate.

### Decision 4: Belt as a fixed-slot ring with rotation-gated ejection

**Chosen**: The belt is a `maxStacks`-length array of slots, each at a fixed base angle; a single `ringRotationDeg` advances with elapsed time. Insertion is **not** gated by rotation (a pick can stack onto or create a slot regardless of its current angle); ejection **is** gated — a slot only gets an eject attempt the tick its visual angle crosses the fixed eject-point angle.

**Rationale**: This was the explicit, confirmed design intent (see spec scenarios) — it gives the belt's spin actual gameplay weight (pacing/difficulty) rather than being purely decorative, and keeps insertion simple and always-available when capacity allows.

**Alternatives considered**: Instant/continuous ejection whenever a match exists — rejected because it trivializes the belt-capacity pressure that drives the lose condition.

### Decision 5: Pick-then-validate via clone-and-simulate, never partial application

**Chosen**: A pick's candidate jewel colors are checked by cloning the belt state and simulating every insertion; only if all succeed does the real board/belt mutate. Otherwise nothing changes and a `pick-blocked` event fires.

**Rationale**: Guarantees the board and belt never end up in an inconsistent state from a partially-applied pick, and keeps the loss condition cleanly separated from pick validation (losing happens only via the dedicated stuck-state scan, never as a side effect of a blocked pick).

### Decision 6: Chunk shuffle via paired flood-fill regions, seeded for tests

**Chosen**: `shuffleBoard(targetColors, config, rng)` grows two same-size contiguous regions via flood fill and swaps their contents pairwise, repeated `regionCount` times. Starts from a full copy of `targetColors` (a trivially "solved" grid) so the shuffle is always a pure permutation — every level is solvable by construction, with no separate solvability check needed.

**Rationale**: Satisfies "shuffled by chunks, not per-cell" directly, and sidesteps solvability analysis entirely by construction. The `rng: () => number` parameter makes it trivially seedable for deterministic unit tests.

### Decision 7: Image-to-grid conversion as a committed, manually-run script

**Chosen**: `frontend/scripts/pixelate-image.mjs`, using `jimp` (pure-JS, no native build step) to downsample an input image to `gridSize × gridSize` and quantize each cell to the nearest color in the level's palette, writing a `levels/levelN.ts` file. Run manually by a developer when adding/changing a level; not part of the Vite build.

**Rationale**: `jimp` avoids `sharp`'s native-binary build requirements, which matters in the devcontainer and any CI image. Running it as a one-off script (rather than at build time) keeps level data as plain committed TypeScript, consistent with how the platformer's levels work (Decision 3 in its design doc) and avoids adding image-processing to the production build graph.

**Alternatives considered**: `sharp` — rejected due to native-binary install risk in constrained/sandboxed environments; runtime (build-time) pixelation — rejected, adds a build dependency for something that only needs to happen once per level.

### Decision 8: Vitest, scoped to this feature only

**Chosen**: Add `vitest` as a devDependency and a `test` script, with unit tests only under `features/jewel/engine/*.test.ts`. No repo-wide test configuration changes.

**Rationale**: The repo has deliberately shipped without test infrastructure so far (see `CLAUDE.md`); introducing a full test strategy for the whole repo is out of scope for this change. Vitest is Vite-native (same config format, same transform pipeline) so it adds minimal setup for just this feature's pure-logic files.

## Risks / Trade-offs

- **Rotation-gated ejection could feel "unfair" if belt speed is miscalibrated** (jewels seem to sit forever) → Mitigation: `rotationPeriodMs` is a per-level config value, tunable without code changes; default (8000ms/lap ÷ 12 slots) gives each slot a shot roughly every ~667ms of relative passage.
- **Flood-fill region growth can stall near grid edges/already-claimed cells**, failing to reach the target region size → Mitigation: the algorithm retries with a smaller target size rather than failing; worst case degrades to a simple single-cell swap, which still produces a valid (if less chunky) shuffle.
- **`jimp`'s color quantization may not visually resemble the source image at small grid sizes** (8×8 is very coarse) → Mitigation: this is an accepted trade-off of the "pixelated picture" goal; palette and grid size are both level-config knobs if a given source image doesn't quantize well.
- **Adding `vitest` introduces the repo's first test runner, which may invite scope creep (requests to test other features)** → Mitigation: explicitly out of scope per `proposal.md`; this change touches only `features/jewel/`'s test files and the minimal `vitest` config/script needed to run them.

## Migration Plan

Additive only — no existing routes, components, or shared modules are modified beyond adding a nav link and a route entry. Rollback: remove the `/jewel` route, the nav entry, the `features/jewel/` directory, and the `jimp`/`vitest` devDependencies.

## Open Questions

- Which source image to use for the first level's pixelated picture — can be decided during implementation (any reasonably high-contrast image works) without affecting specs, approach, or tasks.
