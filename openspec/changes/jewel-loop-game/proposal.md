## Why

The frontend has one browser game (the Hat Puzzle platformer at `/game`). Adding a second, mechanically distinct game — a jewel-matching "conveyor belt" puzzle — grows the site's interactive content and reuses the existing Excalibur.js engine conventions established by the first game, proving those conventions generalize to a new genre without forking the whole approach.

## What Changes

- New `/jewel` route added to the React Router frontend
- New `Jewel` feature page and component tree under `frontend/src/features/jewel/`, following the same engine/actors/scenes/levels/components split as `frontend/src/features/game/`, but as its own independent feature (no shared runtime code between the two games)
- A pixelated-image target board: an N×N grid where each cell has a fixed target color forming a picture, generated from a real image by a new one-off conversion script
- A chunk-shuffle algorithm that scrambles starting jewels in contiguous flood-filled regions rather than per-cell randomization
- A looping conveyor belt mechanic: picking a jewel (plus its orthogonal neighbors) sends it to a rotating ring of capped, same-color stacks; the ring automatically returns jewels to matching empty board cells as stacks rotate past a fixed eject point
- Win when the board is fully and correctly filled; lose when the belt has no room for any jewel the player could still pick (a stuck-state check, not raw capacity)
- Jewel/belt feature page registered in the Header navigation
- New `vitest` devDependency, scoped to unit-testing this feature's pure game logic only (shuffle, belt, pick-group computation) — the repo has no test runner today

## Capabilities

### New Capabilities

- `jewel-board`: The N×N target-color grid, starting jewel placement via chunk-shuffle, pick-group selection (clicked cell + neighbors), cell locking once correctly filled, and the win condition
- `jewel-belt`: The capped-stack conveyor ring — insertion (stack-or-new-slot), rotation-gated ejection back to matching board cells, pick-blocking when the belt has no room, and the stuck-state loss condition
- `jewel-level`: Per-level configuration (grid size, palette, pick shape, shuffle parameters, belt capacity/speed) and the data file produced by the image-to-grid conversion script; the `/jewel` route, page, and nav entry

### Modified Capabilities

(none — this change only adds new capabilities)

## Impact

- `frontend/src/features/jewel/` — new feature directory (engine, actors, scenes, levels, config, components)
- `frontend/scripts/pixelate-image.mjs` — new one-off image-to-level-data conversion script
- `frontend/src/App.tsx` — new `/jewel` route
- `frontend/src/components/Header.tsx` — nav link added
- `frontend/src/features/index.ts` — barrel export added
- `frontend/package.json` — new `jimp` (image decoding, script-only) and `vitest` (test runner) devDependencies
- No backend changes required; no changes to the existing `features/game/` platformer
