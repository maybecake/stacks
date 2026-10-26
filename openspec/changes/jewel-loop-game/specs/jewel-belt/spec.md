## Purpose

Defines the capped-capacity conveyor ring that temporarily holds jewels picked off the board, how and when it hands jewels back to the board, and when it is considered stuck (the loss condition).

## ADDED Requirements

### Requirement: Belt holds same-color stacks up to a per-level capacity
The belt SHALL hold up to `maxStacks` independent stacks (default 12), each holding jewels of a single color up to `maxStackSize` per stack (default 8). Both limits SHALL be configurable per level.

#### Scenario: Jewel joins an existing matching stack
- **WHEN** a jewel of color X is inserted and a belt stack of color X exists with fewer than `maxStackSize` jewels
- **THEN** that stack's count increases by one and no new stack is created

#### Scenario: Jewel starts a new stack
- **WHEN** a jewel of color X is inserted and no belt stack currently holds color X (or all color-X stacks are at `maxStackSize`), and at least one belt slot is empty
- **THEN** a new stack of color X with count 1 occupies one of the currently-empty slots, chosen at random among the empty slots

#### Scenario: Insertion fails when no slot can hold the jewel
- **WHEN** a jewel of color X is inserted and every color-X stack is full and no slot is empty
- **THEN** the insertion fails and the belt's state does not change

### Requirement: A pick is only applied if every jewel in it can be inserted
Before removing jewels from the board for a pick, the system SHALL verify that every jewel in the selection could be inserted into the belt, accounting for the effect of inserting the earlier jewels in the same selection first. If any jewel in the selection cannot be inserted, the entire pick SHALL be rejected: no jewel is removed from the board and no belt state changes.

#### Scenario: Entire pick succeeds
- **WHEN** every jewel in a multi-jewel selection can be inserted into the belt, in sequence
- **THEN** all selected cells are cleared on the board and the belt reflects every insertion

#### Scenario: Entire pick is rejected on partial failure
- **WHEN** at least one jewel in the selection cannot be inserted into the belt even after accounting for the earlier jewels in the same selection
- **THEN** no cells are cleared, no jewel is inserted, and the game signals that the pick was blocked

### Requirement: Belt visibly rotates continuously
The belt SHALL rotate at a constant, configurable angular speed (`rotationPeriodMs` per full lap) for as long as the level is in progress, independent of player actions.

#### Scenario: Rotation continues without player input
- **WHEN** the player takes no action for several seconds during gameplay
- **THEN** the belt's visual rotation continues advancing

### Requirement: A stack only ejects when it passes the eject point
Each belt stack SHALL get an ejection opportunity only at the moment its rotating position crosses a fixed eject-point location, at most once per full lap. At that moment, if at least one empty board cell's target color matches the stack's color, one such cell SHALL be chosen at random and filled with one jewel from the stack (decreasing its count by one, freeing the slot if the count reaches zero). If no such cell exists at that moment, the stack SHALL continue rotating unchanged and SHALL get another ejection opportunity on its next pass.

#### Scenario: Eject succeeds with a matching empty cell
- **WHEN** a stack's position crosses the eject point and at least one empty board cell's target color matches the stack's color
- **THEN** one matching empty cell is chosen at random, receives one jewel of that color, becomes locked, and the stack's count decreases by one

#### Scenario: Stack empties and frees its slot
- **WHEN** a stack's count reaches zero after an ejection
- **THEN** its belt slot becomes empty and available for a new stack

#### Scenario: No eject opportunity mid-rotation
- **WHEN** a stack has not yet crossed the eject point since its last pass
- **THEN** it does not eject even if a matching empty board cell exists

#### Scenario: Eject skipped with no matching cell
- **WHEN** a stack's position crosses the eject point and no empty board cell's target color matches the stack's color
- **THEN** no jewel is ejected and the stack is unchanged, awaiting its next pass

### Requirement: Level fails when no legal pick remains
After every belt or board change, the system SHALL check whether any non-empty, non-locked board cell still has a legal pick available (one where every jewel in its selection could currently be inserted into the belt). If at least one non-empty, non-locked cell exists and none of them have a legal pick, the level SHALL fail. If no non-empty, non-locked cells exist at all, the level SHALL NOT fail on this basis (remaining belt jewels will eventually find a matching empty cell as rotation continues).

#### Scenario: Game continues with at least one legal pick
- **WHEN** at least one non-empty, non-locked board cell has a selection that the belt can currently fully accept
- **THEN** the level continues normally, even if the belt is otherwise near capacity

#### Scenario: Level fails when every remaining pick is blocked
- **WHEN** at least one non-empty, non-locked board cell exists and every such cell's selection would be rejected by the belt
- **THEN** the level ends in a loss, signaled as the belt having filled up

#### Scenario: No failure while only locked and empty cells remain
- **WHEN** every board cell is either locked or empty (no non-empty, non-locked cells remain), even if the board is not yet fully solved
- **THEN** the level does not fail; play continues until remaining belt jewels are ejected
