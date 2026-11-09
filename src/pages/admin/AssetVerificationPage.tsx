import React, { useState } from 'react';
import { MockAssetService } from '../../services/mockAssetService';
import type { Asset } from '../../types';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  Building,
  Eye,
  MessageSquare,
  AlertTriangle,
} from 'lucide-react';
import { Modal } from '../../components/common/Modal';

export const AssetVerificationPage: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>(() => MockAssetService.getAssets());
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [reviewComments, setReviewComments] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');

  const { showSuccess, showError, showInfo } = useToast();

  const reloadAssets = () => {
    setAssets([...MockAssetService.getAssets()]);
  };

  const handleOpenReview = (asset: Asset, action: 'approve' | 'reject') => {
    setSelectedAsset(asset);
    setActionType(action);
    setReviewComments(asset.reviewComments || 'Institutional legal due diligence and appraisal verified.');
    setRejectionReason(asset.rejectionReason || 'Incomplete encumbrance certificates or valuation discrepancy.');
    setIsReviewModalOpen(true);
  };

  const handleConfirmAction = () => {
    if (!selectedAsset) return;

    if (actionType === 'approve') {
      MockAssetService.updateAssetStatus(
        selectedAsset.id,
        'Approved',
        reviewComments
      );
      showSuccess(
        'Asset Approved & Listed!',
        `${selectedAsset.name} is now approved and visible in the public marketplace.`
      );
    } else {
      MockAssetService.updateAssetStatus(
        selectedAsset.id,
        'Rejected',
        reviewComments,
        rejectionReason
      );
      showInfo(
        'Asset Rejected',
        `${selectedAsset.name} has been marked as rejected with comments.`
      );
    }

    reloadAssets();
    setIsReviewModalOpen(false);
    setSelectedAsset(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-[#1E293B]">
        <h1 className="text-2xl font-bold font-display text-white">
          Asset Verification & Due Diligence
        </h1>
        <p className="text-xs text-gray-400">
          Review legal SPV documentation, audit appraisals, and approve tokenized offerings into the public marketplace
        </p>
      </div>

      {/* Assets verification list */}
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
              className={`p-6 rounded-2xl bg-[#151D30] border transition-all shadow-xl space-y-4 ${
                isPending ? 'border-amber-500/40 bg-[#161D32]' : 'border-[#1E293B]'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={asset.images[0]}
                    alt={asset.name}
                    className="w-16 h-16 rounded-xl object-cover border border-[#22304E] shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
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

                {/* Status & Action Buttons */}
                <div className="flex items-center gap-3 shrink-0 flex-wrap">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                      isApproved
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : isPending
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    }`}
                  >
                    {isApproved && <CheckCircle2 className="w-3.5 h-3.5" />}
                    {isPending && <Clock className="w-3.5 h-3.5" />}
                    {isRejected && <XCircle className="w-3.5 h-3.5" />}
                    <span>{asset.verificationStatus}</span>
                  </span>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenReview(asset, 'approve')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        isApproved
                          ? 'bg-[#0F1626] border border-[#22304E] text-gray-400 hover:text-white'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isApproved ? 'Re-Approve' : 'Approve'}</span>
                    </button>

                    <button
                      onClick={() => handleOpenReview(asset, 'reject')}
                      className="px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-semibold transition-all flex items-center gap-1.5"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Economic Overview */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-[#0F1626] border border-[#1E293B] text-xs">
                <div>
                  <span className="text-gray-400 block text-[11px]">Proposed Valuation</span>
                  <span className="font-bold text-white font-display">
                    {formatCurrency(asset.totalValuation)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">Token Price</span>
                  <span className="font-mono text-cyan-300 font-bold">${asset.tokenPrice}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">Total Supply</span>
                  <span className="font-mono text-white">
                    {formatNumber(asset.totalTokenSupply)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">SPV Legal Entity</span>
                  <span className="text-white truncate block">{asset.ownership.entityName}</span>
                </div>
              </div>

              {/* Uploaded Documents Preview */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                  Attached Compliance Documents ({asset.documents.length})
                </span>
                <div className="flex flex-wrap gap-2">
                  {asset.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0F1626] border border-[#1E293B] text-xs text-gray-300"
                    >
                      <FileText className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="truncate max-w-[200px]">{doc.name}</span>
                      <span className="text-[10px] text-gray-500 font-mono">({doc.size})</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Comments Note if existing */}
              {asset.reviewComments && (
                <div className="p-3 rounded-xl bg-blue-900/10 border border-blue-500/20 text-xs text-blue-200">
                  <span className="font-semibold text-cyan-300">Auditor Notes: </span>
                  <span>{asset.reviewComments}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Approve / Reject Modal Dialog */}
      <Modal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        title={
          <div className="flex items-center gap-2">
            {actionType === 'approve' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-400" />
            )}
            <h3 className="text-base font-semibold text-white font-display">
              {actionType === 'approve' ? 'Approve Asset for Public Listing' : 'Reject Asset Submission'}
            </h3>
          </div>
        }
        maxWidth="md"
      >
        {selectedAsset && (
          <div className="space-y-4">
            <p className="text-xs text-gray-300">
              Target Asset: <strong>{selectedAsset.name}</strong> ({selectedAsset.category})
            </p>

            {actionType === 'approve' ? (
              <div className="space-y-3">
                <label className="text-xs font-semibold text-gray-300 block">
                  Auditor Verification Approval Comments
                </label>
                <textarea
                  rows={3}
                  value={reviewComments}
                  onChange={(e) => setReviewComments(e.target.value)}
                  className="w-full bg-[#0F1626] border border-[#22304E] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
                <p className="text-[11px] text-emerald-400">
                  Approving this asset sets its verification status to "Approved" and immediately publishes it to the marketplace for public investors.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <label className="text-xs font-semibold text-gray-300 block">
                  Rejection Reason (Feedback for Issuer) *
                </label>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full bg-[#0F1626] border border-[#22304E] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-rose-400"
                />
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="w-1/3 py-2.5 rounded-xl border border-[#22304E] text-xs font-semibold text-gray-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                className={`w-2/3 py-2.5 rounded-xl text-xs font-semibold text-white shadow-lg transition-all ${
                  actionType === 'approve'
                    ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/25'
                    : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/25'
                }`}
              >
                {actionType === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
