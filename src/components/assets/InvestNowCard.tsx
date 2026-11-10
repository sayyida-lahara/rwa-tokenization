import React, { useState } from 'react';
import type { Asset } from '../../types';
import { useInvestment } from '../../context/InvestmentContext';
import { useWallet } from '../../context/WalletContext';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import { ProgressBar } from '../common/ProgressBar';
import { ShieldCheck, Plus, Minus, Zap, Info } from 'lucide-react';

interface InvestNowCardProps {
  asset: Asset;
}

export const InvestNowCard: React.FC<InvestNowCardProps> = ({ asset }) => {
  const { openInvestModal } = useInvestment();
  const { wallet, openWalletModal } = useWallet();

  const minTokens = Math.ceil(asset.minimumInvestment / asset.tokenPrice);
  const [quantity, setQuantity] = useState<number>(Math.max(1, minTokens));

  const subtotal = quantity * asset.tokenPrice;
  const protocolFee = Math.round(subtotal * 0.005 * 100) / 100;
  const total = subtotal + protocolFee;

  const isBelowMin = subtotal < asset.minimumInvestment;
  const isSoldOut = asset.availableTokens === 0;

  return (
    <div className="bg-[#151D30] border border-[#1E293B] rounded-2xl p-6 shadow-2xl sticky top-24 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#1E293B]">
        <div>
          <span className="text-xs text-gray-400 block">Token Price</span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-2xl font-bold font-display text-white">${asset.tokenPrice}</span>
            <span className="text-xs text-cyan-400 font-mono">USDC / Token</span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs text-gray-400 block">Total Supply</span>
          <span className="text-lg font-bold font-display text-white">
            {formatNumber(asset.totalTokenSupply)}
          </span>
        </div>
      </div>

      {/* Progress & Availability */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-400">
            Available Supply:{' '}
            <strong className="text-white font-mono">{formatNumber(asset.availableTokens)}</strong>
          </span>
          <span className="text-cyan-400 font-semibold">{asset.fundingProgress}%</span>
        </div>
        <ProgressBar progress={asset.fundingProgress} size="md" />
        <p className="text-[11px] text-gray-500">
          Minimum Investment: ${asset.minimumInvestment} ({minTokens} tokens)
        </p>
      </div>

      {/* Interactive Token Quantity Selector */}
      {!isSoldOut && (
        <div className="space-y-3 pt-2">
          <label className="text-xs font-semibold text-gray-300 block">Quantity to Acquire</label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              className="w-10 h-10 rounded-xl bg-[#0F1626] border border-[#22304E] text-white flex items-center justify-center font-bold hover:bg-[#1A2338] transition-colors disabled:opacity-30"
            >
              <Minus className="w-4 h-4" />
            </button>
            <input
              type="number"
              min={1}
              max={asset.availableTokens}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="flex-1 h-10 bg-[#0F1626] border border-[#22304E] rounded-xl px-3 text-center text-white font-display font-bold text-base focus:outline-none focus:border-cyan-400"
            />
            <button
              onClick={() => setQuantity((q) => Math.min(asset.availableTokens, q + 1))}
              disabled={quantity >= asset.availableTokens}
              className="w-10 h-10 rounded-xl bg-[#0F1626] border border-[#22304E] text-white flex items-center justify-center font-bold hover:bg-[#1A2338] transition-colors disabled:opacity-30"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Presets */}
          <div className="grid grid-cols-4 gap-1.5">
            {[minTokens, 20, 50, 100].map((preset) => (
              <button
                key={preset}
                onClick={() => setQuantity(preset)}
                className="py-1 text-[11px] font-mono rounded-lg bg-[#0F1626] border border-[#1E293B] text-gray-300 hover:text-white hover:border-[#2C3B5A] transition-colors"
              >
                {preset}
              </button>
            ))}
          </div>

          {/* Live Investment Calculation Box */}
          <div className="p-3.5 rounded-xl bg-[#0F1626] border border-[#1E293B] space-y-2 text-xs">
            <div className="flex justify-between text-gray-400">
              <span>Token Subtotal</span>
              <span className="text-white font-medium">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Protocol Fee (0.5%)</span>
              <span className="text-white font-medium">{formatCurrency(protocolFee)}</span>
            </div>
            <div className="h-[1px] bg-[#1E293B]" />
            <div className="flex justify-between font-semibold">
              <span className="text-gray-200">Total Investment</span>
              <span className="text-cyan-400 text-sm font-bold font-display">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Invest CTA */}
      <div>
        {!wallet.isConnected ? (
          <button
            onClick={openWalletModal}
            className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4" />
            <span>Connect Wallet to Invest</span>
          </button>
        ) : isSoldOut ? (
          <button
            disabled
            className="w-full py-3.5 rounded-xl bg-slate-800 text-gray-500 font-semibold text-sm cursor-not-allowed"
          >
            Asset Fully Funded
          </button>
        ) : (
          <button
            onClick={() => openInvestModal(asset)}
            disabled={isBelowMin}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-400 hover:opacity-95 text-white font-bold text-sm transition-all shadow-xl shadow-cyan-500/25 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
          >
            Invest {formatCurrency(total)}
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 text-[11px] text-gray-400 bg-[#0F1626]/60 p-2.5 rounded-xl border border-[#1E293B]">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>Institutional custody via Apex Trust. Sample demo simulation.</span>
      </div>
    </div>
  );
};
