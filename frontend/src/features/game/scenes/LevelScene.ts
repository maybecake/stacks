import { Scene, Actor, CollisionType, Color, Engine, Keys } from 'excalibur';
import type { LevelDef } from '../levels/types';
import { LEVELS } from '../levels';
import { TILE_SIZE, GAME_HEIGHT } from '../config/sprites';
import { Player } from '../actors/Player';
import { PushBlock } from '../actors/PushBlock';
import { Hat } from '../actors/Hat';
import { Key } from '../actors/Key';
import { Door } from '../actors/Door';
import { Cannon } from '../actors/Cannon';
import { Cannonball } from '../actors/Cannonball';
import { GameEventBus } from '../engine/GameEventBus';
import { GameState } from '../engine/GameState';

const DEATH_Y = GAME_HEIGHT + TILE_SIZE * 2;
const GRAVITY_INTERVAL_MS = 200; // check block gravity every N ms

export class LevelScene extends Scene {
  private _def!: LevelDef;
  private _levelIndex: number;
  private _solidTiles = new Set<string>();
  private _pushBlocks: PushBlock[] = [];
  private _hats: Hat[] = [];
  private _keys: Key[] = [];
  private _doors: Door[] = [];
  private _player!: Player;
  private _hatsCollected = 0;
  private _doorReached = false;
  private _gravityAccum = 0;
  private _complete = false;
  private _cannons: Cannon[] = [];
  private _cannonballs: Cannonball[] = [];

  constructor(levelIndex: number) {
    super();
    this._levelIndex = levelIndex;
  }

  onInitialize(engine: Engine): void {
    this._def = LEVELS[this._levelIndex] ?? LEVELS[0];
    this._buildScene(engine);
  }

  onActivate(): void {
    // Reset complete flag when re-activating (e.g. after reset)
    this._complete = false;
  }

  private _buildScene(engine: Engine): void {
    this._solidTiles.clear();
    this._pushBlocks = [];
    this._hats = [];
    this._keys = [];
    this._doors = [];
    this._cannons = [];
    this._cannonballs = [];
    this._hatsCollected = 0;
    this._doorReached = false;
    this._complete = false;

    const { tiles, entities } = this._def;

    // Build tiles
    for (let row = 0; row < tiles.length; row++) {
      for (let col = 0; col < tiles[row].length; col++) {
        if (tiles[row][col] === 'solid') {
          this._solidTiles.add(`${col},${row}`);
          const tile = new Actor({
            x: col * TILE_SIZE + TILE_SIZE / 2,
            y: row * TILE_SIZE + TILE_SIZE / 2,
            width: TILE_SIZE,
            height: TILE_SIZE,
            collisionType: CollisionType.Fixed,
            color: Color.fromHex('#FF8000'),
          });
          this.add(tile);
        }
      }
    }

    // Build entities
    for (const ent of entities) {
      switch (ent.type) {
        case 'player-spawn': {
          this._player = new Player(ent.tileX, ent.tileY);
          this.add(this._player);
          break;
        }
        case 'push-block': {
          const block = new PushBlock(ent.tileX, ent.tileY);
          this._pushBlocks.push(block);
          this.add(block);
          break;
        }
        case 'hat': {
          const hat = new Hat(ent.tileX, ent.tileY, `hat-${this._hats.length}`);
          this._hats.push(hat);
          this.add(hat);
          break;
        }
        case 'key': {
          const key = new Key(ent.tileX, ent.tileY, ent.id ?? `key-${this._keys.length}`);
          this._keys.push(key);
          this.add(key);
          break;
        }
        case 'door': {
          const door = new Door(ent.tileX, ent.tileY, ent.id ?? `door-${this._doors.length}`);
          this._doors.push(door);
          this.add(door);
          break;
        }
        case 'cannon': {
          const stagger = this._cannons.length * 500;
          const cannon = new Cannon(ent.tileX, ent.tileY, ent.dir ?? 'right', stagger);
          cannon.onFire = (wx, wy, dir) => this._fireCannon(wx, wy, dir);
          this._cannons.push(cannon);
          this.add(cannon);
          break;
        }
      }
    }

    GameEventBus.emit({ type: 'level-started', total: this._hats.length });
    GameState.snapshot();
    void engine;
  }

  onPreUpdate(engine: Engine, elapsed: number): void {
    if (this._complete) return;

    // R = reset level
    if (engine.input.keyboard.wasPressed(Keys.R) || engine.input.keyboard.wasPressed(Keys.Enter)) {
      this._resetLevel(engine);
      return;
    }

    // Death zone (fell off bottom)
    if (this._player && this._player.pos.y > DEATH_Y) {
      this._resetLevel(engine);
      return;
    }

    // Cannonball hit detection — manual proximity check (reliable across builds)
    this._cannonballs = this._cannonballs.filter((b) => !b.dead);
    for (const ball of this._cannonballs) {
      if (ball.pos.distance(this._player.pos) < TILE_SIZE * 0.85) {
        this._resetLevel(engine);
        return;
      }
    }

    // Block gravity (throttled to avoid jitter)
    this._gravityAccum += elapsed;
    if (this._gravityAccum >= GRAVITY_INTERVAL_MS) {
      this._gravityAccum = 0;
      for (const block of this._pushBlocks) {
        block.applyGravity(this._isTileOccupied.bind(this), elapsed);
      }
    }

    // Check door overlap (player with matching key)
    const carrying = this._player?.carrying;
    if (carrying && 'keyId' in carrying) {
      for (const door of this._doors) {
        if (door.doorId === (carrying as Key).keyId) {
          const dist = door.pos.distance(this._player.pos);
          if (dist < TILE_SIZE * 1.2) {
            door.open();
            this._doors = this._doors.filter((d) => d !== door);
            this._doorReached = true;
            // consume key
            this._keys = this._keys.filter((k) => k !== carrying);
            // force drop
            this.dropItem(carrying, this._player.pos.x, this._player.pos.y);
            break;
          }
        }
      }
    }

    // Auto-collect hats on proximity
    for (const hat of this._hats) {
      if (!hat.collected && hat.distanceTo(this._player.pos.x, this._player.pos.y) <= TILE_SIZE) {
        this.collectHat(hat);
      }
    }

    this._checkWinCondition(engine);
  }

  private _isTileOccupied(tx: number, ty: number): boolean {
    if (this._solidTiles.has(`${tx},${ty}`)) return true;
    for (const block of this._pushBlocks) {
      if (block.tileX === tx && block.tileY === ty) return true;
    }
    return false;
  }

  /** Called by Player on collision with a push block side */
  tryPushBlock(blockTileX: number, blockTileY: number, dir: number): void {
    const block = this._pushBlocks.find(
      (b) => b.tileX === blockTileX && b.tileY === blockTileY,
    );
    if (!block) return;

    const destX = blockTileX + dir;
    const destY = blockTileY;
    if (!this._isTileOccupied(destX, destY)) {
      block.moveTo(destX, destY);
    }
  }

  /** Find a nearby hat or key within range of the given world position */
  findNearbyPickup(wx: number, wy: number, range: number): Hat | Key | null {
    for (const hat of this._hats) {
      if (!hat.collected && hat.distanceTo(wx, wy) <= range) return hat;
    }
    for (const key of this._keys) {
      if (!key.pickedUp && key.distanceTo(wx, wy) <= range) return key;
    }
    return null;
  }

  /** Immediately collect a hat and add it to the player's head stack */
  collectHat(hat: Hat): void {
    const index = Math.floor(Math.random() * 8);
    this._hatsCollected++;
    hat.collect();
    this._player.collectHat(index);
    GameEventBus.emit({
      type: 'hat-collected',
      collected: this._hatsCollected,
      total: this._hats.length,
    });
  }

  pickUpItem(item: Hat | Key): void {
    (item as Key).pickUp();
    GameEventBus.emit({ type: 'key-picked-up' });
  }

  dropItem(item: Hat | Key, wx: number, wy: number): void {
    (item as Key).drop(wx, wy);
    GameEventBus.emit({ type: 'key-dropped' });
  }

  private _checkWinCondition(engine: Engine): void {
    const allHats = this._hatsCollected >= this._hats.length && this._hats.length > 0;
    const won =
      this._def.winCondition === 'all-hats'
        ? allHats
        : allHats && this._doorReached;

    if (won) {
      this._complete = true;
      const nextIndex = this._levelIndex + 1;
      if (nextIndex < LEVELS.length) {
        // Advance to next level
        const nextKey = `level-${nextIndex}`;
        if (!engine.scenes[nextKey]) {
          engine.addScene(nextKey, new LevelScene(nextIndex));
        }
        void engine.goToScene(nextKey);
      } else {
        void engine.goToScene('victory');
      }
    }
  }

  private _fireCannon(wx: number, wy: number, dir: 'left' | 'right'): void {
    const ball = new Cannonball(wx, wy, dir);
    this._cannonballs.push(ball);
    this.add(ball);
  }

  private _resetLevel(engine: Engine): void {
    GameState.restoreSnapshot();
    for (const actor of [...this.actors]) {
      this.remove(actor);
    }
    this._buildScene(engine);
  }
}
