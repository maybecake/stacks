import { Actor, Circle, Color, Font, Scene, Text, type Engine, vec } from 'excalibur';
import type { LevelDef } from '../levels/types';
import { BoardEngine } from '../engine/BoardEngine';
import { BeltEngine } from '../engine/BeltEngine';
import { shuffleBoard } from '../engine/shuffle';
import { createRng } from '../engine/rng';
import { GameEventBus } from '../engine/GameEventBus';
import { BoardView } from '../actors/BoardView';
import type { BoardViewCell } from '../actors/BoardView';
import { BeltSlotActor } from '../actors/BeltSlotActor';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  MAX_CELL_SIZE,
  MIN_CELL_SIZE,
  BELT_AREA_HEIGHT,
  BELT_RADIUS_X,
  BELT_RADIUS_Y,
  BELT_INSERT_ANGLE_DEG,
  BELT_EJECT_ANGLE_DEG,
} from '../config/constants';

const TRACK_DOT_COLOR = Color.fromHex('#44445a');
const INSERT_MARKER_COLOR = Color.fromHex('#3b6fe2');
const EJECT_MARKER_COLOR = Color.fromHex('#e2473b');
const MARKER_FONT = new Font({ size: 12 });

const BOARD_TOP_MARGIN = 24;
const BELT_TOP_MARGIN = 40;
const BOARD_SIDE_MARGIN = 16;

function angleToOffset(angleDeg: number, radiusX: number, radiusY: number): { x: number; y: number } {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: radiusX * Math.sin(rad), y: -radiusY * Math.cos(rad) };
}

export class JewelScene extends Scene {
  private _level: LevelDef;
  private _board!: BoardEngine;
  private _belt!: BeltEngine;
  private _rng: () => number = createRng();
  private _boardView!: BoardView;
  private _slotActors: BeltSlotActor[] = [];
  private _trackActors: Actor[] = [];
  private _ended = false;
  private _cellSize = MAX_CELL_SIZE;
  private _boardOriginX = 0;
  private _boardOriginY = BOARD_TOP_MARGIN;
  private _beltCenterX = CANVAS_WIDTH / 2;
  private _beltCenterY = 0;

  constructor(level: LevelDef) {
    super();
    this._level = level;
  }

  onInitialize(engine: Engine): void {
    void engine;
    this._buildScene();
  }

  onActivate(): void {
    this._ended = false;
  }

  /** Re-shuffles and rebuilds everything from scratch — used for the initial build and restart. */
  restart(): void {
    if (this._boardView) this.remove(this._boardView);
    for (const actor of this._slotActors) this.remove(actor);
    for (const actor of this._trackActors) this.remove(actor);
    this._buildScene();
  }

  private _buildScene(): void {
    const gridSize = this._level.targetColors.length;

    // Cell size scales down to fit arbitrarily large grids (e.g. a 48x48 pixel-art level) within
    // the fixed canvas, capped at MAX_CELL_SIZE so small grids keep today's familiar look.
    const widthBudget = CANVAS_WIDTH - 2 * BOARD_SIDE_MARGIN;
    const heightBudget = CANVAS_HEIGHT - BOARD_TOP_MARGIN - BELT_TOP_MARGIN - BELT_AREA_HEIGHT;
    this._cellSize = Math.max(
      MIN_CELL_SIZE,
      Math.min(MAX_CELL_SIZE, Math.floor(Math.min(widthBudget, heightBudget) / gridSize)),
    );

    const boardPixelSize = gridSize * this._cellSize;
    this._boardOriginX = (CANVAS_WIDTH - boardPixelSize) / 2;
    this._beltCenterY = this._boardOriginY + boardPixelSize + BELT_TOP_MARGIN + BELT_AREA_HEIGHT / 2;

    this._rng = createRng();
    this._ended = false;

    const initialJewels = shuffleBoard(this._level.targetColors, this._level.shuffle, createRng());
    this._board = new BoardEngine(this._level.targetColors, initialJewels);
    this._belt = new BeltEngine(
      this._level.belt.maxStacks,
      this._level.belt.maxStackSize,
      this._level.belt.rotationPeriodMs,
    );

    this._boardView = new BoardView(gridSize, gridSize, this._cellSize, this._buildViewCells(), (row, col) =>
      this._handlePick(row, col),
    );
    this._boardView.pos = vec(this._boardOriginX + boardPixelSize / 2, this._boardOriginY + boardPixelSize / 2);
    this.add(this._boardView);

    this._slotActors = [];
    for (let i = 0; i < this._belt.maxStacks; i++) {
      const slotActor = new BeltSlotActor();
      slotActor.hide();
      this.add(slotActor);
      this._slotActors.push(slotActor);
    }

    this._buildBeltTrack();
    this._syncBoardVisuals();
    this._syncBeltVisuals();

    GameEventBus.emit({ type: 'level-started', maxStacks: this._belt.maxStacks, totalCells: gridSize * gridSize });
    this._emitBoardUpdated();
    this._emitBeltUpdated();
  }

  private _handlePick(row: number, col: number): void {
    if (this._ended) return;

    const group = this._board.computePickGroup(row, col, this._level.pickShape, this._level.floodLimit);
    if (group.length === 0) return;

    const colors = this._board.colorsOf(group);
    const accepted = this._belt.insertGroup(colors, this._rng);

    if (!accepted) {
      this._boardView.flashBlocked(row, col);
      GameEventBus.emit({ type: 'pick-blocked', row, col });
      return;
    }

    this._board.clearCells(group);
    this._syncBoardVisuals();
    this._syncBeltVisuals();
    this._emitBoardUpdated();
    this._emitBeltUpdated();
    this._checkEndConditions();
  }

  onPreUpdate(_engine: Engine, elapsedMs: number): void {
    if (this._ended) return;

    const crossed = this._belt.tick(elapsedMs);
    let boardChanged = false;
    for (const slotIndex of crossed) {
      if (this._belt.resolveEject(slotIndex, this._board, this._rng)) {
        boardChanged = true;
      }
    }

    if (boardChanged) {
      this._syncBoardVisuals();
      this._emitBoardUpdated();
    }
    this._syncBeltVisuals();
    if (boardChanged) {
      this._emitBeltUpdated();
      this._checkEndConditions();
    }
  }

  private _checkEndConditions(): void {
    if (this._ended) return;

    if (this._board.isSolved()) {
      this._ended = true;
      GameEventBus.emit({ type: 'level-complete' });
      return;
    }

    if (!this._belt.hasAnyLegalPick(this._board, this._level.pickShape, this._rng, this._level.floodLimit)) {
      this._ended = true;
      GameEventBus.emit({ type: 'level-failed' });
    }
  }

  private _buildViewCells(): BoardViewCell[][] {
    const cells: BoardViewCell[][] = [];
    for (let r = 0; r < this._board.rows; r++) {
      const row: BoardViewCell[] = [];
      for (let c = 0; c < this._board.cols; c++) {
        row.push({
          targetColor: this._board.targetColors[r][c],
          jewelColor: this._board.jewels[r][c],
          locked: this._board.isLocked(r, c),
        });
      }
      cells.push(row);
    }
    return cells;
  }

  private _syncBoardVisuals(): void {
    this._boardView.redraw(this._buildViewCells());
  }

  /** Static visual guide for the ring: a dot at each resting slot position, plus insert/eject markers. */
  private _buildBeltTrack(): void {
    for (let i = 0; i < this._belt.maxStacks; i++) {
      const offset = angleToOffset(this._belt.baseAngleOf(i), BELT_RADIUS_X, BELT_RADIUS_Y);
      const dot = new Actor({
        pos: vec(this._beltCenterX + offset.x, this._beltCenterY + offset.y),
        width: 6,
        height: 6,
        z: 1,
      });
      dot.graphics.use(new Circle({ radius: 3, color: TRACK_DOT_COLOR }));
      this.add(dot);
      this._trackActors.push(dot);
    }

    this._addTrackMarker(BELT_INSERT_ANGLE_DEG, INSERT_MARKER_COLOR, 'IN');
    this._addTrackMarker(BELT_EJECT_ANGLE_DEG, EJECT_MARKER_COLOR, 'OUT');
  }

  private _addTrackMarker(angleDeg: number, color: Color, label: string): void {
    const offset = angleToOffset(angleDeg, BELT_RADIUS_X, BELT_RADIUS_Y);
    const x = this._beltCenterX + offset.x;
    const y = this._beltCenterY + offset.y;

    const marker = new Actor({ pos: vec(x, y), width: 14, height: 14, z: 1 });
    marker.graphics.use(new Circle({ radius: 7, color }));
    this.add(marker);
    this._trackActors.push(marker);

    const text = new Actor({ pos: vec(x, y + 20), width: 30, height: 14, z: 1 });
    text.graphics.use(new Text({ text: label, font: MARKER_FONT, color }));
    this.add(text);
    this._trackActors.push(text);
  }

  private _syncBeltVisuals(): void {
    for (let i = 0; i < this._slotActors.length; i++) {
      const slot = this._belt.slots[i];
      const actor = this._slotActors[i];
      if (!slot) {
        actor.hide();
        continue;
      }
      const angle = (this._belt.baseAngleOf(i) + this._belt.ringRotationDeg) % 360;
      const offset = angleToOffset(angle, BELT_RADIUS_X, BELT_RADIUS_Y);
      actor.moveTo(this._beltCenterX + offset.x, this._beltCenterY + offset.y);
      actor.show(slot.color, slot.count);
    }
  }

  private _emitBoardUpdated(): void {
    let locked = 0;
    const total = this._board.rows * this._board.cols;
    for (let r = 0; r < this._board.rows; r++) {
      for (let c = 0; c < this._board.cols; c++) {
        if (this._board.isLocked(r, c)) locked++;
      }
    }
    GameEventBus.emit({ type: 'board-updated', lockedCells: locked, totalCells: total });
  }

  private _emitBeltUpdated(): void {
    GameEventBus.emit({
      type: 'belt-updated',
      occupiedStacks: this._belt.occupiedCount(),
      maxStacks: this._belt.maxStacks,
    });
  }
}
