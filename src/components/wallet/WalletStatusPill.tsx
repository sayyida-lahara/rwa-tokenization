import React from 'react';
import { useWallet } from '../../context/WalletContext';
import { Wallet, ChevronDown } from 'lucide-react';
import { formatCurrency, shortenAddress } from '../../utils/formatters';

export const WalletStatusPill: React.FC = () => {
  const { wallet, openWalletModal } = useWallet();

  if (!wallet.isConnected) {
    return (
      <button
        onClick={openWalletModal}
        className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold text-xs shadow-lg shadow-cyan-500/20 transition-all active:scale-[0.98] border border-cyan-400/30"
      >
        <Wallet className="w-3.5 h-3.5" />
        <span>Connect Solana Wallet</span>
      </button>
    );
  }

  return (
    <button
      onClick={openWalletModal}
      className="flex items-center gap-2 p-1 pl-2.5 pr-2 rounded-xl bg-[#151D30] hover:bg-[#1C2640] border border-[#22304E] hover:border-cyan-500/40 text-xs transition-all shadow-md group"
      title={`Connected on Solana ${wallet.cluster.toUpperCase()} with ${wallet.balanceSOL.toFixed(2)} SOL`}
    >
      {/* Cluster indicator pill */}
      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase font-semibold">
        {wallet.cluster === 'testnet' ? 'Testnet' : wallet.cluster}
      </span>

      <div className="flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span className="font-semibold text-white group-hover:text-cyan-300 transition-colors">
          {formatCurrency(wallet.balanceUSDC, true)}
        </span>
      </div>

      <div className="h-4 w-[1px] bg-[#2A3854]" />

      <div className="flex items-center gap-1 text-gray-300 font-mono text-[11px] bg-[#0F1626] px-2 py-0.5 rounded-lg border border-[#1E293B]">
        <span>{shortenAddress(wallet.address, 3)}</span>
        <ChevronDown className="w-3 h-3 text-gray-400 group-hover:text-white transition-colors" />
      </div>
    </button>
  );
};
