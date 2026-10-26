## Purpose

Defines the N×N target-color picture, the chunk-shuffled starting arrangement of jewels on top of it, which jewels a click selects, and when the board counts as solved.

## ADDED Requirements

### Requirement: Board has a fixed target-color grid
Each level SHALL define an N×N grid of target colors (a pixelated picture) that does not change for the lifetime of the level. The board SHALL render each cell's target color as its background regardless of what jewel (if any) currently occupies it.

#### Scenario: Target grid is immutable during play
- **WHEN** the player picks, or the belt ejects, jewels during gameplay
- **THEN** the target color of every cell remains exactly as defined by the level, unaffected by jewel movement

### Requirement: Starting jewels are chunk-shuffled, not per-cell randomized
At level start, every cell SHALL hold a jewel whose color set exactly matches the target-color grid's color counts (i.e. the starting arrangement is a permutation of the solved board). The permutation SHALL be produced by repeatedly swapping the contents of two randomly-grown, same-sized contiguous regions, rather than shuffling individual cells independently.

#### Scenario: Shuffled board is a valid permutation
- **WHEN** a level starts
- **THEN** for every color, the number of cells holding a jewel of that color equals the number of cells whose target color is that color

#### Scenario: Shuffle produces contiguous clusters
- **WHEN** a level starts
- **THEN** the mis-colored cells visibly appear in contiguous clustered regions rather than as independent, isolated single-cell swaps

#### Scenario: Shuffled board is always solvable
- **WHEN** a level starts with any shuffle outcome
- **THEN** there exists a sequence of picks and ejections that fills every cell correctly, with no level ever starting in an unsolvable state

### Requirement: Picking a cell selects it and its configured neighbors
Clicking a non-empty, non-locked board cell SHALL select that cell plus its neighbors according to the level's configured pick shape (`plus`: up to 4 orthogonal neighbors; `block3x3`: up to 8 surrounding neighbors), excluding any neighbor that is out of bounds, empty, or already locked. The selected jewels SHALL be removed from the board only if every one of them can be accepted by the belt (see `jewel-belt`); otherwise none are removed.

#### Scenario: Plus-shape pick at board interior
- **WHEN** the pick shape is `plus` and the player clicks a non-empty, non-locked interior cell
- **THEN** the clicked cell and up to 4 orthogonally adjacent non-empty, non-locked cells are selected

#### Scenario: Pick shape clipped at board edge
- **WHEN** the clicked cell is on an edge or corner
- **THEN** out-of-bounds neighbor positions are simply omitted from the selection, not substituted with other cells

#### Scenario: Locked or empty neighbors are excluded
- **WHEN** a neighbor within the pick shape is locked or empty
- **THEN** that neighbor is not included in the selection

#### Scenario: Clicking an empty cell does nothing
- **WHEN** the player clicks a cell with no jewel on it
- **THEN** no selection occurs and no board or belt state changes

#### Scenario: Clicking a locked cell does nothing
- **WHEN** the player clicks a cell whose jewel already matches its target color
- **THEN** no selection occurs and no board or belt state changes

### Requirement: A cell locks permanently once its jewel matches its target color
Whenever a cell's current jewel color equals its target color — whether from the initial shuffle or from a belt ejection — that cell SHALL become locked: it can no longer be clicked, selected, or have its jewel removed for the remainder of the level.

#### Scenario: Coincidental starting match locks immediately
- **WHEN** the initial shuffle happens to place the correct color on a cell
- **THEN** that cell is locked from the start of the level

#### Scenario: Ejected jewel locks its cell
- **WHEN** the belt ejects a jewel into an empty cell whose target color matches
- **THEN** that cell becomes locked immediately

#### Scenario: Locked cells cannot be undone
- **WHEN** a cell is locked
- **THEN** no player action or game event can empty it or change its jewel for the rest of the level

### Requirement: Level completes when every cell is locked
The level SHALL be won the moment every cell on the board is locked (holds a jewel matching its target color).

#### Scenario: Last cell locks
- **WHEN** the final unlocked cell becomes locked (via shuffle coincidence or belt ejection)
- **THEN** the game emits a level-complete result and gameplay input is disabled
