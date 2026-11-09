import React, { useState } from 'react';
import type { Transaction } from '../../types';
import { formatCurrency, formatDateTime, shortenAddress } from '../../utils/formatters';
import { Copy, Check, ArrowDownLeft, ArrowUpRight, DollarSign, ExternalLink } from 'lucide-react';
import { Link } from 'react-router';
import { SolanaAnchorService } from '../../services/solanaAnchorService';

interface RecentTransactionsTableProps {
  transactions: Transaction[];
  limit?: number;
  showFilters?: boolean;
}

export const RecentTransactionsTable: React.FC<RecentTransactionsTableProps> = ({
  transactions,
  limit,
  showFilters = false,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const filtered = transactions.filter((tx) => {
    if (selectedType !== 'all' && tx.type !== selectedType) return false;
    if (selectedStatus !== 'all' && tx.status !== selectedStatus) return false;
    return true;
  });

  const displayList = limit ? filtered.slice(0, limit) : filtered;

  const handleCopy = (hash: string, id: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-4">
      {showFilters && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#0F1626] border border-[#1E293B] rounded-xl text-xs">
          <div className="flex items-center gap-2">
            <span className="text-gray-400 font-medium">Type:</span>
            {['all', 'Purchase', 'Distribution', 'Sale'].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-2.5 py-1 rounded-lg capitalize font-medium transition-colors ${
                  selectedType === type
                    ? 'bg-blue-600/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-gray-400 font-medium">Status:</span>
            {['all', 'Completed', 'Pending', 'Failed'].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-2.5 py-1 rounded-lg capitalize font-medium transition-colors ${
                  selectedStatus === st
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      )}

      {displayList.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-[#151D30] border border-[#1E293B] text-gray-400 text-xs">
          No simulated transactions matching current filter criteria.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[#1E293B] bg-[#151D30]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0F1626] text-gray-400 border-b border-[#1E293B] uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Solana Tx Signature</th>
                <th className="py-3 px-4">Asset</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Tokens</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]/70">
              {displayList.map((tx) => {
                const isPurchase = tx.type === 'Purchase';
                const isDistribution = tx.type === 'Distribution';
                const cluster = tx.cluster || 'testnet';
                const sig = tx.signature || tx.txHash;

                return (
                  <tr key={tx.id} className="hover:bg-[#1A243D] transition-colors">
                    {/* Hash */}
                    <td className="py-3.5 px-4 font-mono">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopy(sig, tx.id)}
                          className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 transition-colors"
                          title="Copy Solana Signature"
                        >
                          <span>{shortenAddress(sig, 4)}</span>
                          {copiedId === tx.id ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3 text-gray-500 hover:text-gray-300" />
                          )}
                        </button>
                        <a
                          href={SolanaAnchorService.getExplorerUrl(sig, 'tx', cluster)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-gray-500 hover:text-cyan-300 transition-colors"
                          title={`View transaction on Solana Explorer (${cluster})`}
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                      <span className="text-[10px] text-purple-400/80 font-mono">
                        Solana {cluster}
                      </span>
                    </td>

                    {/* Asset */}
                    <td className="py-3.5 px-4">
                      <Link
                        to={`/asset/${tx.assetId}`}
                        className="font-medium text-white hover:text-cyan-400 transition-colors truncate block max-w-[200px]"
                      >
                        {tx.assetName}
                      </Link>
                    </td>

                    {/* Type */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                          isPurchase
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            : isDistribution
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                        }`}
                      >
                        {isPurchase && <ArrowUpRight className="w-3 h-3" />}
                        {isDistribution && <DollarSign className="w-3 h-3" />}
                        <span>{tx.type}</span>
                      </span>
                    </td>

                    {/* Tokens */}
                    <td className="py-3.5 px-4 font-mono font-medium text-white">
                      {tx.tokenQuantity > 0 ? `${tx.tokenQuantity} tokens` : '—'}
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 font-semibold font-display text-white">
                      {formatCurrency(tx.totalAmount)}
                    </td>

                    {/* Timestamp */}
                    <td className="py-3.5 px-4 text-gray-400 text-[11px]">
                      {formatDateTime(tx.timestamp)}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-right">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          tx.status === 'Completed'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : tx.status === 'Pending'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
