"use client";

import SearchableDropdown from './SearchableDropdown';

/**
 * Searchable state / province picker. `states` comes from the currently selected
 * country, so it only ever shows regions belonging to that country.
 */
export default function StateDropdown({
  states,
  value,
  onChange,
}: {
  states: string[];
  value: string;
  onChange: (state: string) => void;
}) {
  const options = states.map((s) => ({ value: s, label: s }));
  return (
    <SearchableDropdown
      options={options}
      value={value}
      onChange={onChange}
      placeholder="Select state"
      searchPlaceholder="Search states…"
      ariaLabel="State / Province"
      disabled={states.length === 0}
    />
  );
}
