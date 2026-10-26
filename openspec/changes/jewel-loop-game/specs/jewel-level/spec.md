## Purpose

Defines how a level's tunable parameters and target-color picture are configured and produced, and how the game is reachable and surfaced in the app's navigation and HUD.

## ADDED Requirements

### Requirement: Level configuration is data, not code
Each level SHALL be defined by a configuration object specifying: grid size, color palette, the target-color grid, pick shape (`plus` or `block3x3`), shuffle parameters (region count, min/max region size), and belt parameters (`maxStacks`, `maxStackSize`, `rotationPeriodMs`). Omitted parameters SHALL fall back to documented defaults (8×8 grid, 5-color palette, `plus` pick shape, `maxStacks` 12, `maxStackSize` 8).

#### Scenario: Level overrides a parameter
- **WHEN** a level's configuration specifies a non-default value for any parameter (e.g. a smaller `maxStacks`)
- **THEN** gameplay uses that level's value instead of the default

#### Scenario: Level omits a parameter
- **WHEN** a level's configuration does not specify a given parameter
- **THEN** the documented default value is used

### Requirement: A level's target-color grid is produced from a real image
There SHALL be a repeatable, documented process that converts a real source image into a level's target-color grid by downsampling it to the level's grid size and mapping each resulting cell to the nearest color in the level's palette, producing a committed data file consumed directly by the game at runtime (no image processing at runtime).

#### Scenario: Generated grid matches declared dimensions
- **WHEN** the conversion process runs against a source image for a level with grid size N
- **THEN** the produced target-color grid has exactly N rows and N columns, each cell holding one color from that level's palette

### Requirement: The game is reachable from the app's navigation
The system SHALL expose a route that renders the jewel game, and a navigation link to that route SHALL be visible from the app's header.

#### Scenario: Navigating to the jewel game
- **WHEN** the user navigates to the jewel game's route
- **THEN** the jewel game page renders with the board and the belt visible

#### Scenario: Nav link present
- **WHEN** the user views the header on any page
- **THEN** a nav link to the jewel game is visible and routes to it

### Requirement: HUD reflects belt occupancy and level outcome
A HUD overlay SHALL display the current number of occupied belt stacks out of the configured maximum, and SHALL display a win or loss banner (with a restart action) when the level completes or fails.

#### Scenario: Belt occupancy updates
- **WHEN** a stack is created or emptied on the belt
- **THEN** the HUD's occupied-stack count updates to reflect the new total

#### Scenario: Win banner shown
- **WHEN** the level completes
- **THEN** the HUD shows a win banner with an option to restart

#### Scenario: Loss banner shown
- **WHEN** the level fails because no legal pick remains
- **THEN** the HUD shows a loss banner with an option to restart

### Requirement: A blocked pick gives immediate visible feedback
When a pick is rejected because the belt cannot accept it, the game SHALL visibly indicate the rejection on the clicked cell without changing any board or belt state.

#### Scenario: Blocked pick flashes the cell
- **WHEN** the player clicks a cell whose resulting selection would be rejected by the belt
- **THEN** the clicked cell briefly flashes to indicate the move was not allowed, and reverts with no state change
