import React, { useState } from 'react';
import { useInvestment } from '../../context/InvestmentContext';
import { RecentTransactionsTable } from '../../components/dashboard/RecentTransactionsTable';
import { Download, History, FileSpreadsheet, ShieldCheck } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const TransactionHistoryPage: React.FC = () => {
  const { transactions } = useInvestment();
  const { showSuccess } = useToast();

  const handleExportCSV = () => {
    showSuccess('Exporting Ledger', 'Simulated transaction statement CSV exported to downloads.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1E293B]">
        <div>
          <h1 className="text-2xl font-bold font-display text-white">Transaction History</h1>
          <p className="text-xs text-gray-400">
            Immutable on-chain simulated audit ledger for purchases, transfers, and dividend payouts
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#151D30] hover:bg-[#1C2640] border border-[#22304E] text-xs font-semibold text-gray-200 hover:text-white transition-colors self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-cyan-400" />
          <span>Export CSV Ledger</span>
        </button>
      </div>

      {/* Main Ledger Table with built-in type & status filters */}
      <RecentTransactionsTable transactions={transactions} showFilters={true} />

      <div className="flex items-center gap-2 p-3 rounded-xl bg-[#0F1626] border border-[#1E293B] text-xs text-gray-400">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>
          Every transaction hash references a cryptographic proof verifiable on Polygon PoS explorer.
        </span>
      </div>
    </div>
  );
};
