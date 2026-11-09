import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import type { ValuationPoint } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface ValuationHistoryChartProps {
  data: ValuationPoint[];
}

export const ValuationHistoryChart: React.FC<ValuationHistoryChartProps> = ({ data }) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#151D30] border border-[#22304E] p-3 rounded-xl shadow-xl text-xs space-y-1">
          <p className="font-semibold text-gray-300">{label}</p>
          <p className="text-cyan-400 font-bold">
            Asset Valuation: {formatCurrency(payload[0].value, true)}
          </p>
          {payload[1] && (
            <p className="text-emerald-400 font-bold">
              Token Price: ${payload[1].value} USDC
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
          <XAxis
            dataKey="date"
            stroke="#64748B"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: '#1E293B' }}
          />
          <YAxis
            stroke="#64748B"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => `$${(val / 1_000_000).toFixed(1)}M`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="valuation"
            stroke="#00E5FF"
            strokeWidth={3}
            dot={{ fill: '#00E5FF', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
