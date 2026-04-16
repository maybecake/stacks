## ADDED Requirements

### Requirement: Player moves horizontally with keyboard input
The player character SHALL move left and right using the arrow keys or A/D keys. Movement SHALL stop immediately when the key is released.

#### Scenario: Move right
- **WHEN** the player holds the right arrow key or D
- **THEN** the character moves right at a constant walk speed

#### Scenario: Move left
- **WHEN** the player holds the left arrow key or A
- **THEN** the character moves left at a constant walk speed

#### Scenario: Stop on key release
- **WHEN** the player releases the movement key while on the ground
- **THEN** the character stops moving horizontally

### Requirement: Player jumps
The player character SHALL jump when the up arrow, W, or Space key is pressed, and only when standing on the ground or a block surface. Double-jumping SHALL NOT be permitted.

#### Scenario: Jump from ground
- **WHEN** the player presses jump while on the ground
- **THEN** the character launches upward with a fixed initial velocity

#### Scenario: No double jump
- **WHEN** the player presses jump while already airborne
- **THEN** nothing happens

#### Scenario: Land on surface
- **WHEN** the character's feet reach a platform or block top
- **THEN** the character lands and becomes grounded again

### Requirement: Player faces the direction of movement
The character sprite SHALL flip horizontally to face the direction of the last horizontal input.

#### Scenario: Facing right
- **WHEN** the player last moved right or faces right by default
- **THEN** the sprite is rendered normally (not flipped)

#### Scenario: Facing left
- **WHEN** the player last moved left
- **THEN** the sprite is rendered horizontally flipped

### Requirement: Player animations play based on state
The character SHALL display different animation sequences from the sprite sheet depending on its current state: idle, walking, jumping (airborne), carrying-idle, carrying-walk.

#### Scenario: Idle animation
- **WHEN** the player is on the ground and not pressing movement keys
- **THEN** the idle animation loop plays

#### Scenario: Walk animation
- **WHEN** the player is moving horizontally on the ground
- **THEN** the walk animation loop plays

#### Scenario: Jump animation
- **WHEN** the player is airborne
- **THEN** the jump animation frame or loop plays

#### Scenario: Carry animation
- **WHEN** the player is carrying an object while idle or walking
- **THEN** the carry variant of idle or walk animation plays

### Requirement: Player can pick up and carry objects
The player SHALL pick up a nearby portable object (hat or key) by pressing the interact key (E or F) when adjacent to it. The object SHALL follow the player while carried and be placed on release.

#### Scenario: Pick up object
- **WHEN** the player presses interact while standing next to a hat or key on the ground
- **THEN** the object attaches to the player character's carry position and moves with it

#### Scenario: Put down object
- **WHEN** the player presses interact again while carrying an object
- **THEN** the object is placed on the ground at the player's current position

#### Scenario: Carry one object at a time
- **WHEN** the player is already carrying an object and presses interact near another
- **THEN** nothing happens; the player must drop the current object first

### Requirement: Player can push blocks
The player SHALL push a pushable block by walking into it horizontally. The block SHALL slide one tile in the direction of movement if the destination is empty. The player SHALL NOT pass through blocks.

#### Scenario: Push block into empty space
- **WHEN** the player walks into a pushable block and the tile behind the block is empty
- **THEN** the block slides one tile in the push direction and the player advances one tile

#### Scenario: Block against wall
- **WHEN** the player pushes a block that has a wall or another block on its far side
- **THEN** neither the block nor the player moves

### Requirement: Player collects hats
When the player carries a hat and presses interact near a hat stand or collection point, or when the player walks over a hat collection trigger, the hat SHALL be collected, incrementing the hat count and removing the hat object from the scene.

#### Scenario: Collect hat by walking over trigger
- **WHEN** the player walks over a hat collection zone with a hat in their possession or when hats auto-collect on contact
- **THEN** the hat count increments and the hat is removed from the level

#### Scenario: Hat count visible in HUD
- **WHEN** the player collects a hat
- **THEN** the HUD hat counter reflects the new count immediately
