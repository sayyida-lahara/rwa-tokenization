import React from 'react';
import type { FilterState } from '../../types';
import { Filter, RotateCcw, Check } from 'lucide-react';

interface FilterSidebarProps {
  filters: FilterState;
  onChange: (newFilters: FilterState) => void;
  onReset: () => void;
  availableLocations: string[];
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  onChange,
  onReset,
  availableLocations,
}) => {
  const categories = [
    'All Assets',
    'Residential',
    'Commercial',
    'Industrial',
    'Gold',
    'Infrastructure',
    'Renewable Energy',
  ];

  const investmentStatuses = ['All', 'Active', 'Fully Funded', 'Upcoming'];
  const verificationStatuses = ['All', 'Approved', 'Pending Verification'];

  return (
    <aside className="w-full lg:w-64 space-y-5 bg-[#151D30] border border-[#1E293B] rounded-2xl p-5 shrink-0">
      <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
        <div className="flex items-center gap-2 text-white font-semibold text-sm">
          <Filter className="w-4 h-4 text-cyan-400" />
          <span>Filters</span>
        </div>
        <button
          onClick={onReset}
          className="text-[11px] text-gray-400 hover:text-cyan-400 flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Category Filter */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-gray-300 block uppercase tracking-wider">
          Category
        </label>
        <div className="space-y-1">
          {categories.map((cat) => {
            const isSelected =
              cat === 'All Assets'
                ? filters.category === 'all' || !filters.category
                : filters.category.toLowerCase() === cat.toLowerCase();

            return (
              <button
                key={cat}
                type="button"
                onClick={() =>
                  onChange({
                    ...filters,
                    category: cat === 'All Assets' ? 'all' : cat,
                  })
                }
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-medium text-left transition-colors ${
                  isSelected
                    ? 'bg-blue-600/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{cat}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Minimum Investment Filter */}
      <div className="space-y-2 pt-2 border-t border-[#1E293B]">
        <div className="flex justify-between items-center text-xs">
          <label className="font-semibold text-gray-300 uppercase tracking-wider">
            Min Investment
          </label>
          <span className="text-cyan-400 font-mono font-semibold">${filters.minInvestment}</span>
        </div>
        <input
          type="range"
          min={0}
          max={1000}
          step={50}
          value={filters.minInvestment}
          onChange={(e) =>
            onChange({ ...filters, minInvestment: Number(e.target.value) })
          }
          className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-[#0F1626] rounded-lg"
        />
        <div className="flex justify-between text-[10px] text-gray-500">
          <span>$0</span>
          <span>$500</span>
          <span>$1,000+</span>
        </div>
      </div>

      {/* Asset Valuation Filter */}
      <div className="space-y-2 pt-2 border-t border-[#1E293B]">
        <div className="flex justify-between items-center text-xs">
          <label className="font-semibold text-gray-300 uppercase tracking-wider">
            Max Valuation
          </label>
          <span className="text-cyan-400 font-mono font-semibold">
            ${(filters.maxValuation / 1_000_000).toFixed(0)}M
          </span>
        </div>
        <input
          type="range"
          min={10000000}
          max={60000000}
          step={5000000}
          value={filters.maxValuation}
          onChange={(e) =>
            onChange({ ...filters, maxValuation: Number(e.target.value) })
          }
          className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-[#0F1626] rounded-lg"
        />
        <div className="flex justify-between text-[10px] text-gray-500">
          <span>$10M</span>
          <span>$35M</span>
          <span>$60M</span>
        </div>
      </div>

      {/* Location Dropdown */}
      <div className="space-y-2 pt-2 border-t border-[#1E293B]">
        <label className="text-xs font-semibold text-gray-300 block uppercase tracking-wider">
          Location
        </label>
        <select
          value={filters.location}
          onChange={(e) => onChange({ ...filters, location: e.target.value })}
          className="w-full bg-[#0F1626] border border-[#22304E] text-gray-300 text-xs rounded-xl p-2.5 focus:outline-none focus:border-cyan-400"
        >
          <option value="all">All Locations</option>
          {availableLocations.map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </select>
      </div>

      {/* Investment Status */}
      <div className="space-y-2 pt-2 border-t border-[#1E293B]">
        <label className="text-xs font-semibold text-gray-300 block uppercase tracking-wider">
          Investment Status
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {investmentStatuses.map((st) => {
            const isSelected =
              st === 'All' ? filters.investmentStatus === 'all' : filters.investmentStatus === st;
            return (
              <button
                key={st}
                type="button"
                onClick={() =>
                  onChange({
                    ...filters,
                    investmentStatus: st === 'All' ? 'all' : st,
                  })
                }
                className={`py-1.5 px-2 rounded-lg text-[11px] font-medium border text-center transition-colors ${
                  isSelected
                    ? 'bg-blue-600/20 border-cyan-400 text-cyan-300'
                    : 'bg-[#0F1626] border-[#1E293B] text-gray-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            );
          })}
        </div>
      </div>

      {/* Verification Status */}
      <div className="space-y-2 pt-2 border-t border-[#1E293B]">
        <label className="text-xs font-semibold text-gray-300 block uppercase tracking-wider">
          Verification
        </label>
        <div className="space-y-1">
          {verificationStatuses.map((vs) => {
            const isSelected =
              vs === 'All' ? filters.verificationStatus === 'all' : filters.verificationStatus === vs;
            return (
              <button
                key={vs}
                type="button"
                onClick={() =>
                  onChange({
                    ...filters,
                    verificationStatus: vs === 'All' ? 'all' : vs,
                  })
                }
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium text-left transition-colors ${
                  isSelected
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{vs === 'All' ? 'All (Approved & Under Review)' : vs}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
};
