import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
  iconColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subValue,
  trend,
  icon,
  iconColor = 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
}) => {
  return (
    <div className="p-5 rounded-2xl bg-[#151D30] border border-[#1E293B] hover:border-[#283857] transition-all shadow-lg flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-medium text-gray-400 block">{label}</span>
          <h3 className="text-2xl font-bold font-display text-white mt-1 tracking-tight">
            {value}
          </h3>
        </div>
        {icon && (
          <div className={`p-2.5 rounded-xl border shrink-0 ${iconColor}`}>
            {icon}
          </div>
        )}
      </div>

      {(subValue || trend) && (
        <div className="flex items-center justify-between text-xs pt-3 mt-3 border-t border-[#1E293B]/60">
          {subValue && <span className="text-gray-400">{subValue}</span>}
          {trend && (
            <span
              className={`flex items-center gap-1 font-semibold text-[11px] px-2 py-0.5 rounded-md ${
                trend.isPositive
                  ? 'text-emerald-400 bg-emerald-500/10'
                  : 'text-rose-400 bg-rose-500/10'
              }`}
            >
              {trend.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span>{trend.value}</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
};
