import React from 'react';

interface PropertySpecsProps {
  specifications: Record<string, string | number>;
}

export const PropertySpecs: React.FC<PropertySpecsProps> = ({ specifications }) => {
  const entries = Object.entries(specifications);

  return (
    <div className="space-y-3">
      <h3 className="text-base font-semibold text-white font-display">Asset Specifications</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {entries.map(([key, value]) => (
          <div
            key={key}
            className="flex items-center justify-between p-3 rounded-xl bg-[#0F1626] border border-[#1E293B] text-xs"
          >
            <span className="text-gray-400">{key}</span>
            <span className="font-semibold text-white text-right">{String(value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
