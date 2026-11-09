import React, { useState } from 'react';
import { useParams, Link } from 'react-router';
import { MockAssetService } from '../../services/mockAssetService';
import { ImageGallery } from '../../components/assets/ImageGallery';
import { InvestNowCard } from '../../components/assets/InvestNowCard';
import { FinancialBreakdown } from '../../components/assets/FinancialBreakdown';
import { PropertySpecs } from '../../components/assets/PropertySpecs';
import { LegalDocsList } from '../../components/assets/LegalDocsList';
import { BlockchainDetails } from '../../components/assets/BlockchainDetails';
import { ValuationHistoryChart } from '../../components/charts/ValuationHistoryChart';
import { TokenDistributionChart } from '../../components/charts/TokenDistributionChart';
import { RecentTransactionsTable } from '../../components/dashboard/RecentTransactionsTable';
import { ShareModal } from '../../components/modals/ShareModal';
import { SolanaProgramInspector } from '../../components/common/SolanaProgramInspector';
import { useWatchlist } from '../../context/WatchlistContext';
import { useInvestment } from '../../context/InvestmentContext';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import {
  Heart,
  Share2,
  MapPin,
  ShieldCheck,
  TrendingUp,
  Building,
  CheckCircle2,
  Calendar,
  Layers,
  ChevronLeft,
} from 'lucide-react';

export const AssetDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const asset = MockAssetService.getAssetById(id || 'asset-1');

  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  const { transactions } = useInvestment();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'financials' | 'specs' | 'legal' | 'blockchain' | 'activity'>('overview');

  if (!asset) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold font-display text-white">Asset Not Found</h2>
        <p className="text-xs text-gray-400">
          The requested tokenized asset could not be located in our verified asset registry.
        </p>
        <Link
          to="/explore"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Marketplace</span>
        </Link>
      </div>
    );
  }

  const isSaved = isInWatchlist(asset.id);

  // Filter transactions related to this asset
  const assetTransactions = transactions.filter((t) => t.assetId === asset.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <Link to="/explore" className="hover:text-cyan-400 transition-colors flex items-center gap-1">
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Marketplace</span>
        </Link>
        <span>/</span>
        <span className="text-gray-500">{asset.category}</span>
        <span>/</span>
        <span className="text-white font-medium truncate max-w-[200px]">{asset.name}</span>
      </div>

      {/* TOP SECTION: TITLE, BADGES, AND ACTION BUTTONS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1E293B]">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-500/15 text-cyan-300 border border-cyan-500/30">
              {asset.category} • {asset.subcategory}
            </span>
            {asset.verificationStatus === 'Approved' && (
              <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Asset</span>
              </span>
            )}
            <span className="text-xs text-gray-400 flex items-center gap-1 font-mono">
              <Calendar className="w-3 h-3" />
              Listed: {asset.listingDate}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-display text-white tracking-tight">
            {asset.name}
          </h1>

          <div className="flex items-center gap-2 text-xs text-gray-300">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span>{asset.location.address}, {asset.location.city}, {asset.location.state}, {asset.location.country} {asset.location.flag}</span>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => toggleWatchlist(asset.id)}
            className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs font-semibold transition-all ${
              isSaved
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                : 'bg-[#151D30] border-[#22304E] text-gray-300 hover:text-white hover:bg-[#1C2640]'
            }`}
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-400' : ''}`} />
            <span>{isSaved ? 'Saved' : 'Watchlist'}</span>
          </button>

          <button
            onClick={() => setIsShareModalOpen(true)}
            className="p-2.5 rounded-xl bg-[#151D30] hover:bg-[#1C2640] border border-[#22304E] text-gray-300 hover:text-white flex items-center gap-2 text-xs font-semibold transition-colors"
          >
            <Share2 className="w-4 h-4 text-cyan-400" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* KEY METRICS RIBBON */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 p-4 rounded-2xl bg-[#151D30] border border-[#1E293B] shadow-xl">
        <div className="p-2">
          <span className="text-[11px] text-gray-400 block">Total Valuation</span>
          <span className="text-base font-bold font-display text-white">
            {formatCurrency(asset.totalValuation, true)}
          </span>
        </div>
        <div className="p-2">
          <span className="text-[11px] text-gray-400 block">Token Price</span>
          <span className="text-base font-bold font-display text-cyan-400">
            ${asset.tokenPrice} USDC
          </span>
        </div>
        <div className="p-2">
          <span className="text-[11px] text-gray-400 block">Total Supply</span>
          <span className="text-base font-bold font-display text-white">
            {formatNumber(asset.totalTokenSupply)}
          </span>
        </div>
        <div className="p-2">
          <span className="text-[11px] text-gray-400 block">Available</span>
          <span className="text-base font-bold font-mono text-cyan-300">
            {formatNumber(asset.availableTokens)}
          </span>
        </div>
        <div className="p-2">
          <span className="text-[11px] text-gray-400 block">Min. Investment</span>
          <span className="text-base font-bold font-display text-white">
            ${asset.minimumInvestment}
          </span>
        </div>
        <div className="p-2">
          <span className="text-[11px] text-gray-400 block">Expected Yield</span>
          <span className="text-base font-bold font-display text-emerald-400 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            {asset.expectedYield}% APY
          </span>
        </div>
      </div>

      {/* MAIN TWO-COLUMN LAYOUT: GALLERY & DETAILS ON LEFT, STICKY INVEST PANEL ON RIGHT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 8 Columns */}
        <div className="lg:col-span-8 space-y-8">
          {/* Gallery */}
          <ImageGallery images={asset.images} name={asset.name} />

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-[#1E293B] overflow-x-auto no-scrollbar">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'financials', label: 'Financials & Yield' },
              { id: 'specs', label: 'Specifications' },
              { id: 'legal', label: 'Legal & Custody' },
              { id: 'blockchain', label: 'Blockchain' },
              { id: 'activity', label: 'Transactions' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-3 px-3 text-xs font-semibold whitespace-nowrap transition-colors relative ${
                  activeTab === tab.id
                    ? 'text-cyan-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <span>{tab.label}</span>
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(0,229,255,0.6)]" />
                )}
              </button>
            ))}
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Description */}
              <div className="p-6 rounded-2xl bg-[#151D30] border border-[#1E293B] space-y-3">
                <h3 className="text-base font-semibold text-white font-display">
                  Asset & Investment Summary
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  {asset.description}
                </p>

                {/* Key Highlights Bullet points */}
                <div className="pt-3 border-t border-[#1E293B] space-y-2">
                  <span className="text-xs font-semibold text-gray-200 block">
                    Investment Highlights
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {asset.highlights.map((h, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-gray-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Ownership & SPV Structure Card */}
              <div className="p-6 rounded-2xl bg-[#151D30] border border-[#1E293B] space-y-3">
                <h3 className="text-base font-semibold text-white font-display">
                  Ownership Structure & SPV Entity
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-[#0F1626] border border-[#1E293B]">
                    <span className="text-gray-400 block">Sponsor / Issuer</span>
                    <span className="text-white font-semibold">{asset.ownership.issuerName}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#0F1626] border border-[#1E293B]">
                    <span className="text-gray-400 block">SPV Holding Entity</span>
                    <span className="text-white font-semibold">{asset.ownership.entityName}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#0F1626] border border-[#1E293B]">
                    <span className="text-gray-400 block">Legal Structure</span>
                    <span className="text-white font-semibold">{asset.ownership.structure}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#0F1626] border border-[#1E293B]">
                    <span className="text-gray-400 block">Company Registration</span>
                    <span className="text-cyan-300 font-mono">{asset.ownership.registrationNumber}</span>
                  </div>
                </div>
                {asset.ownership.supportingInfo && (
                  <p className="text-xs text-gray-400 leading-relaxed pt-1">
                    {asset.ownership.supportingInfo}
                  </p>
                )}
              </div>

              {/* Valuation History Chart */}
              <div className="p-6 rounded-2xl bg-[#151D30] border border-[#1E293B] space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-white font-display">
                      Appraisal & Valuation History
                    </h3>
                    <p className="text-xs text-gray-400">RICS independent appraisal trajectory</p>
                  </div>
                  <span className="text-xs text-emerald-400 font-semibold font-mono">
                    +{asset.financialInfo.capitalAppreciationEstimate}% / yr Avg Growth
                  </span>
                </div>
                <ValuationHistoryChart data={asset.valuationHistory} />
              </div>

              {/* Token Distribution Pie Chart */}
              <div className="p-6 rounded-2xl bg-[#151D30] border border-[#1E293B] space-y-4">
                <h3 className="text-base font-semibold text-white font-display">
                  Token Distribution & Equity Cap Table
                </h3>
                <TokenDistributionChart data={asset.tokenDistribution} />
              </div>
            </div>
          )}

          {/* TAB 2: FINANCIALS */}
          {activeTab === 'financials' && (
            <div className="p-6 rounded-2xl bg-[#151D30] border border-[#1E293B]">
              <FinancialBreakdown
                financialInfo={asset.financialInfo}
                totalValuation={asset.totalValuation}
              />
            </div>
          )}

          {/* TAB 3: SPECIFICATIONS */}
          {activeTab === 'specs' && (
            <div className="p-6 rounded-2xl bg-[#151D30] border border-[#1E293B]">
              <PropertySpecs specifications={asset.specifications} />
            </div>
          )}

          {/* TAB 4: LEGAL */}
          {activeTab === 'legal' && (
            <div className="p-6 rounded-2xl bg-[#151D30] border border-[#1E293B]">
              <LegalDocsList documents={asset.documents} />
            </div>
          )}

          {/* TAB 5: BLOCKCHAIN */}
          {activeTab === 'blockchain' && (
            <div className="p-6 rounded-2xl bg-[#151D30] border border-[#1E293B]">
              <BlockchainDetails
                blockchainInfo={asset.blockchainInfo}
                onOpenInspector={() => setIsInspectorOpen(true)}
              />
            </div>
          )}

          {/* TAB 6: ACTIVITY */}
          {activeTab === 'activity' && (
            <div className="p-6 rounded-2xl bg-[#151D30] border border-[#1E293B] space-y-4">
              <h3 className="text-base font-semibold text-white font-display">
                On-Chain Token Transactions for this Asset
              </h3>
              <RecentTransactionsTable transactions={assetTransactions} />
            </div>
          )}
        </div>

        {/* Right 4 Columns: Sticky Invest Now Panel */}
        <div className="lg:col-span-4">
          <InvestNowCard asset={asset} />
        </div>
      </div>

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        asset={asset}
      />

      <SolanaProgramInspector
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
      />
    </div>
  );
};
