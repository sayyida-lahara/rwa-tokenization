import React from 'react';
import { Building, Home, Factory, Coins, Zap, Shield, Layers } from 'lucide-react';

interface CategoryPillsProps {
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  counts?: Record<string, number>;
}

export const CategoryPills: React.FC<CategoryPillsProps> = ({
  selectedCategory,
  onSelectCategory,
  counts = {},
}) => {
  const tabs = [
    { id: 'all', label: 'All RWAs', icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'Commercial', label: 'Commercial', icon: <Building className="w-3.5 h-3.5" /> },
    { id: 'Residential', label: 'Residential', icon: <Home className="w-3.5 h-3.5" /> },
    { id: 'Industrial', label: 'Industrial', icon: <Factory className="w-3.5 h-3.5" /> },
    { id: 'Gold', label: 'Gold & Metals', icon: <Coins className="w-3.5 h-3.5" /> },
    { id: 'Renewable Energy', label: 'Clean Energy', icon: <Zap className="w-3.5 h-3.5" /> },
    { id: 'Infrastructure', label: 'Infrastructure', icon: <Shield className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
      {tabs.map((tab) => {
        const isSelected =
          tab.id === 'all'
            ? selectedCategory === 'all' || !selectedCategory
            : selectedCategory.toLowerCase() === tab.id.toLowerCase();

        return (
          <button
            key={tab.id}
            onClick={() => onSelectCategory(tab.id)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border shrink-0 ${
              isSelected
                ? 'bg-blue-600/20 text-cyan-300 border-cyan-400/50 shadow-[0_0_12px_rgba(0,229,255,0.2)]'
                : 'bg-[#151D30] text-gray-400 hover:text-white border-[#1E293B] hover:border-[#2D3E62]'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {counts[tab.id] !== undefined && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isSelected ? 'bg-cyan-500/20 text-cyan-300' : 'bg-black/30 text-gray-500'
                }`}
              >
                {counts[tab.id]}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
