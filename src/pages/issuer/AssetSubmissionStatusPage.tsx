import React from 'react';
import { Link } from 'react-router';
import { useData } from '../../context/DataContext';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import { Clock, CheckCircle2, XCircle, ShieldCheck, MessageSquare, ArrowRight } from 'lucide-react';

export const AssetSubmissionStatusPage: React.FC = () => {
  const { assets } = useData();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-[#1E293B]">
        <h1 className="text-2xl font-bold font-display text-white">
          Asset Submission Verification Status
        </h1>
        <p className="text-xs text-gray-400">
          Track stage-by-stage legal title audit, compliance verification, and public listing readiness
        </p>
      </div>

      <div className="space-y-4">
        {assets.map((asset) => {
          const isApproved = asset.verificationStatus === 'Approved';
          const isPending =
            asset.verificationStatus === 'Pending Verification' ||
            asset.verificationStatus === 'Under Review';
          const isRejected = asset.verificationStatus === 'Rejected';

          return (
            <div
              key={asset.id}
              className="p-6 rounded-2xl bg-[#151D30] border border-[#1E293B] hover:border-[#2C3E63] space-y-4 transition-all shadow-xl"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <img
                    src={asset.images[0]}
                    alt={asset.name}
                    className="w-14 h-14 rounded-xl object-cover border border-[#22304E] shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-display font-bold text-white text-base">
                        {asset.name}
                      </h3>
                      <span className="text-[10px] bg-cyan-500/10 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/20 font-mono">
                        {asset.category}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {asset.location.city}, {asset.location.country} • Listed {asset.listingDate}
                    </p>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="shrink-0">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                      isApproved
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : isPending
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    }`}
                  >
                    {isApproved && <CheckCircle2 className="w-3.5 h-3.5" />}
                    {isPending && <Clock className="w-3.5 h-3.5" />}
                    {isRejected && <XCircle className="w-3.5 h-3.5" />}
                    <span>{asset.verificationStatus}</span>
                  </span>
                </div>
              </div>

              {/* Economic & Custody Metadata */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-xl bg-[#0F1626] border border-[#1E293B] text-xs">
                <div>
                  <span className="text-gray-400 block text-[11px]">Proposed Valuation</span>
                  <span className="font-semibold text-white font-display">
                    {formatCurrency(asset.totalValuation)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">Token Price</span>
                  <span className="font-mono text-cyan-300 font-semibold">${asset.tokenPrice}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">Total Supply</span>
                  <span className="font-mono text-white">
                    {formatNumber(asset.totalTokenSupply)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">Minimum Ticket</span>
                  <span className="text-emerald-400 font-bold">${asset.minimumInvestment}</span>
                </div>
              </div>

              {/* Admin Comments / Rejection reason if any */}
              {asset.reviewComments && (
                <div className="p-3 rounded-xl bg-blue-900/10 border border-blue-500/20 text-xs text-blue-200 flex items-start gap-2">
                  <MessageSquare className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block text-cyan-300">Compliance Audit Review Notes:</span>
                    <p className="mt-0.5">{asset.reviewComments}</p>
                  </div>
                </div>
              )}

              {asset.rejectionReason && (
                <div className="p-3 rounded-xl bg-rose-900/10 border border-rose-500/20 text-xs text-rose-200 flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block text-rose-300">Rejection Reason:</span>
                    <p className="mt-0.5">{asset.rejectionReason}</p>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-1">
                <Link
                  to={`/asset/${asset.id}`}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
                >
                  <span>View Full Offering Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
