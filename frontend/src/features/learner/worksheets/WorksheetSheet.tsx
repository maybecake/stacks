import React from "react";

type WorksheetSheetProps = {
  title: string;
  instructions?: string;
  /** Sheet code printed on the page so the exact worksheet can be regenerated later. */
  code?: string;
  children: React.ReactNode;
};

/** Letter-sized printable page with a title and Name/Date lines, shared by all worksheet generators. */
const WorksheetSheet: React.FC<WorksheetSheetProps> = ({ title, instructions, code, children }) => (
  <div className="worksheet__preview">
    <div className="worksheet-sheet">
      <div className="worksheet-sheet__header">
        <div>
          <h1 className="worksheet-sheet__title">{title}</h1>
          {instructions && <p className="worksheet-sheet__instructions">{instructions}</p>}
        </div>
        <div className="worksheet-sheet__fields">
          <div className="worksheet-sheet__field">
            Name: <span className="worksheet-sheet__blank" />
          </div>
          <div className="worksheet-sheet__field">
            Date: <span className="worksheet-sheet__blank" />
          </div>
          {code && (
            <div className="worksheet-sheet__code" data-testid="worksheet-sheet-code">
              Sheet code: {code}
            </div>
          )}
        </div>
      </div>
      {children}
    </div>
  </div>
);

export { WorksheetSheet };
