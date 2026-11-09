import React from 'react';
import { Link } from 'react-router';
import { MockAssetService } from '../../services/mockAssetService';
import { useAuth } from '../../context/AuthContext';
import { StatCard } from '../../components/dashboard/StatCard';
import { formatCurrency, formatNumber, formatDate } from '../../utils/formatters';
import {
  Building2,
  CheckCircle2,
  Clock,
  XCircle,
  PlusCircle,
  ArrowRight,
  ShieldCheck,
  Eye,
} from 'lucide-react';

export const IssuerDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const allAssets = MockAssetService.getAssets();

  // Filter assets associated with issuer or show all submitted
  const submittedAssets = allAssets;

  const approvedCount = submittedAssets.filter((a) => a.verificationStatus === 'Approved').length;
  const pendingCount = submittedAssets.filter(
    (a) => a.verificationStatus === 'Pending Verification' || a.verificationStatus === 'Under Review'
  ).length;
  const rejectedCount = submittedAssets.filter((a) => a.verificationStatus === 'Rejected').length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1E293B]">
        <div>
          <h1 className="text-2xl font-bold font-display text-white">Asset Issuer Console</h1>
          <p className="text-xs text-gray-400">
            Submit real-world properties, manage tokenized offerings, and track regulatory approvals
          </p>
        </div>

        <Link
          to="/issuer/tokenize"
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-500 hover:opacity-95 text-white font-semibold text-xs shadow-lg shadow-emerald-500/20 transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Tokenize New Asset</span>
        </Link>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Submitted Assets"
          value={submittedAssets.length}
          subValue="Across all classifications"
          icon={<Building2 className="w-5 h-5 text-blue-400" />}
          iconColor="bg-blue-500/10 border-blue-500/30"
        />

        <StatCard
          label="Approved in Marketplace"
          value={approvedCount}
          subValue="Live fractional offerings"
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />}
          iconColor="bg-emerald-500/10 border-emerald-500/30"
        />

        <StatCard
          label="Pending Verification"
          value={pendingCount}
          subValue="Under compliance review"
          icon={<Clock className="w-5 h-5 text-amber-400" />}
          iconColor="bg-amber-500/10 border-amber-500/30"
        />

        <StatCard
          label="Rejected Submissions"
          value={rejectedCount}
          subValue="Audit revisions needed"
          icon={<XCircle className="w-5 h-5 text-rose-400" />}
          iconColor="bg-rose-500/10 border-rose-500/30"
        />
      </div>

      {/* ASSET MANAGEMENT TABLE */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold font-display text-white">
            Asset Submissions & Live Offerings
          </h2>
          <span className="text-xs text-gray-400">Showing {submittedAssets.length} assets</span>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-[#1E293B] bg-[#151D30]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0F1626] text-gray-400 border-b border-[#1E293B] uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Asset Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Submission Date</th>
                <th className="py-3 px-4">Total Valuation</th>
                <th className="py-3 px-4">Token Supply</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]/70">
              {submittedAssets.map((asset) => {
                const isApproved = asset.verificationStatus === 'Approved';
                const isPending =
                  asset.verificationStatus === 'Pending Verification' ||
                  asset.verificationStatus === 'Under Review';

                return (
                  <tr key={asset.id} className="hover:bg-[#1A243D] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={asset.images[0]}
                          alt={asset.name}
                          className="w-10 h-10 rounded-lg object-cover border border-[#22304E] shrink-0"
                        />
                        <div className="min-w-0">
                          <Link
                            to={`/asset/${asset.id}`}
                            className="font-semibold text-white hover:text-cyan-400 transition-colors truncate block"
                          >
                            {asset.name}
                          </Link>
                          <span className="text-[11px] text-gray-400">
                            {asset.location.city}, {asset.location.country}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-gray-300">
                      {asset.category}
                    </td>

                    <td className="py-3.5 px-4 text-gray-400 font-mono text-[11px]">
                      {asset.listingDate}
                    </td>

                    <td className="py-3.5 px-4 font-bold font-display text-white">
                      {formatCurrency(asset.totalValuation)}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-cyan-400">
                      {formatNumber(asset.totalTokenSupply)} (${asset.tokenPrice})
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          isApproved
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : isPending
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        }`}
                      >
                        {isApproved && <CheckCircle2 className="w-3 h-3" />}
                        {isPending && <Clock className="w-3 h-3" />}
                        <span>{asset.verificationStatus}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/asset/${asset.id}`}
                        className="inline-flex items-center gap-1 p-1.5 rounded-lg border border-[#283754] text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                        title="View Asset Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
