import React, { useState } from "react";
import type { InviteeWithStatus, Household } from "../../gen/invite/invite_pb.js";
import { PersonType } from "../../gen/invite/invite_pb.js";
import { HouseholdPicker } from "./HouseholdPicker.js";

interface UnassignedSectionProps {
  persons: InviteeWithStatus[];
  allHouseholds: Household[];
  onAssign: (personId: string, householdId: string | null, newHouseholdName?: string) => Promise<void>;
  disabled?: boolean;
}

export const UnassignedSection: React.FC<UnassignedSectionProps> = ({
  persons,
  allHouseholds,
  onAssign,
  disabled,
}) => {
  const [assigningPersonId, setAssigningPersonId] = useState<string | null>(null);
  const [assignError, setAssignError] = useState<string | null>(null);

  if (persons.length === 0) return null;

  const handleAssign = async (personId: string, householdId: string | null, newName?: string) => {
    setAssignError(null);
    try {
      await onAssign(personId, householdId, newName);
    } catch (err) {
      setAssignError(err instanceof Error ? err.message : "Assign failed");
    } finally {
      setAssigningPersonId(null);
    }
  };

  return (
    <div className="household-card household-card--unassigned">
      <div className="household-card__header">
        <span className="household-card__name">Unassigned</span>
        <span className="household-card__count">{persons.length}</span>
      </div>
      {assignError && <p className="invite-manager__error">{assignError}</p>}
      <ul className="household-card__members">
        {persons.map((iws) => {
          const personId = iws.invitee?.personId ?? "";
          const isAssigning = assigningPersonId === personId;
          return (
            <li key={personId} className="household-card__member-row">
              <span className="household-card__member-name">{iws.person?.name}</span>
              <span className="household-card__member-type">
                {iws.person?.type === PersonType.CHILD ? "child" : "adult"}
              </span>
              {isAssigning ? (
                <HouseholdPicker
                  households={allHouseholds}
                  onSelect={(id) => handleAssign(personId, id)}
                  onCreate={(name) => handleAssign(personId, null, name)}
                  disabled={disabled}
                />
              ) : (
                <button
                  className="household-card__reassign-btn"
                  onClick={() => setAssigningPersonId(personId)}
                  disabled={disabled}
                  type="button"
                >
                  assign
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};
