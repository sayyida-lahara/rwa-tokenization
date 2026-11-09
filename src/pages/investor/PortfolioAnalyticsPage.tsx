import React from 'react';
import { useInvestment } from '../../context/InvestmentContext';
import { PortfolioPerformanceChart } from '../../components/charts/PortfolioPerformanceChart';
import { AssetAllocationChart } from '../../components/charts/AssetAllocationChart';
import { StatCard } from '../../components/dashboard/StatCard';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import { PieChart, TrendingUp, DollarSign, ShieldCheck, BarChart2 } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';

export const PortfolioAnalyticsPage: React.FC = () => {
  const { portfolio } = useInvestment();

  // Prepare Asset-wise bar chart data
  const barChartData = portfolio.holdings.map((h) => ({
    name: h.asset?.name.substring(0, 16) + '...' || h.assetId,
    invested: h.totalInvested,
    currentValue: h.currentValue,
    gain: h.gainLoss,
  }));

  const allocationData = React.useMemo(() => {
    const map: Record<string, { value: number; color: string }> = {};
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#00E5FF', '#8B5CF6'];
    let cIdx = 0;

    portfolio.holdings.forEach((h) => {
      const cat = h.asset?.category || 'Other';
      if (!map[cat]) {
        map[cat] = { value: 0, color: colors[cIdx % colors.length] };
        cIdx++;
      }
      map[cat].value += h.currentValue;
    });

    return Object.entries(map).map(([name, item]) => ({
      name,
      value: item.value,
      color: item.color,
    }));
  }, [portfolio.holdings]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-4 border-b border-[#1E293B]">
        <h1 className="text-2xl font-bold font-display text-white">Portfolio Analytics</h1>
        <p className="text-xs text-gray-400">
          In-depth financial performance, category diversification, and yield projections
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Portfolio Net Worth"
          value={formatCurrency(portfolio.totalPortfolioValue)}
          trend={{
            value: `+${formatPercent(portfolio.overallReturnPercent)}`,
            isPositive: portfolio.overallReturnPercent >= 0,
          }}
          icon={<DollarSign className="w-5 h-5 text-cyan-400" />}
        />

        <StatCard
          label="Invested Capital"
          value={formatCurrency(portfolio.totalInvested)}
          subValue="Principal basis"
          icon={<BarChart2 className="w-5 h-5 text-blue-400" />}
        />

        <StatCard
          label="Projected Annual Yield"
          value={formatCurrency(
            portfolio.holdings.reduce(
              (acc, h) => acc + (h.currentValue * (h.asset?.expectedYield || 10)) / 100,
              0
            )
          )}
          subValue="Estimated cash flow / yr"
          icon={<TrendingUp className="w-5 h-5 text-emerald-400" />}
        />

        <StatCard
          label="Weighted Avg. Yield"
          value="10.8% APY"
          subValue="Across 3 asset categories"
          icon={<ShieldCheck className="w-5 h-5 text-purple-400" />}
        />
      </div>

      {/* Primary Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Cumulative performance */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-[#151D30] border border-[#1E293B] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-white font-display">
              Historical Valuation Growth
            </h3>
            <span className="text-xs text-gray-400">Total Return Trajectory</span>
          </div>
          <PortfolioPerformanceChart currentValue={portfolio.totalPortfolioValue} />
        </div>

        {/* Sector Allocation */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-[#151D30] border border-[#1E293B] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-white font-display">
              Sector Allocation
            </h3>
            <span className="text-xs text-cyan-400">Diversification</span>
          </div>
          <AssetAllocationChart data={allocationData} />
        </div>
      </div>

      {/* Asset-Wise Capital Breakdown Bar Chart */}
      <div className="p-6 rounded-2xl bg-[#151D30] border border-[#1E293B] space-y-4">
        <h3 className="text-base font-semibold text-white font-display">
          Asset-Wise Comparison: Invested vs. Current Value
        </h3>

        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barChartData} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
              <YAxis
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-[#151D30] border border-[#22304E] p-3 rounded-xl shadow-xl text-xs space-y-1">
                        <p className="font-semibold text-white">{label}</p>
                        <p className="text-blue-400">
                          Invested: {formatCurrency(payload[0]?.value as number)}
                        </p>
                        <p className="text-cyan-400 font-bold">
                          Current: {formatCurrency(payload[1]?.value as number)}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="invested" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Invested Basis" />
              <Bar dataKey="currentValue" fill="#00E5FF" radius={[4, 4, 0, 0]} name="Current Valuation" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
