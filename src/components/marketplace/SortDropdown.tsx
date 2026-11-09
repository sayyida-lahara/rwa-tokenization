import React from 'react';
import { ArrowDownUp } from 'lucide-react';

interface SortDropdownProps {
  value: string;
  onChange: (sort: any) => void;
}

export const SortDropdown: React.FC<SortDropdownProps> = ({ value, onChange }) => {
  return (
    <div className="flex items-center gap-2 bg-[#151D30] border border-[#1E293B] rounded-xl px-3 py-2 text-xs">
      <ArrowDownUp className="w-3.5 h-3.5 text-gray-400" />
      <span className="text-gray-400 font-medium hidden sm:inline">Sort:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent text-white font-medium focus:outline-none cursor-pointer pr-1"
      >
        <option value="recently_listed" className="bg-[#151D30] text-white">
          Recently Listed
        </option>
        <option value="lowest_price" className="bg-[#151D30] text-white">
          Lowest Token Price
        </option>
        <option value="highest_price" className="bg-[#151D30] text-white">
          Highest Token Price
        </option>
        <option value="highest_valuation" className="bg-[#151D30] text-white">
          Highest Valuation
        </option>
        <option value="highest_yield" className="bg-[#151D30] text-white">
          Highest Yield (APY)
        </option>
        <option value="most_popular" className="bg-[#151D30] text-white">
          Most Popular / Funded
        </option>
      </select>
    </div>
  );
};
