"use client";

import SearchableDropdown from './SearchableDropdown';
import { COUNTRIES } from '@/data/regions';

/** Searchable country picker (flag + name), driven by the regions config. */
export default function CountryDropdown({
  value,
  onChange,
}: {
  value: string;
  onChange: (code: string) => void;
}) {
  const options = COUNTRIES.map((c) => ({ value: c.code, label: c.name, flag: c.flag }));
  return (
    <SearchableDropdown
      options={options}
      value={value}
      onChange={onChange}
      placeholder="Select country"
      searchPlaceholder="Search countries…"
      ariaLabel="Country / Region"
    />
  );
}
