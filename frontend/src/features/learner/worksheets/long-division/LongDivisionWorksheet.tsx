import React, { useMemo, useState } from "react";
import { Button } from "@ui/button";
import { mulberry32 } from "../random";
import { SheetCodeField } from "../SheetCodeField";
import { useSheetCode } from "../useSheetCode";
import { WorksheetSheet } from "../WorksheetSheet";
import { LONG_DIVISION_CODEC } from "./longDivisionCode";
import {
  DIFFICULTY_PRESETS,
  GRID_LAYOUTS,
  WORK_STYLES,
  generateProblems,
  type Difficulty,
  type DivisionProblem,
  type DivisionRange,
  type PresetDifficulty,
  type WorkStyle,
} from "./longDivision";
import "./long-division.css";

type CustomRangeInput = Record<keyof DivisionRange, string>;

const DEFAULT_TITLE = "Long Division Practice";
const CUSTOM_FIELDS: { key: keyof DivisionRange; label: string }[] = [
  { key: "divisorMin", label: "Divisor min" },
  { key: "divisorMax", label: "Divisor max" },
  { key: "dividendMin", label: "Dividend min" },
  { key: "dividendMax", label: "Dividend max" },
];
const DIFFICULTY_OPTIONS: { id: Difficulty; label: string; description: string }[] = [
  ...(Object.keys(DIFFICULTY_PRESETS) as PresetDifficulty[]).map((id) => ({
    id,
    label: DIFFICULTY_PRESETS[id].label,
    description: DIFFICULTY_PRESETS[id].description,
  })),
  { id: "custom", label: "Custom", description: "Custom ranges" },
];

function toCustomRangeInput(range: DivisionRange): CustomRangeInput {
  return {
    divisorMin: String(range.divisorMin),
    divisorMax: String(range.divisorMax),
    dividendMin: String(range.dividendMin),
    dividendMax: String(range.dividendMax),
  };
}

function parseCustomRange(input: CustomRangeInput): DivisionRange {
  const fallback = DIFFICULTY_PRESETS.medium.range;
  const parse = (key: keyof DivisionRange) => {
    const value = parseInt(input[key], 10);
    return Number.isNaN(value) ? fallback[key] : value;
  };
  return {
    divisorMin: parse("divisorMin"),
    divisorMax: parse("divisorMax"),
    dividendMin: parse("dividendMin"),
    dividendMax: parse("dividendMax"),
  };
}

const DivisionProblemCard: React.FC<{
  problem: DivisionProblem;
  workStyle: WorkStyle;
  showNumber: boolean;
}> = ({ problem, workStyle, showNumber }) => {
  const digits = problem.dividend.toString().split("");
  return (
    <div className="division-problem">
      {showNumber && <span className="division-problem__number">{problem.id}.</span>}

      <div className="division-problem__expression">
        <div className="division-problem__divisor">{problem.divisor}</div>
        <div>
          <div className="division-problem__row">
            {digits.map((_, i) => (
              <div key={i} className="division-problem__digit division-problem__digit--quotient" />
            ))}
          </div>
          <div className="division-problem__row division-problem__row--dividend">
            {digits.map((digit, i) => (
              <div key={i} className="division-problem__digit">
                {digit}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={`division-problem__work division-problem__work--${workStyle}`}>
        <div className="division-problem__work-inner">
          {/* Invisible copy of the divisor so the columns line up under the dividend digits */}
          <div className="division-problem__divisor division-problem__divisor--spacer" aria-hidden>
            {problem.divisor}
          </div>
          <div className="division-problem__columns">
            {digits.map((_, i) => (
              <div key={i} className="division-problem__digit division-problem__column" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const LongDivisionWorksheet: React.FC = () => {
  const { settings, code, update, reseed, load, title, setTitle } =
    useSheetCode(LONG_DIVISION_CODEC);
  const { difficulty, layoutId, workStyle, noRemainders, showNumbers, seed } = settings;
  // Raw text of the custom range inputs, so half-typed values aren't clamped while editing.
  const [customRange, setCustomRange] = useState(() => toCustomRangeInput(settings.customRange));

  const layout = GRID_LAYOUTS.find((l) => l.id === layoutId) ?? GRID_LAYOUTS[0];
  const range =
    difficulty === "custom" ? settings.customRange : DIFFICULTY_PRESETS[difficulty].range;

  // Problems only change when a generation setting (or the seed) changes,
  // so display-only options like work style keep the same problems.
  const problems = useMemo(
    () => generateProblems(range, layout.cols * layout.rows, noRemainders, mulberry32(seed)),
    [range, layout.cols, layout.rows, noRemainders, seed],
  );

  const handleCustomChange = (key: keyof DivisionRange, value: string) => {
    const next = { ...customRange, [key]: value };
    setCustomRange(next);
    update({ customRange: parseCustomRange(next) });
  };

  const handleLoad = (input: string) => {
    const loaded = load(input);
    if (loaded) setCustomRange(toCustomRangeInput(loaded.customRange));
    return loaded !== null;
  };

  return (
    <div className="worksheet">
      <aside className="worksheet__controls">
        <div className="worksheet__actions">
          <Button variant="outline" size="sm" onClick={reseed}>
            New sheet
          </Button>
          <Button size="sm" onClick={() => window.print()}>
            Print
          </Button>
        </div>

        <SheetCodeField key={code} code={code} onLoad={handleLoad} />

        <fieldset className="worksheet__field">
          <legend className="worksheet__label">Difficulty</legend>
          <div className="worksheet__choice-grid">
            {DIFFICULTY_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                className={`worksheet__choice${difficulty === option.id ? " worksheet__choice--active" : ""}`}
                aria-pressed={difficulty === option.id}
                onClick={() => update({ difficulty: option.id })}
              >
                <span className="worksheet__choice-title">{option.label}</span>
                <span className="worksheet__choice-hint">{option.description}</span>
              </button>
            ))}
          </div>
        </fieldset>

        {difficulty === "custom" && (
          <div className="worksheet__custom">
            {CUSTOM_FIELDS.map(({ key, label }) => (
              <label key={key} className="worksheet__custom-field">
                <span>{label}</span>
                <input
                  type="number"
                  className="worksheet__input"
                  value={customRange[key]}
                  onChange={(e) => handleCustomChange(key, e.target.value)}
                />
              </label>
            ))}
          </div>
        )}

        <label className="worksheet__field">
          <span className="worksheet__label">Layout &amp; quantity</span>
          <select
            className="worksheet__input"
            value={layoutId}
            onChange={(e) => update({ layoutId: e.target.value })}
          >
            {GRID_LAYOUTS.map((l) => (
              <option key={l.id} value={l.id}>
                {l.label}
              </option>
            ))}
          </select>
        </label>

        <label className="worksheet__field">
          <span className="worksheet__label">Work area</span>
          <select
            className="worksheet__input"
            value={workStyle}
            onChange={(e) => update({ workStyle: e.target.value as WorkStyle })}
          >
            {WORK_STYLES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </label>

        <div className="worksheet__field">
          <span className="worksheet__label">Options</span>
          <label className="worksheet__checkbox">
            <input
              type="checkbox"
              checked={noRemainders}
              onChange={(e) => update({ noRemainders: e.target.checked })}
            />
            No remainders (exact division)
          </label>
          <label className="worksheet__checkbox">
            <input
              type="checkbox"
              checked={showNumbers}
              onChange={(e) => update({ showNumbers: e.target.checked })}
            />
            Show problem numbers
          </label>
        </div>

        <label className="worksheet__field">
          <span className="worksheet__label">Worksheet title</span>
          <input
            type="text"
            className="worksheet__input"
            value={title}
            placeholder={DEFAULT_TITLE}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>
      </aside>

      <WorksheetSheet
        title={title || DEFAULT_TITLE}
        instructions="Solve each problem. Show all work in the space provided."
        code={code}
      >
        <div
          className={`division-grid division-grid--rows-${layout.rows}`}
          style={{ "--division-grid-cols": layout.cols } as React.CSSProperties}
        >
          {problems.map((p) => (
            <DivisionProblemCard
              key={p.id}
              problem={p}
              workStyle={workStyle}
              showNumber={showNumbers}
            />
          ))}
        </div>
      </WorksheetSheet>
    </div>
  );
};

export { LongDivisionWorksheet };
