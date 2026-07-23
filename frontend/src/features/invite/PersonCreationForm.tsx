import React, { useState } from "react";
import { PersonType } from "../../gen/invite/invite_pb.js";
import { Button } from "@ui/button";

interface PersonFormData {
  name: string;
  type: PersonType;
}

interface PersonCreationFormProps {
  onSubmit: (data: PersonFormData) => Promise<void>;
  disabled?: boolean;
}

export const PersonCreationForm: React.FC<PersonCreationFormProps> = ({ onSubmit, disabled }) => {
  const [name, setName] = useState("");
  const [type, setType] = useState<PersonType>(PersonType.CHILD);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onSubmit({ name, type });
      setName("");
      setType(PersonType.CHILD);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add guest");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="invite-manager__add-guest-form" onSubmit={handleSubmit}>
      <h3 className="invite-manager__subsection-title">Add Guest</h3>
      <label className="invite-manager__label">
        Name
        <input
          className="invite-manager__input"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={disabled || loading}
        />
      </label>
      <label className="invite-manager__label">
        Type
        <select
          className="invite-manager__input"
          value={type}
          onChange={(e) => setType(Number(e.target.value) as PersonType)}
          disabled={disabled || loading}
        >
          <option value={PersonType.CHILD}>Child</option>
          <option value={PersonType.ADULT}>Adult</option>
        </select>
      </label>
      {error && <p className="invite-manager__error">{error}</p>}
      <Button type="submit" variant="default" disabled={disabled || loading}>
        {loading ? "Adding…" : "Add Guest"}
      </Button>
    </form>
  );
};
