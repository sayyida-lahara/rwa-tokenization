import React from 'react';
import { Link } from 'react-router';
import type { Holding, Asset } from '../../types';
import { formatCurrency, formatNumber, formatPercent } from '../../utils/formatters';
import { TrendingUp, ArrowUpRight, ExternalLink } from 'lucide-react';

interface HoldingWithAsset extends Holding {
  asset?: Asset;
  currentValue: number;
  gainLoss: number;
  gainLossPercent: number;
}

interface HoldingsTableProps {
  holdings: HoldingWithAsset[];
  onInvestMore?: (asset: Asset) => void;
}

export const HoldingsTable: React.FC<HoldingsTableProps> = ({ holdings, onInvestMore }) => {
  if (holdings.length === 0) {
    return (
      <div className="p-8 text-center rounded-2xl bg-[#151D30] border border-[#1E293B] space-y-3">
        <p className="text-gray-400 text-sm">No tokenized real-world asset holdings yet.</p>
        <Link
          to="/explore"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
        >
          Explore Assets
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-[#1E293B] bg-[#151D30]">
      <table className="w-full text-left text-xs">
        <thead className="bg-[#0F1626] text-gray-400 border-b border-[#1E293B] uppercase tracking-wider text-[11px]">
          <tr>
            <th className="py-3 px-4">Asset</th>
            <th className="py-3 px-4">Tokens Held</th>
            <th className="py-3 px-4">Avg Buy Price</th>
            <th className="py-3 px-4">Invested</th>
            <th className="py-3 px-4">Current Value</th>
            <th className="py-3 px-4">Gain / Return</th>
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1E293B]/70">
          {holdings.map((h) => {
            const asset = h.asset;
            const isProfit = h.gainLoss >= 0;

            return (
              <tr key={h.assetId} className="hover:bg-[#1A243D] transition-colors">
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-3">
                    {asset?.images[0] ? (
                      <img
                        src={asset.images[0]}
                        alt={asset.name}
                        className="w-10 h-10 rounded-lg object-cover border border-[#22304E] shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-slate-800 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <Link
                        to={`/asset/${h.assetId}`}
                        className="font-semibold text-white hover:text-cyan-400 transition-colors truncate block"
                      >
                        {asset?.name || h.assetId}
                      </Link>
                      <span className="text-[11px] text-gray-400">
                        {asset?.category} • {asset?.location.city}
                      </span>
                    </div>
                  </div>
                </td>

                <td className="py-3.5 px-4 font-mono font-medium text-white">
                  {formatNumber(h.tokenQuantity)}
                  <span className="text-gray-400 text-[10px] block">
                    {asset?.blockchainInfo.tokenSymbol}
                  </span>
                </td>

                <td className="py-3.5 px-4 text-gray-300 font-mono">
                  ${h.averagePurchasePrice}
                </td>

                <td className="py-3.5 px-4 text-gray-300 font-mono">
                  {formatCurrency(h.totalInvested)}
                </td>

                <td className="py-3.5 px-4 font-bold font-display text-white">
                  {formatCurrency(h.currentValue)}
                </td>

                <td className="py-3.5 px-4 font-medium">
                  <span
                    className={`inline-flex items-center gap-1 font-semibold ${
                      isProfit ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {isProfit ? '+' : ''}
                    {formatPercent(h.gainLossPercent)}
                  </span>
                  <span className="text-[10px] text-gray-500 block">
                    {isProfit ? '+' : ''}
                    {formatCurrency(h.gainLoss)}
                  </span>
                </td>

                <td className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      to={`/asset/${h.assetId}`}
                      className="p-1.5 rounded-lg border border-[#283754] text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                      title="View Details"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                    {asset && onInvestMore && (
                      <button
                        onClick={() => onInvestMore(asset)}
                        className="py-1 px-2.5 rounded-lg bg-blue-600/20 hover:bg-blue-600 border border-blue-500/40 text-cyan-300 hover:text-white text-[11px] font-semibold transition-all"
                      >
                        Buy More
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
