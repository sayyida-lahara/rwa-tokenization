import React from 'react';
import { Link } from 'react-router';
import { useInvestment } from '../../context/InvestmentContext';
import { useAuth } from '../../context/AuthContext';
import { useWallet } from '../../context/WalletContext';
import { StatCard } from '../../components/dashboard/StatCard';
import { HoldingsTable } from '../../components/dashboard/HoldingsTable';
import { RecentTransactionsTable } from '../../components/dashboard/RecentTransactionsTable';
import { PortfolioPerformanceChart } from '../../components/charts/PortfolioPerformanceChart';
import { AssetAllocationChart } from '../../components/charts/AssetAllocationChart';
import { formatCurrency, formatNumber, formatPercent } from '../../utils/formatters';
import {
  Wallet,
  TrendingUp,
  Building,
  Coins,
  ArrowRight,
  Sparkles,
  Download,
  Calendar,
} from 'lucide-react';

export const InvestorDashboardPage: React.FC = () => {
  const { portfolio, transactions, openInvestModal } = useInvestment();
  const { user } = useAuth();
  const { wallet } = useWallet();

  // Category breakdown for allocation chart
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
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-blue-900/30 via-[#151D30] to-[#151D30] border border-[#22304E] shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-cyan-400 font-mono">
              KYC Level: {user.kycLevel} Verified
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-white">
            Welcome back, {user.name}
          </h1>
          <p className="text-xs text-gray-400">
            Real-time institutional oversight of your fractional tokenized assets & dividend flows.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            to="/explore"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-95 text-white font-semibold text-xs shadow-lg shadow-cyan-500/20 transition-all"
          >
            Explore New Offerings
          </Link>
        </div>
      </div>

      {/* OVERVIEW STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          label="Total Portfolio Value"
          value={formatCurrency(portfolio.totalPortfolioValue)}
          trend={{
            value: `+${formatPercent(portfolio.overallReturnPercent)}`,
            isPositive: portfolio.overallReturnPercent >= 0,
          }}
          icon={<Wallet className="w-5 h-5 text-cyan-400" />}
          iconColor="bg-cyan-500/10 border-cyan-500/30"
        />

        <StatCard
          label="Total Capital Invested"
          value={formatCurrency(portfolio.totalInvested)}
          subValue="Net historical allocation"
          icon={<Coins className="w-5 h-5 text-blue-400" />}
          iconColor="bg-blue-500/10 border-blue-500/30"
        />

        <StatCard
          label="Total Assets Owned"
          value={portfolio.totalAssetsOwned}
          subValue="Across 3 asset classes"
          icon={<Building className="w-5 h-5 text-emerald-400" />}
          iconColor="bg-emerald-500/10 border-emerald-500/30"
        />

        <StatCard
          label="Total Tokens Held"
          value={formatNumber(portfolio.totalTokensHeld)}
          subValue="ERC-3643 Standard"
          icon={<Sparkles className="w-5 h-5 text-purple-400" />}
          iconColor="bg-purple-500/10 border-purple-500/30"
        />

        <StatCard
          label="Total Net Return"
          value={formatCurrency(portfolio.netGain)}
          trend={{
            value: `+${formatPercent(portfolio.overallReturnPercent)} Total`,
            isPositive: portfolio.netGain >= 0,
          }}
          icon={<TrendingUp className="w-5 h-5 text-emerald-400" />}
          iconColor="bg-emerald-500/10 border-emerald-500/30"
        />
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Performance Area Chart */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-[#151D30] border border-[#1E293B] shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-white font-display">
                Portfolio Valuation Performance
              </h3>
              <p className="text-xs text-gray-400">Monthly capital appreciation trajectory</p>
            </div>
            <span className="text-xs text-cyan-400 font-mono font-semibold">
              Current: {formatCurrency(portfolio.totalPortfolioValue)}
            </span>
          </div>
          <PortfolioPerformanceChart currentValue={portfolio.totalPortfolioValue} />
        </div>

        {/* Asset Allocation Donut Chart */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-[#151D30] border border-[#1E293B] shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-white font-display">
              Asset Allocation Breakdown
            </h3>
            <span className="text-xs text-gray-400">By Sector</span>
          </div>
          <AssetAllocationChart data={allocationData} />
        </div>
      </div>

      {/* HOLDINGS TABLE */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold font-display text-white">
              My Real World Asset Holdings
            </h2>
            <p className="text-xs text-gray-400">
              Active fractional security tokens held under your custody
            </p>
          </div>
          <Link
            to="/investor/investments"
            className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
          >
            Manage Holdings →
          </Link>
        </div>

        <HoldingsTable
          holdings={portfolio.holdings}
          onInvestMore={(asset) => openInvestModal(asset)}
        />
      </div>

      {/* RECENT TRANSACTIONS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold font-display text-white">
              Recent On-Chain Activity
            </h2>
            <p className="text-xs text-gray-400">
              Purchases, simulated mints, and settlement records
            </p>
          </div>
          <Link
            to="/investor/transactions"
            className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
          >
            Full Ledger →
          </Link>
        </div>

        <RecentTransactionsTable transactions={transactions} limit={5} />
      </div>
    </div>
  );
};
