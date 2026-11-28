import React, { useMemo } from "react";
import { findLayout } from "../gridLayout";
import { ProblemCard, ProblemGrid } from "../ProblemGrid";
import { mulberry32 } from "../random";
import { useSheetCode } from "../useSheetCode";
import { WorksheetControls } from "../WorksheetControls";
import { CheckboxField, ChoiceGroup, FieldGroup, SelectField, TextField } from "../WorksheetFields";
import { WorksheetSheet } from "../WorksheetSheet";
import {
  ADDITION_FORMATS,
  ADDITION_LAYOUTS,
  MAX_SUM_OPTIONS,
  generateAdditionProblems,
  type AdditionFormat,
  type AdditionProblem,
} from "./addition";
import { ADDITION_CODEC } from "./additionCode";
import "./addition.css";

const DEFAULT_TITLE = "Addition Practice";

const AdditionProblemCard: React.FC<{
  problem: AdditionProblem;
  format: AdditionFormat;
  showNumber: boolean;
}> = ({ problem, format, showNumber }) => (
  <ProblemCard
    className={`addition-problem addition-problem--${format}`}
    number={showNumber ? problem.id : undefined}
  >
    {format === "horizontal" ? (
      <div className="addition-problem__equation">
        <span>{problem.a}</span>
        <span>+</span>
        <span>{problem.b}</span>
        <span>=</span>
        <span className="addition-problem__answer" />
      </div>
    ) : (
      <div className="addition-problem__stack">
        <span className="addition-problem__addend">{problem.a}</span>
        <span className="addition-problem__operator">+</span>
        <span className="addition-problem__addend">{problem.b}</span>
        <span className="addition-problem__rule" />
        <span className="addition-problem__answer addition-problem__answer--stacked" />
      </div>
    )}
  </ProblemCard>
);

const AdditionWorksheet: React.FC = () => {
  const { settings, code, update, reseed, load, title, setTitle } = useSheetCode(ADDITION_CODEC);
  const { maxSum, layoutId, format, allowZero, showNumbers, seed } = settings;
  const layout = findLayout(ADDITION_LAYOUTS, layoutId);

  const problems = useMemo(
    () => generateAdditionProblems(maxSum, layout.cols * layout.rows, allowZero, mulberry32(seed)),
    [maxSum, layout.cols, layout.rows, allowZero, seed],
  );

  return (
    <div className="worksheet">
      <WorksheetControls code={code} onReseed={reseed} onLoad={(input) => load(input) !== null}>
        <ChoiceGroup
          legend="Numbers"
          options={MAX_SUM_OPTIONS}
          value={maxSum}
          onChange={(value) => update({ maxSum: value })}
        />
        <SelectField
          label="Layout & quantity"
          options={ADDITION_LAYOUTS}
          value={layoutId}
          onChange={(value) => update({ layoutId: value })}
        />
        <SelectField
          label="Problem style"
          options={ADDITION_FORMATS}
          value={format}
          onChange={(value) => update({ format: value })}
        />
        <FieldGroup label="Options">
          <CheckboxField
            label="Include zero (e.g. 0 + 4)"
            checked={allowZero}
            onChange={(checked) => update({ allowZero: checked })}
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
        instructions="Add the numbers. Write the answer in the box."
        code={code}
      >
        <ProblemGrid layout={layout}>
          {problems.map((p) => (
            <AdditionProblemCard key={p.id} problem={p} format={format} showNumber={showNumbers} />
          ))}
        </ProblemGrid>
      </WorksheetSheet>
    </div>
  );
};

export { AdditionWorksheet };
