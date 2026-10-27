import type { ColorId, PickShape } from '../config/constants';
import {
  DEFAULT_FLOOD_LIMIT,
  DEFAULT_MAX_STACK_SIZE,
  DEFAULT_MAX_STACKS,
  DEFAULT_PALETTE,
  DEFAULT_PICK_SHAPE,
  DEFAULT_ROTATION_PERIOD_MS,
  DEFAULT_SHUFFLE_CONFIG,
} from '../config/constants';

export interface ShuffleConfig {
  minRegionSize: number;
  maxRegionSize: number;
}

export interface BeltConfig {
  maxStacks: number;
  maxStackSize: number;
  rotationPeriodMs: number;
}

export interface LevelDef {
  name: string;
  /** targetColors.length and targetColors[0].length define the grid size. */
  targetColors: ColorId[][];
  palette: ColorId[];
  pickShape: PickShape;
  /** Max cells a 'flood' pick can gather in one go (including the clicked cell); ignored otherwise. */
  floodLimit: number;
  shuffle: ShuffleConfig;
  belt: BeltConfig;
}

/** Only `name` and `targetColors` are required — everything else falls back to documented defaults. */
export type LevelConfigInput = Pick<LevelDef, 'name' | 'targetColors'> & {
  palette?: ColorId[];
  pickShape?: PickShape;
  floodLimit?: number;
  shuffle?: Partial<ShuffleConfig>;
  belt?: Partial<BeltConfig>;
};

/** Fills in any field a level config omits with the documented default. */
export function defineLevel(input: LevelConfigInput): LevelDef {
  return {
    name: input.name,
    targetColors: input.targetColors,
    palette: input.palette ?? DEFAULT_PALETTE,
    pickShape: input.pickShape ?? DEFAULT_PICK_SHAPE,
    floodLimit: input.floodLimit ?? DEFAULT_FLOOD_LIMIT,
    shuffle: { ...DEFAULT_SHUFFLE_CONFIG, ...input.shuffle },
    belt: {
      maxStacks: input.belt?.maxStacks ?? DEFAULT_MAX_STACKS,
      maxStackSize: input.belt?.maxStackSize ?? DEFAULT_MAX_STACK_SIZE,
      rotationPeriodMs: input.belt?.rotationPeriodMs ?? DEFAULT_ROTATION_PERIOD_MS,
    },
  };
}
