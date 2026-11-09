import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import type { TokenDistributionSlice } from '../../types';
import { formatNumber } from '../../utils/formatters';

interface TokenDistributionChartProps {
  data: TokenDistributionSlice[];
}

export const TokenDistributionChart: React.FC<TokenDistributionChartProps> = ({ data }) => {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload as TokenDistributionSlice;
      return (
        <div className="bg-[#151D30] border border-[#22304E] p-2.5 rounded-xl text-xs space-y-0.5">
          <p className="font-semibold text-white">{item.name}</p>
          <p className="text-cyan-400 font-bold">
            {item.percentage}% ({formatNumber(item.tokens)} tokens)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div className="w-44 h-44 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<CustomTooltip />} />
            <Pie
              data={data}
              innerRadius={50}
              outerRadius={75}
              paddingAngle={4}
              dataKey="percentage"
            >
              {data.map((entry, index) => (
                <Cell key={`slice-${index}`} fill={entry.color} stroke="#151D30" strokeWidth={2} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="flex-1 space-y-2 w-full">
        {data.map((item) => (
          <div key={item.name} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-gray-300 truncate max-w-[150px]">{item.name}</span>
            </div>
            <div className="text-right font-mono">
              <span className="text-white font-semibold">{item.percentage}%</span>
              <span className="text-gray-500 text-[11px] ml-2 font-normal">
                ({formatNumber(item.tokens)})
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
