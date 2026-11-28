import React, { useState } from "react";
import { Button } from "@ui/button";

type SheetCodeFieldProps = {
  code: string;
  /** Returns false if the code couldn't be loaded. */
  onLoad: (code: string) => boolean;
};

/**
 * Shows the current sheet code and lets the user type in a printed one to regenerate that sheet.
 * Render with `key={code}` so the draft resets whenever the sheet changes.
 */
const SheetCodeField: React.FC<SheetCodeFieldProps> = ({ code, onLoad }) => {
  const [draft, setDraft] = useState(code);
  const [invalid, setInvalid] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setInvalid(!onLoad(draft));
  };

  return (
    <form className="worksheet__field" onSubmit={handleSubmit}>
      <label className="worksheet__label" htmlFor="worksheet-sheet-code">
        Sheet code
      </label>
      <div className="worksheet__code-row">
        <input
          id="worksheet-sheet-code"
          type="text"
          className="worksheet__input worksheet__input--code"
          value={draft}
          spellCheck={false}
          autoComplete="off"
          aria-invalid={invalid}
          aria-describedby="worksheet-sheet-code-hint"
          onChange={(e) => {
            setDraft(e.target.value);
            setInvalid(false);
          }}
        />
        <Button type="submit" variant="outline" size="sm" disabled={draft.trim() === code}>
          Load
        </Button>
      </div>
      <span
        id="worksheet-sheet-code-hint"
        className={`worksheet__hint${invalid ? " worksheet__hint--error" : ""}`}
      >
        {invalid
          ? "That code isn't valid. Check it against the printed sheet."
          : "Enter a code from a printed sheet to regenerate it."}
      </span>
    </form>
  );
};

export { SheetCodeField };
