import { Actor, CollisionType, Engine, Keys, Side, Color, SpriteSheet, vec } from 'excalibur';
import { buildPlayerAnimations } from './PlayerAnimations';
import type { PlayerAnims } from './PlayerAnimations';
import type { Hat } from './Hat';
import type { Key } from './Key';
import type { LevelScene } from '../scenes/LevelScene';
import { PLAYER_SPEED, JUMP_VELOCITY, TILE_SIZE, INTERACT_RANGE, HAT_FRAME_SIZE, HAT_SHEET_COLS } from '../config/sprites';
import { Resources } from '../engine/resources';
import { GameState } from '../engine/GameState';

type Carrying = Hat | Key | null;

export class Player extends Actor {
  private _anims!: PlayerAnims;
  private _isGrounded = false;
  private _wasGrounded = false;
  private _carrying: Carrying = null;
  private _facingRight = true;
  private _interactCooldown = 0;
  private _hatStack: Actor[] = [];

  constructor(tileX: number, tileY: number) {
    super({
      x: tileX * TILE_SIZE + TILE_SIZE / 2,
      y: tileY * TILE_SIZE + TILE_SIZE / 2,
      width: TILE_SIZE - 4,
      height: TILE_SIZE - 2,
      collisionType: CollisionType.Active,
      color: Color.Blue,
    });
  }

  onInitialize(_engine: Engine): void {
    this._anims = buildPlayerAnimations();
    this.graphics.add('idle',      this._anims.idle);
    this.graphics.add('walk',      this._anims.walk);
    this.graphics.add('jump',      this._anims.jump);
    this.graphics.add('fall',      this._anims.fall);
    this.graphics.add('carryIdle', this._anims.carryIdle);
    this.graphics.add('carryWalk', this._anims.carryWalk);
    this.graphics.use('idle');

    // Rebuild hat stack from previous levels
    for (const index of GameState.collectedHatIndices) {
      this._addHatOverlay(index);
    }

    // Ground detection via bottom-side collision
    this.on('precollision', (evt) => {
      if (evt.side === Side.Bottom) {
        this._isGrounded = true;
      }
    });

    // Push block detection via side collisions
    this.on('precollision', (evt) => {
      if (evt.side !== Side.Left && evt.side !== Side.Right) return;
      const scene = this.scene as LevelScene | null;
      if (!scene) return;

      const pushDir = evt.side === Side.Left ? -1 : 1;
      const playerTileX = Math.round((this.pos.x - TILE_SIZE / 2) / TILE_SIZE);
      const playerTileY = Math.round((this.pos.y - TILE_SIZE / 2) / TILE_SIZE);
      const targetTileX = playerTileX + pushDir;

      scene.tryPushBlock(targetTileX, playerTileY, pushDir);
    });
  }

  onPreUpdate(engine: Engine, elapsed: number): void {
    this._wasGrounded = this._isGrounded;
    this._isGrounded = false;

    this._interactCooldown = Math.max(0, this._interactCooldown - elapsed);

    const kb = engine.input.keyboard;

    // --- Horizontal movement ---
    let moveX = 0;
    if (kb.isHeld(Keys.Left)  || kb.isHeld(Keys.A)) moveX = -1;
    if (kb.isHeld(Keys.Right) || kb.isHeld(Keys.D)) moveX =  1;

    if (moveX !== 0) this._facingRight = moveX > 0;
    this.graphics.flipHorizontal = !this._facingRight;
    this.vel.x = moveX * PLAYER_SPEED;

    // --- Jump ---
    // Use _wasGrounded (set before reset this frame) because _isGrounded is populated
    // by precollision events which fire after onPreUpdate, so it's always false here.
    if ((kb.wasPressed(Keys.Up) || kb.wasPressed(Keys.W) || kb.wasPressed(Keys.Space))
        && this._wasGrounded) {
      this.vel.y = JUMP_VELOCITY;
    }

    // --- Interact (pick up / drop) ---
    if ((kb.wasPressed(Keys.E) || kb.wasPressed(Keys.F)) && this._interactCooldown <= 0) {
      this._interactCooldown = 300;
      this._handleInteract();
    }

    // --- Update carried item position ---
    if (this._carrying !== null) {
      const offset = this._facingRight ? vec(TILE_SIZE * 0.8, -TILE_SIZE * 0.5) : vec(-TILE_SIZE * 0.8, -TILE_SIZE * 0.5);
      this._carrying.pos = this.pos.add(offset);
    }

    // --- Update collected hat stack positions (stacked on head) ---
    for (let i = 0; i < this._hatStack.length; i++) {
      const yOffset = -(TILE_SIZE * 0.9 + i * TILE_SIZE * 0.55);
      this._hatStack[i].pos = vec(this.pos.x, this.pos.y + yOffset);
    }

    // --- Animation state machine ---
    this._updateAnimation();
  }

  private _handleInteract(): void {
    const scene = this.scene as LevelScene | null;
    if (!scene) return;

    if (this._carrying !== null) {
      // Drop
      scene.dropItem(this._carrying, this.pos.x, this.pos.y + TILE_SIZE);
      this._carrying = null;
      return;
    }

    // Try picking up a hat or key within range
    const item = scene.findNearbyPickup(this.pos.x, this.pos.y, INTERACT_RANGE);
    if (!item) return;

    if ('hatId' in item) {
      // Hats: collect immediately — appears on head
      scene.collectHat(item as Hat);
    } else {
      // Keys: carry until used on a door
      this._carrying = item;
      scene.pickUpItem(item);
    }
  }

  private _addHatOverlay(hatIndex: number): void {
    const sheet = SpriteSheet.fromImageSource({
      image: Resources.hat,
      grid: { rows: 1, columns: HAT_SHEET_COLS, spriteWidth: HAT_FRAME_SIZE, spriteHeight: HAT_FRAME_SIZE },
    });
    const sprite = sheet.getSprite(hatIndex % HAT_SHEET_COLS, 0)!;
    const s = TILE_SIZE / HAT_FRAME_SIZE;
    sprite.scale = vec(s, s);

    const stackIndex = this._hatStack.length;
    const yOffset = -(TILE_SIZE * 0.9 + stackIndex * TILE_SIZE * 0.55);
    const overlay = new Actor({
      x: this.pos.x,
      y: this.pos.y + yOffset,
      collisionType: CollisionType.PreventCollision,
      z: this.z + 1,
    });
    overlay.graphics.use(sprite);
    this.scene?.add(overlay);
    this._hatStack.push(overlay);
  }

  collectHat(hatIndex: number): void {
    this._addHatOverlay(hatIndex);
    GameState.addHat(hatIndex);
  }

  private _updateAnimation(): void {
    const carrying = this._carrying !== null;
    const moving = Math.abs(this.vel.x) > 5;
    const airborne = !this._isGrounded && !this._wasGrounded;
    const falling = airborne && this.vel.y > 0;

    let name: string;
    if (airborne) {
      name = falling ? 'fall' : 'jump';
    } else if (carrying) {
      name = moving ? 'carryWalk' : 'carryIdle';
    } else {
      name = moving ? 'walk' : 'idle';
    }

    if (this.graphics.current?.id !== this._anims[name as keyof PlayerAnims]?.id) {
      this.graphics.use(name);
    }
  }

  get carrying(): Carrying {
    return this._carrying;
  }
}
