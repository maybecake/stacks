import React, { useMemo, useState } from "react";
import { findLayout } from "../gridLayout";
import { ProblemCard, ProblemGrid } from "../ProblemGrid";
import { mulberry32 } from "../random";
import { useSheetCode } from "../useSheetCode";
import { WorksheetControls } from "../WorksheetControls";
import { CheckboxField, ChoiceGroup, FieldGroup, SelectField, TextField } from "../WorksheetFields";
import { WorksheetSheet } from "../WorksheetSheet";
import { LONG_DIVISION_CODEC } from "./longDivisionCode";
import {
  DIFFICULTY_PRESETS,
  DIVISION_LAYOUTS,
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
    <ProblemCard className="division-problem" number={showNumber ? problem.id : undefined}>
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
    </ProblemCard>
  );
};

const LongDivisionWorksheet: React.FC = () => {
  const { settings, code, update, reseed, load, title, setTitle } =
    useSheetCode(LONG_DIVISION_CODEC);
  const { difficulty, layoutId, workStyle, noRemainders, showNumbers, seed } = settings;
  // Raw text of the custom range inputs, so half-typed values aren't clamped while editing.
  const [customRange, setCustomRange] = useState(() => toCustomRangeInput(settings.customRange));

  const layout = findLayout(DIVISION_LAYOUTS, layoutId);
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
      <WorksheetControls code={code} onReseed={reseed} onLoad={handleLoad}>
        <ChoiceGroup
          legend="Difficulty"
          options={DIFFICULTY_OPTIONS}
          value={difficulty}
          onChange={(value) => update({ difficulty: value })}
        />

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

        <SelectField
          label="Layout & quantity"
          options={DIVISION_LAYOUTS}
          value={layoutId}
          onChange={(value) => update({ layoutId: value })}
        />
        <SelectField
          label="Work area"
          options={WORK_STYLES}
          value={workStyle}
          onChange={(value) => update({ workStyle: value })}
        />
        <FieldGroup label="Options">
          <CheckboxField
            label="No remainders (exact division)"
            checked={noRemainders}
            onChange={(checked) => update({ noRemainders: checked })}
          />
          <CheckboxField
            label="Show problem numbers"
            checked={showNumbers}
            onChange={(checked) => update({ showNumbers: checked })}
          />
        </FieldGroup>
        <TextField
          label="Worksheet title"
          value={title}
          placeholder={DEFAULT_TITLE}
          onChange={setTitle}
        />
      </WorksheetControls>

      <WorksheetSheet
        title={title || DEFAULT_TITLE}
        instructions="Solve each problem. Show all work in the space provided."
        code={code}
      >
        <ProblemGrid layout={layout}>
          {problems.map((p) => (
            <DivisionProblemCard
              key={p.id}
              problem={p}
              workStyle={workStyle}
              showNumber={showNumbers}
            />
          ))}
        </ProblemGrid>
      </WorksheetSheet>
    </div>
  );
};

export { LongDivisionWorksheet };
