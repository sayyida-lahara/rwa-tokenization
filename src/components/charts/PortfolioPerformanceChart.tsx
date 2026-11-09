import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { formatCurrency } from '../../utils/formatters';

interface PortfolioPerformanceChartProps {
  currentValue?: number;
}

export const PortfolioPerformanceChart: React.FC<PortfolioPerformanceChartProps> = ({
  currentValue = 157000,
}) => {
  const data = [
    { month: 'Sep 25', value: 85000, invested: 85000 },
    { month: 'Oct 25', value: 98000, invested: 95000 },
    { month: 'Nov 25', value: 115000, invested: 110000 },
    { month: 'Dec 25', value: 128000, invested: 120000 },
    { month: 'Jan 26', value: 142000, invested: 132000 },
    { month: 'Feb 26', value: currentValue, invested: Math.round(currentValue * 0.9) },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#151D30] border border-[#22304E] p-3 rounded-xl shadow-xl text-xs space-y-1">
          <p className="font-semibold text-gray-300">{label}</p>
          <p className="text-cyan-400 font-bold">
            Valuation: {formatCurrency(payload[0].value)}
          </p>
          {payload[1] && (
            <p className="text-gray-400">
              Invested: {formatCurrency(payload[1].value)}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="valGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#00E5FF" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="invGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
          <XAxis
            dataKey="month"
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
            tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#00E5FF"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#valGrad)"
          />
          <Area
            type="monotone"
            dataKey="invested"
            stroke="#3B82F6"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            fillOpacity={1}
            fill="url(#invGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
