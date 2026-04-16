## Context

The frontend is a React + TypeScript SPA (Vite, React Router v5) with no game or canvas content today. We need to integrate a real-time game loop, sprite rendering, and physics into a React page without disrupting the existing app shell (theme system, routing, header).

The user will supply a sprite sheet (character animations) and individual asset images (hats, keys). These will be placed in `frontend/public/assets/game/`.

## Goals / Non-Goals

**Goals:**
- Render a playable 2D puzzle game on a `/game` route
- Support player actions: walk, jump, push blocks, pick up / carry objects, collect hats
- Load character animations from a sprite sheet
- Load hat and key assets from individual images
- Win condition per level (collect all hats, or reach a door with correct key)
- Integrate cleanly into existing React app shell (no style bleed, theme-aware chrome)

**Non-Goals:**
- Saving game progress to backend
- Multiplayer
- Level editor UI
- Sound (can be added later)
- Mobile touch controls (keyboard only for now)

## Decisions

### Decision 1: Game Engine — Excalibur.js

**Chosen**: Excalibur.js (`excalibur` on npm, ~250 KB min+gzip)

**Rationale**:
- TypeScript-first: full types, no `@types/` package needed
- Lightweight compared to Phaser (Phaser: ~1 MB); Excalibur covers physics, sprites, scenes, input out of the box
- `SpriteSheet` and `Animation` APIs match the user's asset format exactly
- Active maintenance, good docs

**Alternatives considered**:
- **Phaser 3** — powerful but large, JavaScript-first with partial TS support
- **Kaboom.js** — fun API but global-state heavy, hard to colocate with React
- **Hand-rolled canvas** — zero deps but reimplements physics, input, sprite animation from scratch; disproportionate effort

### Decision 2: React ↔ Excalibur Integration

**Chosen**: Mount Excalibur onto a `<canvas>` ref inside a React component. The game engine owns the canvas; React owns the surrounding UI (score, hat counter, level title).

```
<GamePage>
  ├── <GameHUD />         ← React: hat counter, level name, key indicator
  └── <canvas ref={...} /> ← Excalibur: full ownership
</GamePage>
```

Excalibur engine is created in a `useEffect` on mount and `.stop()`-ed on unmount. A shared `GameState` (simple ref / context) lets the game emit events to React for HUD updates.

**Rationale**: Keeps game logic fully outside React's render cycle. No re-render triggers during gameplay.

### Decision 3: Level Data Format

**Chosen**: TypeScript level definition objects (no external file format).

Each level is a `LevelDef` object with a 2D tile array, entity placements (hats, keys, blocks), and a win condition. Levels live in `frontend/src/features/game/levels/`.

**Rationale**: Zero parsing overhead, full TypeScript types, easy to add levels without a build step change. Can migrate to JSON/Tiled later if levels grow complex.

### Decision 4: Asset Pipeline

Sprite sheets and images go in `frontend/public/assets/game/`. Vite serves them as static files. Excalibur loads them via URL at engine init (no webpack loaders needed).

Character sprite sheet: single PNG with frames arranged in a grid. Frame size and layout defined as constants the user fills in once assets are provided.

## Risks / Trade-offs

- **Sprite sheet layout unknown** → Mitigation: define `SPRITE_CONFIG` constants that the user updates when providing assets; stub with placeholder colored rectangles during development
- **Excalibur canvas conflicts with React strict mode double-invoke** → Mitigation: `useEffect` cleanup calls `engine.stop()` and removes the canvas child; guard against double-init with a ref flag
- **Theme system CSS bleeds into canvas** → Mitigation: canvas is styled with explicit dimensions and `display: block`; game chrome (HUD) uses existing CSS custom properties

## Migration Plan

No migration needed — this is additive. The `/game` route is new; no existing routes are modified beyond adding a nav link. Rollback: remove the route and nav entry.

## Open Questions

- Exact sprite sheet dimensions (frame width/height, frame count per animation row) — user to provide with assets
- Number and design of initial levels — start with 2–3 levels to validate mechanics
- Should hats persist as collectibles across levels (total collection) or reset per level?
