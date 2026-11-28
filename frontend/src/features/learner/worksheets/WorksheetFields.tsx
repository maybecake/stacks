import React from "react";

type ChoiceOption<T> = { id: T; label: string; description?: string };
type SelectOption<T> = { id: T; label: string };

type ChoiceGroupProps<T extends string | number> = {
  legend: string;
  options: readonly ChoiceOption<T>[];
  value: T;
  onChange: (value: T) => void;
};

type SelectFieldProps<T extends string> = {
  label: string;
  options: readonly SelectOption<T>[];
  value: T;
  onChange: (value: T) => void;
};

type CheckboxFieldProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

type TextFieldProps = {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
};

type FieldGroupProps = {
  label: string;
  children: React.ReactNode;
};

/** Two-column grid of toggle buttons, e.g. difficulty presets. */
function ChoiceGroup<T extends string | number>({
  legend,
  options,
  value,
  onChange,
}: ChoiceGroupProps<T>) {
  return (
    <fieldset className="worksheet__field">
      <legend className="worksheet__label">{legend}</legend>
      <div className="worksheet__choice-grid">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            className={`worksheet__choice${value === option.id ? " worksheet__choice--active" : ""}`}
            aria-pressed={value === option.id}
            onClick={() => onChange(option.id)}
          >
            <span className="worksheet__choice-title">{option.label}</span>
            {option.description && (
              <span className="worksheet__choice-hint">{option.description}</span>
            )}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function SelectField<T extends string>({ label, options, value, onChange }: SelectFieldProps<T>) {
  return (
    <label className="worksheet__field">
      <span className="worksheet__label">{label}</span>
      <select
        className="worksheet__input"
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
      >
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

const CheckboxField: React.FC<CheckboxFieldProps> = ({ label, checked, onChange }) => (
  <label className="worksheet__checkbox">
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    {label}
  </label>
);

const TextField: React.FC<TextFieldProps> = ({ label, value, placeholder, onChange }) => (
  <label className="worksheet__field">
    <span className="worksheet__label">{label}</span>
    <input
      type="text"
      className="worksheet__input"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  </label>
);

/** Labelled group for related controls such as a set of checkboxes. */
const FieldGroup: React.FC<FieldGroupProps> = ({ label, children }) => (
  <div className="worksheet__field">
    <span className="worksheet__label">{label}</span>
    {children}
  </div>
);

export { CheckboxField, ChoiceGroup, FieldGroup, SelectField, TextField };
