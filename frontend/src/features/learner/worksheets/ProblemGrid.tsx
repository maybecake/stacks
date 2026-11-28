import React from "react";
import type { GridLayout } from "./gridLayout";

type ProblemGridProps = {
  layout: GridLayout;
  children: React.ReactNode;
};

type ProblemCardProps = {
  /** Problem number shown in the corner, or omitted to hide it. */
  number?: number;
  className?: string;
  children: React.ReactNode;
};

/**
 * Grid of problem cards on the sheet. Adds `problem-grid--cols-N` / `--rows-N` classes so
 * each generator can size its cards to the layout.
 */
const ProblemGrid: React.FC<ProblemGridProps> = ({ layout, children }) => (
  <div
    className={`problem-grid problem-grid--cols-${layout.cols} problem-grid--rows-${layout.rows}`}
    style={{ "--problem-grid-cols": layout.cols } as React.CSSProperties}
  >
    {children}
  </div>
);

/** Bordered box for a single problem that never splits across printed pages. */
const ProblemCard: React.FC<ProblemCardProps> = ({ number, className, children }) => (
  <div className={`problem-card${className ? ` ${className}` : ""}`}>
    {number !== undefined && <span className="problem-card__number">{number}.</span>}
    {children}
  </div>
);

export { ProblemCard, ProblemGrid };
