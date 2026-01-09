import { Search } from 'lucide-react';
// import React from 'react';

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
}

export const SearchBar = ({ value, onChange }: SearchBarProps) => {
  return (
    <div className="relative mb-2 mt-4 px-3">
      <Search className="absolute left-6 top-1/2 h-4 w-4 -translate-y-1/2 transform text-text-secondary" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Suche"
        className="w-full rounded-md border border-border bg-bg-secondary py-1.5 pl-9 pr-2 text-sm text-text-primary outline-none placeholder:text-text-secondary focus:border-accent"
      />
    </div>
  );
};
