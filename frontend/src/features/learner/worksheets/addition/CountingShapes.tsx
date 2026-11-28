import React from "react";
import type { CountingShape } from "./addition";

type CountingShapesProps = {
  count: number;
  shape: CountingShape;
  /** "columns": stacks of 5 side by side (narrow). "rows": rows of 10, split 5 + 5 (short). */
  arrangement: "columns" | "rows";
  className?: string;
};

const GROUP_SIZE = 5;

// Outlined (unfilled) so learners can color each shape as they count it.
const SHAPE_PATHS: Record<CountingShape, React.ReactNode> = {
  circle: <circle cx="10" cy="10" r="8" />,
  square: <rect x="2.5" y="2.5" width="15" height="15" rx="1.5" />,
  triangle: <path d="M10 2 L18.5 17.5 H1.5 Z" />,
  star: (
    <path d="M10 1.5 L12.6 7.2 L18.6 7.6 L14 11.6 L15.4 17.8 L10 14.6 L4.6 17.8 L6 11.6 L1.4 7.6 L7.4 7.2 Z" />
  ),
  heart: (
    <path d="M10 17.5 C4 13 1.5 10 1.5 6.6 C1.5 4 3.5 2 6 2 C7.7 2 9.2 3 10 4.4 C10.8 3 12.3 2 14 2 C16.5 2 18.5 4 18.5 6.6 C18.5 10 16 13 10 17.5 Z" />
  ),
};

/** `count` outlined shapes in groups of five, so they can be counted by fives. */
const CountingShapes: React.FC<CountingShapesProps> = ({
  count,
  shape,
  arrangement,
  className,
}) => {
  const groups: number[] = [];
  for (let left = count; left > 0; left -= GROUP_SIZE) groups.push(Math.min(GROUP_SIZE, left));

  return (
    <span
      className={`counting-shapes counting-shapes--${arrangement}${className ? ` ${className}` : ""}`}
      role="img"
      aria-label={`${count} ${shape}${count === 1 ? "" : "s"}`}
    >
      {groups.map((size, g) => (
        <span key={g} className="counting-shapes__group">
          {Array.from({ length: size }, (_, i) => (
            <svg key={i} className="counting-shapes__shape" viewBox="0 0 20 20" aria-hidden>
              {SHAPE_PATHS[shape]}
            </svg>
          ))}
        </span>
      ))}
    </span>
  );
};

export { CountingShapes };
