import React from 'react';
import { Link } from 'react-router';
import type { Asset } from '../../types';
import { Heart, MapPin, ShieldCheck, TrendingUp, DollarSign } from 'lucide-react';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import { ProgressBar } from '../common/ProgressBar';
import { useWatchlist } from '../../context/WatchlistContext';
import { useInvestment } from '../../context/InvestmentContext';

interface AssetCardProps {
  asset: Asset;
}

export const AssetCard: React.FC<AssetCardProps> = ({ asset }) => {
  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  const { openInvestModal } = useInvestment();
  const isSaved = isInWatchlist(asset.id);

  const handleWatchlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWatchlist(asset.id);
  };

  const handleInvestClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openInvestModal(asset);
  };

  return (
    <div className="group relative bg-[#151D30] hover:bg-[#1A243D] border border-[#1E293B] hover:border-[#2A3C60] rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-950/20 flex flex-col h-full">
      {/* Image Container with Badges */}
      <Link to={`/asset/${asset.id}`} className="block relative aspect-[16/10] overflow-hidden bg-slate-900">
        <img
          src={asset.images[0]}
          alt={asset.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Subtle Dark Gradient Overlay for Contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#151D30] via-transparent to-black/30 opacity-80" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-1.5 flex-wrap pointer-events-auto">
            <span className="px-2.5 py-1 text-[11px] font-semibold bg-[#0B1020]/80 backdrop-blur-md text-cyan-300 border border-cyan-500/30 rounded-lg shadow-sm">
              {asset.category}
            </span>
            {asset.verificationStatus === 'Approved' && (
              <span className="px-2 py-1 text-[11px] font-semibold bg-emerald-950/80 backdrop-blur-md text-emerald-400 border border-emerald-500/40 rounded-lg flex items-center gap-1 shadow-sm">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>Verified</span>
              </span>
            )}
          </div>

          {/* Watchlist Heart Button */}
          <button
            onClick={handleWatchlistClick}
            aria-label={isSaved ? 'Remove from watchlist' : 'Add to watchlist'}
            className={`pointer-events-auto p-2 rounded-xl backdrop-blur-md border transition-all ${
              isSaved
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                : 'bg-[#0B1020]/60 border-[#2A3854] text-gray-300 hover:text-white hover:bg-[#0B1020]/90'
            }`}
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-400' : ''}`} />
          </button>
        </div>

        {/* Floating Yield Badge */}
        <div className="absolute bottom-3 right-3 pointer-events-auto">
          <div className="px-2.5 py-1 rounded-lg bg-emerald-500/20 backdrop-blur-md border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1 shadow-md">
            <TrendingUp className="w-3 h-3" />
            <span>{asset.expectedYield}% APY</span>
          </div>
        </div>
      </Link>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
        {/* Title & Location */}
        <div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
            <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="truncate">{asset.location.city}, {asset.location.country}</span>
            <span className="text-xs">{asset.location.flag}</span>
          </div>

          <Link to={`/asset/${asset.id}`}>
            <h3 className="font-display font-semibold text-white group-hover:text-cyan-300 text-base leading-snug line-clamp-1 transition-colors">
              {asset.name}
            </h3>
          </Link>
          <p className="text-xs text-gray-400 line-clamp-1 mt-1 leading-relaxed">
            {asset.tagLine}
          </p>
        </div>

        {/* Financial Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-[#0F1626] border border-[#1E293B] text-xs">
          <div>
            <span className="text-gray-400 text-[11px] block">Total Valuation</span>
            <span className="font-semibold text-white font-display text-sm">
              {formatCurrency(asset.totalValuation, true)}
            </span>
          </div>
          <div className="text-right">
            <span className="text-gray-400 text-[11px] block">Token Price</span>
            <span className="font-semibold text-cyan-400 font-display text-sm">
              ${asset.tokenPrice}
            </span>
          </div>
        </div>

        {/* Funding Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-gray-400">
              Supply: <span className="text-gray-300">{formatNumber(asset.availableTokens)} left</span>
            </span>
            <span className="text-cyan-400 font-semibold">{asset.fundingProgress}% funded</span>
          </div>
          <ProgressBar progress={asset.fundingProgress} size="sm" />
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <Link
            to={`/asset/${asset.id}`}
            className="py-2 px-3 rounded-xl border border-[#283754] hover:border-cyan-500/40 text-xs font-semibold text-gray-200 hover:text-white text-center transition-colors bg-[#131B2E] hover:bg-[#19243E]"
          >
            Details
          </Link>
          <button
            onClick={handleInvestClick}
            disabled={asset.availableTokens === 0}
            className="py-2 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-semibold transition-all shadow-md shadow-cyan-500/20 disabled:opacity-40 disabled:pointer-events-none active:scale-[0.98]"
          >
            {asset.availableTokens === 0 ? 'Sold Out' : 'Invest'}
          </button>
        </div>
      </div>
    </div>
  );
};
