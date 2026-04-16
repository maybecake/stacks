### Requirement: Level defined as a TypeScript data structure
Each level SHALL be defined as a `LevelDef` TypeScript object containing a tile grid, entity spawn positions, and a win condition. Levels SHALL be imported statically and require no network fetch.

#### Scenario: Level loads from definition
- **WHEN** the game transitions to a level by index
- **THEN** the engine reads the corresponding `LevelDef` and builds the scene from its tile grid and entity list

#### Scenario: Unknown level index
- **WHEN** the game requests a level index beyond the defined levels array
- **THEN** the game stays on the current level and does not crash

### Requirement: Tile grid defines solid geometry
The level tile grid SHALL encode ground, walls, and empty space. Solid tiles SHALL produce collidable static bodies. Empty tiles SHALL be passable.

#### Scenario: Player cannot pass through solid tile
- **WHEN** the player or a block moves into a solid tile position
- **THEN** movement is blocked by collision

#### Scenario: Player falls through empty space
- **WHEN** there is no solid tile below the player
- **THEN** gravity pulls the player downward until a surface is reached

### Requirement: Pushable blocks are level entities
Pushable blocks SHALL be defined in the level entity list with a tile coordinate. They SHALL be collidable, movable by the player, and SHALL stack or rest on solid ground.

#### Scenario: Block rests on ground
- **WHEN** a pushable block is placed above empty space
- **THEN** it falls and comes to rest on the first solid surface below it

#### Scenario: Block can be pushed onto another block
- **WHEN** the player pushes a block and the space above an adjacent block is empty
- **THEN** the block lands on top of the adjacent block, creating a two-high stack

### Requirement: Hat entities are collectible
Hats SHALL be defined in the level entity list with a tile coordinate and a unique identifier. When collected, the hat entity SHALL be removed from the scene.

#### Scenario: Hat spawns at defined position
- **WHEN** a level loads with a hat entity
- **THEN** the hat sprite appears at the specified tile coordinate

#### Scenario: Collected hat disappears
- **WHEN** the player collects a hat
- **THEN** the hat entity is removed from the scene and does not reappear

### Requirement: Key entities unlock doors
Keys SHALL be level entities with a tile coordinate. Doors SHALL be level entities linked to a key by matching ID. Carrying a key to its matching door SHALL open (remove) the door.

#### Scenario: Key picked up
- **WHEN** the player interacts with a key on the ground
- **THEN** the key is carried by the player

#### Scenario: Door opens with correct key
- **WHEN** the player carrying a key walks into the matching door tile
- **THEN** the door is removed and the path becomes passable; the key is consumed

#### Scenario: Door does not open without key
- **WHEN** the player without a key walks into a door tile
- **THEN** the door blocks movement

### Requirement: Win condition triggers level completion
Each level SHALL have a win condition (all hats collected, or all hats collected AND a specific door reached). When the win condition is met, the game SHALL transition to the next level or a victory screen.

#### Scenario: All hats collected — advance
- **WHEN** the last hat is collected and the win condition is `all-hats`
- **THEN** a brief celebration effect plays and the next level loads

#### Scenario: All levels complete
- **WHEN** the player completes the final level
- **THEN** a victory/congratulations screen is shown with a replay option

### Requirement: Level resets on player death or request
If the player falls into a death zone (below the level floor) or presses R, the current level SHALL reset to its initial state.

#### Scenario: Fall below level
- **WHEN** the player's Y position exceeds the bottom boundary of the level
- **THEN** the level resets with all entities at their starting positions

#### Scenario: Manual reset
- **WHEN** the player presses R
- **THEN** the current level resets immediately
