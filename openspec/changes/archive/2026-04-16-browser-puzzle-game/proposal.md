## Why

The frontend has no interactive entertainment or game content. Adding a browser-based puzzle game demonstrates rich interactivity, introduces sprite-based rendering, and gives users a fun page to explore alongside the existing tools.

## What Changes

- New `/game` route added to the React Router frontend
- New `Game` feature page and component tree under `frontend/src/features/game/`
- Lightweight TypeScript game engine integrated (Kaboom.js or Excalibur.js, to be confirmed in design)
- Sprite sheet loading system for animated player character
- Asset pipeline for hats, keys, and block objects
- Game page registered in the Header navigation

## Capabilities

### New Capabilities

- `puzzle-game`: Core browser game — engine setup, canvas rendering, game loop, input handling, scene management, and the `/game` route page
- `puzzle-player`: Player character mechanics — sprite animation (idle, walk, jump, carry), jumping physics, picking up and carrying objects, collecting hats
- `puzzle-level`: Level system — static tilemap/block layout, pushable blocks, collectible hats, keys, win conditions (all hats collected or door unlocked)

### Modified Capabilities

## Impact

- `frontend/src/features/game/` — new feature directory
- `frontend/src/App.tsx` — new `/game` route
- `frontend/src/components/layout/Header.tsx` — nav link added
- `package.json` / `pnpm-lock.yaml` — new game engine dependency
- `frontend/public/assets/` — sprite sheets and game assets placed here
- No backend changes required
