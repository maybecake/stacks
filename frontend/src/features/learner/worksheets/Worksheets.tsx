import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { LongDivisionWorksheet } from "./long-division/LongDivisionWorksheet";
import "./worksheets.css";

type WorksheetGenerator = {
  id: string;
  label: string;
  component: React.FC;
};

/** Add new generators here; each one owns its controls and renders a <WorksheetSheet>. */
const WORKSHEET_GENERATORS: WorksheetGenerator[] = [
  { id: "long-division", label: "Long Division", component: LongDivisionWorksheet },
];

const Worksheets: React.FC = () => {
  const { worksheet } = useParams();
  const navigate = useNavigate();
  const active = WORKSHEET_GENERATORS.find((g) => g.id === worksheet) ?? WORKSHEET_GENERATORS[0];
  const activeId = active.id;
  const ActiveGenerator = active.component;

  return (
    <div className="worksheets">
      <nav className="worksheets__picker" aria-label="Worksheet type">
        {WORKSHEET_GENERATORS.map((g) => (
          <button
            key={g.id}
            type="button"
            className={`worksheets__picker-item${g.id === activeId ? " worksheets__picker-item--active" : ""}`}
            aria-pressed={g.id === activeId}
            onClick={() => navigate(`/learner/worksheets/${g.id}`)}
          >
            {g.label}
          </button>
        ))}
      </nav>
      <ActiveGenerator key={active.id} />
    </div>
  );
};

export { Worksheets };
