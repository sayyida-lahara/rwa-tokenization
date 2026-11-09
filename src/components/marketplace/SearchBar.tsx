import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Search by asset name, city, country, or category...',
  className = '',
}) => {
  return (
    <div className={`relative flex items-center w-full ${className}`}>
      <Search className="absolute left-4 w-4 h-4 text-gray-400 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#151D30] border border-[#1E293B] focus:border-cyan-400 rounded-xl pl-11 pr-10 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none transition-all shadow-inner"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 p-1 rounded-md text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
