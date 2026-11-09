import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { formatCurrency } from '../../utils/formatters';

interface AllocationItem {
  name: string;
  value: number;
  color: string;
}

interface AssetAllocationChartProps {
  data?: AllocationItem[];
}

export const AssetAllocationChart: React.FC<AssetAllocationChartProps> = ({ data }) => {
  const defaultData: AllocationItem[] = [
    { name: 'Commercial Real Estate', value: 75000, color: '#3B82F6' },
    { name: 'Renewable Clean Energy', value: 48000, color: '#10B981' },
    { name: 'Gold & Vault Metals', value: 34000, color: '#F59E0B' },
  ];

  const chartData = data && data.length > 0 ? data : defaultData;
  const total = chartData.reduce((acc, curr) => acc + curr.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
      return (
        <div className="bg-[#151D30] border border-[#22304E] p-2.5 rounded-xl text-xs space-y-0.5">
          <p className="font-semibold text-white">{item.name}</p>
          <p className="text-cyan-400 font-bold">
            {formatCurrency(item.value)} ({pct}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div className="w-48 h-48 shrink-0 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<CustomTooltip />} />
            <Pie
              data={chartData}
              innerRadius={55}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="#151D30" strokeWidth={2} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[10px] text-gray-400">Total Portfolio</span>
          <span className="text-xs font-bold text-white font-display">
            {formatCurrency(total, true)}
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex-1 space-y-2.5 w-full">
        {chartData.map((item) => {
          const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
          return (
            <div key={item.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-gray-300 truncate max-w-[150px]">{item.name}</span>
              </div>
              <div className="text-right font-mono">
                <span className="text-white font-semibold">{formatCurrency(item.value, true)}</span>
                <span className="text-gray-500 text-[11px] ml-1.5">({pct}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
