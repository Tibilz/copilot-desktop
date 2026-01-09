import { Search } from 'lucide-react';
// import React from 'react';

interface SearchBarProps {
    value: string;
    onChange: (val: string) => void;
}

export const SearchBar = ({ value, onChange }: SearchBarProps) => {
    return (
        <div className="relative mb-2 mt-4 px-3">
            <Search className="w-4 h-4 absolute left-6 top-1/2 transform -translate-y-1/2 text-text-secondary" />
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Suche"
                className="w-full bg-bg-secondary border border-border rounded-md pl-9 pr-2 py-1.5 text-sm outline-none focus:border-accent text-text-primary placeholder:text-text-secondary"
            />
        </div>
    );
};
