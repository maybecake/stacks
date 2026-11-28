/** A columns × rows arrangement of problems on the page. */
export interface GridLayout {
  id: string;
  cols: number;
  rows: number;
  label: string;
}

export function gridLayout(cols: number, rows: number, note?: string): GridLayout {
  const count = `${cols * rows} problems${note ? `, ${note}` : ""}`;
  return { id: `${cols}x${rows}`, cols, rows, label: `${cols} columns × ${rows} rows (${count})` };
}

/** The layout with this id, or the first layout if it isn't found. */
export function findLayout(layouts: readonly GridLayout[], id: string): GridLayout {
  return layouts.find((l) => l.id === id) ?? layouts[0];
}

/** Sheet code segment for a layout: columns then rows, e.g. "34" for 3 × 4. */
export function encodeLayout(layout: GridLayout): string {
  return `${layout.cols}${layout.rows}`;
}

/** Match the cols/rows digits from a sheet code to one of the allowed layouts. */
export function decodeLayout(
  layouts: readonly GridLayout[],
  cols: string,
  rows: string,
): GridLayout | undefined {
  return layouts.find((l) => l.cols === Number(cols) && l.rows === Number(rows));
}
