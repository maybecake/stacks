## 1. Project Setup

- [x] 1.1 Install Excalibur.js (`pnpm add excalibur`) in the frontend package
- [x] 1.2 Create `frontend/public/assets/game/` directory and add placeholder sprite sheet PNG and placeholder hat/key PNGs
- [x] 1.3 Define `SPRITE_CONFIG` constants file (`frontend/src/features/game/config/sprites.ts`) with frame width, height, and animation row mappings (stubbed to placeholders)
- [x] 1.4 Create feature directory structure: `frontend/src/features/game/` with subdirs `engine/`, `scenes/`, `actors/`, `levels/`, `components/`, `config/`

## 2. Routing and Navigation

- [x] 2.1 Add `/game` route to `frontend/src/App.tsx` pointing to the new `GamePage` component
- [x] 2.2 Add "Game" nav link to `frontend/src/components/layout/Header.tsx`

## 3. Game Engine Bootstrap

- [x] 3.1 Create `frontend/src/features/game/engine/createEngine.ts` — factory that builds and configures an Excalibur `Engine` at 960×540, scaled to fit viewport
- [x] 3.2 Create `frontend/src/features/game/engine/resources.ts` — defines `ImageSource` entries for sprite sheet, hats, and keys; exports a `loader` instance
- [x] 3.3 Create `frontend/src/features/game/components/GameCanvas.tsx` — React component that mounts a `<canvas>`, initializes the engine in `useEffect`, starts the loader, and cleans up on unmount
- [x] 3.4 Create `frontend/src/features/game/components/GamePage.tsx` — page wrapper with HUD overlay and `GameCanvas`

## 4. HUD Component

- [x] 4.1 Create `frontend/src/features/game/components/GameHUD.tsx` — React component displaying hat counter and key indicator
- [x] 4.2 Create `frontend/src/features/game/engine/GameEventBus.ts` — lightweight event emitter (or simple React ref/state) for game→HUD communication
- [x] 4.3 Wire hat-collected and key-picked-up events from game actors to the HUD via the event bus

## 5. Level Data

- [x] 5.1 Define `LevelDef` TypeScript type in `frontend/src/features/game/levels/types.ts` (tile grid, entity list, win condition)
- [x] 5.2 Create `frontend/src/features/game/levels/level1.ts` — first playable level with ground, a few blocks, 2–3 hats
- [x] 5.3 Create `frontend/src/features/game/levels/level2.ts` — second level introducing a key and door
- [x] 5.4 Create `frontend/src/features/game/levels/index.ts` — exports ordered levels array

## 6. Scene and Tile System

- [x] 6.1 Create `frontend/src/features/game/scenes/LevelScene.ts` — Excalibur `Scene` subclass that reads a `LevelDef` and spawns tile actors and entities
- [x] 6.2 Implement solid tile actor with static body and collision type
- [x] 6.3 Implement death zone detection (below level floor → reset level)
- [x] 6.4 Implement level transition on win condition met (advance to next level or show victory screen)
- [x] 6.5 Implement level reset on R key press and on death

## 7. Player Actor

- [x] 7.1 Create `frontend/src/features/game/actors/Player.ts` — Excalibur `Actor` subclass with dynamic body
- [x] 7.2 Implement horizontal movement (left/right arrow + A/D) with immediate stop on key release
- [x] 7.3 Implement jump (up / W / Space) with ground detection; no double jump
- [x] 7.4 Implement sprite flipping based on last movement direction
- [x] 7.5 Create `frontend/src/features/game/actors/PlayerAnimations.ts` — builds Excalibur `Animation` instances from sprite sheet for idle, walk, jump, carry-idle, carry-walk states
- [x] 7.6 Wire animation state machine: ground/air × moving/still × carrying/not-carrying → correct animation
- [x] 7.7 Implement interact key (E or F) handler for pick-up and put-down logic
- [x] 7.8 Implement carry offset: carried object follows player at a fixed position offset each frame

## 8. Pushable Block Actor

- [x] 8.1 Create `frontend/src/features/game/actors/PushBlock.ts` — dynamic actor with collision
- [x] 8.2 Implement tile-aligned slide-one-tile push mechanic triggered by player collision
- [x] 8.3 Handle blocked push (wall or block on far side): neither player nor block moves
- [x] 8.4 Handle block gravity (block falls if no support below)

## 9. Collectible Actors

- [x] 9.1 Create `frontend/src/features/game/actors/Hat.ts` — static actor, collidable pickup trigger
- [x] 9.2 Implement hat pickup via interact key (player adjacent) or overlap trigger
- [x] 9.3 On hat collected: emit event to HUD, remove actor from scene, update win condition check
- [x] 9.4 Create `frontend/src/features/game/actors/Key.ts` — static actor, pickupable via interact
- [x] 9.5 Create `frontend/src/features/game/actors/Door.ts` — static blocking actor; removed when player with matching key overlaps it; key is consumed

## 10. Victory Screen

- [x] 10.1 Create `frontend/src/features/game/scenes/VictoryScene.ts` — shown after final level; displays congratulations text and a "Play Again" option
- [x] 10.2 Wire "Play Again" to restart from level 1

## 11. Polish and Integration

- [x] 11.1 Replace placeholder sprite assets with user-provided sprite sheet and hat/key PNGs; update `SPRITE_CONFIG` constants
- [x] 11.2 Verify canvas scaling works at multiple viewport widths (no horizontal scroll, correct aspect ratio)
- [x] 11.3 Verify engine cleanup: navigate away and back to `/game` multiple times; confirm no duplicate engines or memory leaks
- [x] 11.4 Run `pnpm build` and confirm TypeScript strict-mode passes with no new errors
- [x] 11.5 Run `pnpm lint` and fix any ESLint issues
