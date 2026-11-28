import { gridLayout, type GridLayout } from "../gridLayout";
import { shuffle } from "../random";

export type MaxSum = 5 | 10 | 20;
export type AdditionFormat = "horizontal" | "vertical";
export type CountingShape = "circle" | "star" | "square" | "heart" | "triangle";

export interface AdditionProblem {
  id: number;
  a: number;
  b: number;
  sum: number;
}

export const MAX_SUM_OPTIONS: { id: MaxSum; label: string; description: string }[] = [
  { id: 5, label: "Up to 5", description: "Just starting" },
  { id: 10, label: "Up to 10", description: "Within 10" },
  { id: 20, label: "Up to 20", description: "Within 20" },
];

export const ADDITION_FORMATS: { id: AdditionFormat; label: string }[] = [
  { id: "horizontal", label: "Side by side (3 + 4 = ☐)" },
  { id: "vertical", label: "Stacked (in columns)" },
];

/** Counting shapes rotate from problem to problem; both numbers in a problem share one shape. */
export const SHAPE_CYCLE: CountingShape[] = ["circle", "star", "square", "heart", "triangle"];

export const ADDITION_LAYOUTS: GridLayout[] = [
  gridLayout(2, 5, "large"),
  gridLayout(2, 4, "extra large"),
  gridLayout(3, 5),
  gridLayout(4, 5, "small"),
];

/** Every a + b with both addends at least 1 (or 0 when allowed) and a sum no larger than maxSum. */
export function additionPairs(maxSum: number, allowZero: boolean): [number, number][] {
  const min = allowZero ? 0 : 1;
  const pairs: [number, number][] = [];
  for (let a = min; a <= maxSum - min; a++) {
    for (let b = min; a + b <= maxSum; b++) pairs.push([a, b]);
  }
  return pairs;
}

/**
 * Deal problems from a shuffled deck of all possible pairs, so nothing repeats until
 * every pair has been used (small ranges like "up to 5" have only 10 pairs).
 */
export function generateAdditionProblems(
  maxSum: number,
  count: number,
  allowZero: boolean,
  rng: () => number,
): AdditionProblem[] {
  const pairs = additionPairs(maxSum, allowZero);
  const problems: AdditionProblem[] = [];
  let deck: [number, number][] = [];
  while (problems.length < count) {
    if (deck.length === 0) deck = shuffle(pairs, rng);
    const [a, b] = deck.pop()!;
    problems.push({ id: problems.length + 1, a, b, sum: a + b });
  }
  return problems;
}

/** The counting shape for a problem, used for both numbers so the learner counts one kind of thing. */
export function shapeForProblem(id: number): CountingShape {
  return SHAPE_CYCLE[(id - 1) % SHAPE_CYCLE.length];
}
