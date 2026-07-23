import React, { useState } from "react";
import type { Household } from "../../gen/invite/invite_pb.js";
import { Button } from "@ui/button";

interface HouseholdPickerProps {
  households: Household[];
  onSelect: (householdId: string) => void;
  onCreate: (name: string) => void;
  onUnassign?: () => void;
  disabled?: boolean;
}

export const HouseholdPicker: React.FC<HouseholdPickerProps> = ({
  households,
  onSelect,
  onCreate,
  onUnassign,
  disabled,
}) => {
  const [creatingNew, setCreatingNew] = useState(false);
  const [newName, setNewName] = useState("");

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === "__new__") {
      setCreatingNew(true);
    } else if (val === "__unassign__") {
      onUnassign?.();
    } else if (val !== "") {
      onSelect(val);
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      onCreate(newName.trim());
      setNewName("");
      setCreatingNew(false);
    }
  };

  if (creatingNew) {
    return (
      <form className="household-picker__new-form" onSubmit={handleCreate}>
        <input
          className="invite-manager__input household-picker__new-input"
          type="text"
          placeholder="Household name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          autoFocus
          required
          disabled={disabled}
        />
        <div className="household-picker__new-actions">
          <Button type="submit" variant="default" disabled={disabled || !newName.trim()}>
            Create
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setCreatingNew(false)}
            disabled={disabled}
          >
            Cancel
          </Button>
        </div>
      </form>
    );
  }

  return (
    <select
      className="invite-manager__input household-picker__select"
      defaultValue=""
      onChange={handleSelect}
      disabled={disabled}
    >
      <option value="" disabled>
        Assign to…
      </option>
      {households.map((h) => (
        <option key={h.id} value={h.id}>
          {h.name}
        </option>
      ))}
      <option value="__new__">+ Create new household</option>
      {onUnassign && <option value="__unassign__">Remove from household</option>}
    </select>
  );
};
