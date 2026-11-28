import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import * as Tabs from "@radix-ui/react-tabs";
import TimeLearner from "./TimeLearner";
import { Worksheets } from "./worksheets/Worksheets";
import "./learner.css";

const LEARNER_TABS = [
  { id: "time-zones", label: "Time Zones" },
  { id: "worksheets", label: "Worksheets" },
];
const DEFAULT_TAB = LEARNER_TABS[0].id;

export const Learner: React.FC = () => {
  const { tab } = useParams();
  const navigate = useNavigate();
  const activeTab = LEARNER_TABS.some((t) => t.id === tab) ? tab! : DEFAULT_TAB;

  return (
    <div className="learner">
      <Tabs.Root value={activeTab} onValueChange={(value) => navigate(`/learner/${value}`)}>
        <Tabs.List className="learner__tabs-list" aria-label="Learner tools">
          {LEARNER_TABS.map((t) => (
            <Tabs.Trigger key={t.id} className="learner__tab" value={t.id}>
              {t.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
        <Tabs.Content className="learner__tab-content" value="time-zones">
          <TimeLearner />
        </Tabs.Content>
        <Tabs.Content className="learner__tab-content" value="worksheets">
          <Worksheets />
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
};
