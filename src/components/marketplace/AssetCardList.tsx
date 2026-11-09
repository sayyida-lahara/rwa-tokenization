import React from 'react';
import { Link } from 'react-router';
import type { Asset } from '../../types';
import { Heart, MapPin, ShieldCheck, TrendingUp } from 'lucide-react';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import { ProgressBar } from '../common/ProgressBar';
import { useWatchlist } from '../../context/WatchlistContext';
import { useInvestment } from '../../context/InvestmentContext';

interface AssetCardListProps {
  asset: Asset;
}

export const AssetCardList: React.FC<AssetCardListProps> = ({ asset }) => {
  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  const { openInvestModal } = useInvestment();
  const isSaved = isInWatchlist(asset.id);

  return (
    <div className="bg-[#151D30] hover:bg-[#1A243D] border border-[#1E293B] hover:border-[#2A3C60] rounded-2xl p-4 transition-all duration-200 flex flex-col md:flex-row items-center gap-5">
      {/* Thumbnail */}
      <Link
        to={`/asset/${asset.id}`}
        className="w-full md:w-48 h-36 md:h-28 rounded-xl overflow-hidden shrink-0 relative bg-slate-900 block"
      >
        <img
          src={asset.images[0]}
          alt={asset.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 text-[10px] text-cyan-300 font-medium">
          {asset.category}
        </div>
      </Link>

      {/* Main Info */}
      <div className="flex-1 min-w-0 space-y-1.5 w-full">
        <div className="flex items-center gap-2">
          {asset.verificationStatus === 'Approved' && (
            <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <ShieldCheck className="w-3 h-3" />
              Verified
            </span>
          )}
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {asset.location.city}, {asset.location.country} {asset.location.flag}
          </span>
        </div>

        <Link to={`/asset/${asset.id}`}>
          <h3 className="font-display font-semibold text-white hover:text-cyan-300 text-base transition-colors truncate">
            {asset.name}
          </h3>
        </Link>
        <p className="text-xs text-gray-400 line-clamp-1">{asset.tagLine}</p>

        {/* Progress Bar in list view */}
        <div className="max-w-md pt-1">
          <div className="flex justify-between text-[11px] text-gray-400 mb-1">
            <span>{formatNumber(asset.availableTokens)} tokens remaining</span>
            <span className="text-cyan-400 font-semibold">{asset.fundingProgress}% funded</span>
          </div>
          <ProgressBar progress={asset.fundingProgress} size="sm" />
        </div>
      </div>

      {/* Financial Numbers */}
      <div className="flex items-center gap-6 shrink-0 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-[#1E293B] pt-3 md:pt-0">
        <div className="text-left md:text-right">
          <span className="text-[11px] text-gray-400 block">Valuation</span>
          <span className="text-sm font-semibold text-white font-display">
            {formatCurrency(asset.totalValuation, true)}
          </span>
        </div>

        <div className="text-left md:text-right">
          <span className="text-[11px] text-gray-400 block">Token Price</span>
          <span className="text-sm font-bold text-cyan-400 font-display">
            ${asset.tokenPrice}
          </span>
        </div>

        <div className="text-left md:text-right">
          <span className="text-[11px] text-gray-400 block">Yield</span>
          <span className="text-sm font-bold text-emerald-400 font-display flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            {asset.expectedYield}%
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleWatchlist(asset.id)}
            className={`p-2.5 rounded-xl border transition-colors ${
              isSaved
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                : 'bg-[#0F1626] border-[#1E293B] text-gray-400 hover:text-white'
            }`}
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-400' : ''}`} />
          </button>
          <button
            onClick={() => openInvestModal(asset)}
            disabled={asset.availableTokens === 0}
            className="py-2 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-semibold shadow-md shadow-cyan-500/20 disabled:opacity-40"
          >
            Invest
          </button>
        </div>
      </div>
    </div>
  );
};
