import React from 'react';
import { Link } from 'react-router';
import { useInvestment } from '../../context/InvestmentContext';
import { formatCurrency, formatNumber, formatDate } from '../../utils/formatters';
import { Building, MapPin, TrendingUp, Calendar, ArrowUpRight, DollarSign } from 'lucide-react';
import { ProgressBar } from '../../components/common/ProgressBar';

export const MyInvestmentsPage: React.FC = () => {
  const { portfolio, openInvestModal } = useInvestment();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1E293B]">
        <div>
          <h1 className="text-2xl font-bold font-display text-white">My Investments</h1>
          <p className="text-xs text-gray-400">
            Portfolio of your active tokenized real-world property and commodity holdings
          </p>
        </div>

        <Link
          to="/explore"
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors self-start sm:self-auto"
        >
          Invest in New Asset
        </Link>
      </div>

      {portfolio.holdings.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#151D30] border border-[#1E293B] space-y-3">
          <Building className="w-10 h-10 text-gray-500 mx-auto" />
          <h3 className="text-base font-semibold text-white font-display">No Investments Yet</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            You currently hold zero fractional tokens. Explore prime commercial real estate, gold reserves, and solar farms.
          </p>
          <Link
            to="/explore"
            className="inline-flex px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold"
          >
            Explore Assets
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolio.holdings.map((h) => {
            const asset = h.asset;
            if (!asset) return null;

            const isGain = h.gainLoss >= 0;

            return (
              <div
                key={h.assetId}
                className="rounded-2xl bg-[#151D30] border border-[#1E293B] hover:border-[#2C3E63] overflow-hidden transition-all shadow-xl flex flex-col justify-between"
              >
                <div>
                  {/* Image banner */}
                  <Link
                    to={`/asset/${asset.id}`}
                    className="block relative aspect-[16/9] overflow-hidden bg-slate-900 group"
                  >
                    <img
                      src={asset.images[0]}
                      alt={asset.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 bg-[#0B1020]/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[11px] font-semibold text-cyan-300 border border-cyan-500/30">
                      {asset.category}
                    </div>
                    <div className="absolute top-3 right-3 bg-emerald-500/20 backdrop-blur-md px-2.5 py-1 rounded-lg text-emerald-300 text-xs font-bold border border-emerald-500/30 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      <span>{asset.expectedYield}% APY</span>
                    </div>
                  </Link>

                  {/* Card Details */}
                  <div className="p-5 space-y-4">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
                        <MapPin className="w-3 h-3 text-cyan-400" />
                        <span>{asset.location.city}, {asset.location.country} {asset.location.flag}</span>
                      </div>
                      <Link to={`/asset/${asset.id}`}>
                        <h3 className="font-display font-semibold text-white hover:text-cyan-300 transition-colors text-base line-clamp-1">
                          {asset.name}
                        </h3>
                      </Link>
                    </div>

                    {/* Holdings Metrics */}
                    <div className="p-3.5 rounded-xl bg-[#0F1626] border border-[#1E293B] space-y-2 text-xs">
                      <div className="flex justify-between items-center text-gray-400">
                        <span>Tokens Owned</span>
                        <span className="font-mono text-cyan-300 font-bold text-sm">
                          {formatNumber(h.tokenQuantity)} {asset.blockchainInfo.tokenSymbol}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-gray-400">
                        <span>Purchase Price</span>
                        <span className="text-white font-medium">${h.averagePurchasePrice} USDC</span>
                      </div>
                      <div className="flex justify-between items-center text-gray-400">
                        <span>Total Invested</span>
                        <span className="text-white font-medium">{formatCurrency(h.totalInvested)}</span>
                      </div>
                      <div className="h-[1px] bg-[#1E293B]" />
                      <div className="flex justify-between items-center font-semibold">
                        <span className="text-gray-300">Current Valuation</span>
                        <span className="text-white font-display text-sm">
                          {formatCurrency(h.currentValue)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-gray-400">Net Capital Gain</span>
                        <span className={isGain ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                          {isGain ? '+' : ''}{formatCurrency(h.gainLoss)} ({isGain ? '+' : ''}{h.gainLossPercent.toFixed(1)}%)
                        </span>
                      </div>
                    </div>

                    {/* Next dividend payout notice */}
                    <div className="flex items-center justify-between text-[11px] text-gray-400 px-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-purple-400" />
                        Next Payout:
                      </span>
                      <span className="text-purple-300 font-medium">
                        {asset.financialInfo.nextDistributionDate} ({asset.financialInfo.dividendFrequency})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="p-4 border-t border-[#1E293B] bg-[#0F1626]/40 flex gap-2">
                  <Link
                    to={`/asset/${asset.id}`}
                    className="flex-1 py-2 text-center rounded-xl border border-[#22304E] hover:border-cyan-400 text-xs font-semibold text-gray-300 hover:text-white transition-colors"
                  >
                    View Details
                  </Link>
                  <button
                    onClick={() => openInvestModal(asset)}
                    className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors shadow-md shadow-blue-600/20"
                  >
                    Invest More
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
