import React, { useState } from "react";
import type { InviteeWithStatus, Household } from "../../gen/invite/invite_pb.js";
import { PersonType } from "../../gen/invite/invite_pb.js";
import { HouseholdPicker } from "./HouseholdPicker.js";

interface HouseholdCardProps {
  household: Household;
  members: InviteeWithStatus[];
  allHouseholds: Household[];
  onReassign: (personId: string, targetHouseholdId: string | null, newHouseholdName?: string) => Promise<void>;
  disabled?: boolean;
}

export const HouseholdCard: React.FC<HouseholdCardProps> = ({
  household,
  members,
  allHouseholds,
  onReassign,
  disabled,
}) => {
  const [reassigningPersonId, setReassigningPersonId] = useState<string | null>(null);
  const [reassignError, setReassignError] = useState<string | null>(null);

  const otherHouseholds = allHouseholds.filter((h) => h.id !== household.id);

  const handleReassign = async (personId: string, targetId: string | null, newName?: string) => {
    setReassignError(null);
    try {
      await onReassign(personId, targetId, newName);
    } catch (err) {
      setReassignError(err instanceof Error ? err.message : "Reassign failed");
    } finally {
      setReassigningPersonId(null);
    }
  };

  return (
    <div className="household-card">
      <div className="household-card__header">
        <span className="household-card__name">{household.name}</span>
        <span className="household-card__count">{members.length}</span>
      </div>
      {reassignError && <p className="invite-manager__error">{reassignError}</p>}
      <ul className="household-card__members">
        {members.map((iws) => {
          const personId = iws.invitee?.personId ?? "";
          const isReassigning = reassigningPersonId === personId;
          return (
            <li key={personId} className="household-card__member-row">
              <span className="household-card__member-name">{iws.person?.name}</span>
              <span className="household-card__member-type">
                {iws.person?.type === PersonType.CHILD ? "child" : "adult"}
              </span>
              {isReassigning ? (
                <HouseholdPicker
                  households={otherHouseholds}
                  onSelect={(id) => handleReassign(personId, id)}
                  onCreate={(name) => handleReassign(personId, null, name)}
                  onUnassign={() => handleReassign(personId, null)}
                  disabled={disabled}
                />
              ) : (
                <button
                  className="household-card__reassign-btn"
                  onClick={() => setReassigningPersonId(personId)}
                  disabled={disabled}
                  type="button"
                >
                  reassign
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};
