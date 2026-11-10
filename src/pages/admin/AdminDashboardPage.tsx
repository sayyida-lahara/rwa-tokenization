import React from 'react';
import { Link } from 'react-router';
import { useData } from '../../context/DataContext';
import { StatCard } from '../../components/dashboard/StatCard';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import {
  Users,
  Building,
  ShieldCheck,
  Coins,
  Layers,
  ArrowRight,
  Clock,
  AlertCircle,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { assets, users, marketplace } = useData();

  const pendingAssets = assets.filter(
    (a) => a.verificationStatus === 'Pending Verification' || a.verificationStatus === 'Under Review'
  );
  const approvedAssets = assets.filter((a) => a.verificationStatus === 'Approved');

  const totalTokens = assets.reduce((acc, a) => acc + a.totalTokenSupply, 0);
  const totalVolume = assets.reduce((acc, a) => acc + (a.totalValuation * a.fundingProgress) / 100, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1E293B]">
        <div>
          <h1 className="text-2xl font-bold font-display text-white">
            Admin Compliance Command
          </h1>
          <p className="text-xs text-gray-400">
            Institutional platform oversight, asset due diligence approval, and user compliance
          </p>
        </div>

        <Link
          to="/admin/verification"
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-lg shadow-purple-600/20 transition-all self-start sm:self-auto"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Review Pending Assets ({pendingAssets.length})</span>
        </Link>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          label="Total Registered Users"
          value={users.length}
          subValue="Across all 3 roles"
          icon={<Users className="w-5 h-5 text-blue-400" />}
          iconColor="bg-blue-500/10 border-blue-500/30"
        />

        <StatCard
          label="Total Listed Assets"
          value={approvedAssets.length}
          subValue="Active in marketplace"
          icon={<Building className="w-5 h-5 text-emerald-400" />}
          iconColor="bg-emerald-500/10 border-emerald-500/30"
        />

        <StatCard
          label="Pending Asset Approvals"
          value={pendingAssets.length}
          trend={{
            value: pendingAssets.length > 0 ? 'Action Required' : 'All Clear',
            isPositive: pendingAssets.length === 0,
          }}
          icon={<Clock className="w-5 h-5 text-amber-400" />}
          iconColor="bg-amber-500/10 border-amber-500/30"
        />

        <StatCard
          label="Total Token Supply"
          value={formatNumber(totalTokens)}
          subValue="Lahara Token-2022"
          icon={<Coins className="w-5 h-5 text-purple-400" />}
          iconColor="bg-purple-500/10 border-purple-500/30"
        />

        <StatCard
          label="Marketplace Volume"
          value={formatCurrency(totalVolume, true)}
          subValue="Simulated primary volume"
          icon={<Layers className="w-5 h-5 text-cyan-400" />}
          iconColor="bg-cyan-500/10 border-cyan-500/30"
        />
      </div>

      {/* PENDING APPROVALS ALERT BANNER */}
      {pendingAssets.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-white">
                {pendingAssets.length} Asset Submission(s) Awaiting Compliance Approval
              </h4>
              <p className="text-xs text-amber-300/80">
                Independent appraisal reports and SPV registration certificates are ready for verification.
              </p>
            </div>
          </div>
          <Link
            to="/admin/verification"
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shrink-0 self-start sm:self-auto"
          >
            Review Now
          </Link>
        </div>
      )}

      {/* QUICK OVERVIEW TABLES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick User Management Preview */}
        <div className="p-6 rounded-2xl bg-[#151D30] border border-[#1E293B] space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-white font-display">Recent Users</h3>
            <Link to="/admin/users" className="text-xs text-cyan-400 hover:underline">
              Manage Users →
            </Link>
          </div>

          <div className="space-y-2">
            {users.slice(0, 4).map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between p-3 rounded-xl bg-[#0F1626] border border-[#1E293B] text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <img
                    src={u.avatar}
                    alt={u.name}
                    className="w-8 h-8 rounded-lg object-cover border border-[#22304E]"
                  />
                  <div>
                    <p className="font-semibold text-white">{u.name}</p>
                    <p className="text-[10px] text-gray-400 font-mono">{u.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="uppercase text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-blue-500/10 text-cyan-300">
                    {u.role}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                      u.accountStatus === 'Active'
                        ? 'text-emerald-400 bg-emerald-500/10'
                        : 'text-amber-400 bg-amber-500/10'
                    }`}
                  >
                    {u.accountStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Marketplace Status */}
        <div className="p-6 rounded-2xl bg-[#151D30] border border-[#1E293B] space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-white font-display">
              Marketplace Parameters
            </h3>
            <Link to="/admin/marketplace" className="text-xs text-cyan-400 hover:underline">
              Configure →
            </Link>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-[#0F1626] border border-[#1E293B] flex justify-between items-center">
              <span className="text-gray-400">Protocol Transaction Fee</span>
              <span className="font-mono text-cyan-300 font-bold">
                {marketplace.feePercent.toFixed(2)}%
              </span>
            </div>
            <div className="p-3 rounded-xl bg-[#0F1626] border border-[#1E293B] flex justify-between items-center">
              <span className="text-gray-400">Primary Settlement Network</span>
              <span className="font-semibold text-purple-400">{marketplace.settlementNetwork}</span>
            </div>
            <div className="p-3 rounded-xl bg-[#0F1626] border border-[#1E293B] flex justify-between items-center">
              <span className="text-gray-400">KYC/AML Oracle Provider</span>
              <span className="font-semibold text-emerald-400 truncate max-w-[180px] text-right">
                {marketplace.oracleProvider}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-[#0F1626] border border-[#1E293B] flex justify-between items-center">
              <span className="text-gray-400">Trading State</span>
              <span
                className={`font-mono font-bold ${
                  marketplace.isTradingPaused ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {marketplace.isTradingPaused ? 'PAUSED' : 'ACTIVE'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
