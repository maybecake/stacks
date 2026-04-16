### Requirement: Game route exists in the frontend
The system SHALL expose a `/game` route in the React Router configuration that renders the puzzle game page.

#### Scenario: Navigating to /game
- **WHEN** the user navigates to `/game`
- **THEN** the game page renders with an Excalibur canvas and a HUD overlay

#### Scenario: Nav link present
- **WHEN** the user views the Header on any page
- **THEN** a "Game" nav link is visible that routes to `/game`

### Requirement: Game engine initializes on mount
The system SHALL initialize an Excalibur `Engine` instance attached to a `<canvas>` element when the game page mounts, and SHALL stop and dispose it when the page unmounts.

#### Scenario: Engine starts
- **WHEN** the game page component mounts
- **THEN** an Excalibur engine is created, assets are loaded, and the first level scene starts

#### Scenario: Engine cleans up
- **WHEN** the user navigates away from `/game`
- **THEN** the engine is stopped and the canvas is removed with no memory leaks

### Requirement: Game renders at a fixed resolution
The game canvas SHALL render at 960×540 logical pixels, scaled to fit the available viewport width while preserving aspect ratio.

#### Scenario: Wide viewport
- **WHEN** the viewport is wider than 960px
- **THEN** the canvas is displayed at 960px wide, centered

#### Scenario: Narrow viewport
- **WHEN** the viewport is narrower than 960px
- **THEN** the canvas scales down proportionally with no horizontal scroll

### Requirement: HUD displays game state
A React HUD overlay SHALL display the current hat count (collected / total), and the key held by the player (if any), overlaid on top of the canvas.

#### Scenario: Hat counter updates
- **WHEN** the player collects a hat
- **THEN** the HUD hat counter increments within the same frame

#### Scenario: Key indicator
- **WHEN** the player is carrying a key
- **THEN** the HUD shows the key icon; when not carrying a key, the icon is hidden

### Requirement: Asset loading screen
The game SHALL display a loading indicator while Excalibur loads sprite sheets and images, and transition to gameplay automatically when loading completes.

#### Scenario: Assets loading
- **WHEN** the engine is initializing and assets are not yet ready
- **THEN** a loading message or spinner is shown on the canvas

#### Scenario: Assets ready
- **WHEN** all assets have loaded
- **THEN** the loading indicator disappears and the first level begins
