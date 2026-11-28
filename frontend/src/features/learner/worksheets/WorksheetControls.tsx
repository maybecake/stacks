import React from "react";
import { Button } from "@ui/button";
import { SheetCodeField } from "./SheetCodeField";

type WorksheetControlsProps = {
  code: string;
  onReseed: () => void;
  /** Returns false if the typed-in code couldn't be loaded. */
  onLoad: (code: string) => boolean;
  /** Generator-specific settings, shown below the sheet code. */
  children: React.ReactNode;
};

/** Sidebar shared by all generators: New sheet / Print, the sheet code, then settings. */
const WorksheetControls: React.FC<WorksheetControlsProps> = ({
  code,
  onReseed,
  onLoad,
  children,
}) => (
  <aside className="worksheet__controls">
    <div className="worksheet__actions">
      <Button variant="outline" size="sm" onClick={onReseed}>
        New sheet
      </Button>
      <Button size="sm" onClick={() => window.print()}>
        Print
      </Button>
    </div>
    <SheetCodeField key={code} code={code} onLoad={onLoad} />
    {children}
  </aside>
);

export { WorksheetControls };
