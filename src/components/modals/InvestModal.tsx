import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useInvestment } from '../../context/InvestmentContext';
import { useWallet } from '../../context/WalletContext';
import { useAuth } from '../../context/AuthContext';
import {
  formatCurrency,
  formatNumber,
  shortenAddress,
  getSolanaExplorerUrl,
} from '../../utils/formatters';
import { ShieldCheck, Plus, Minus, ArrowRight, CheckCircle2, AlertCircle, Copy, Check, ExternalLink, Zap } from 'lucide-react';
import { Link } from 'react-router';

export const InvestModal: React.FC = () => {
  const { selectedAssetForInvest, isInvestModalOpen, closeInvestModal, investInAsset } = useInvestment();
  const { wallet, openWalletModal } = useWallet();
  const { user } = useAuth();

  const [quantity, setQuantity] = useState<number>(10);
  const [step, setStep] = useState<'input' | 'confirm' | 'success'>('input');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedTxHash, setCompletedTxHash] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const asset = selectedAssetForInvest;

  // Initialize quantity to meet minimum investment
  useEffect(() => {
    if (asset) {
      const minTokens = Math.ceil(asset.minimumInvestment / asset.tokenPrice);
      setQuantity(Math.max(1, minTokens));
      setStep('input');
      setCompletedTxHash('');
    }
  }, [asset, isInvestModalOpen]);

  if (!asset) return null;

  const tokenPrice = asset.tokenPrice;
  const investmentAmount = quantity * tokenPrice;
  const protocolFee = Math.round(investmentAmount * 0.005 * 100) / 100; // 0.5%
  const totalAmount = investmentAmount + protocolFee;

  const minTokens = Math.ceil(asset.minimumInvestment / tokenPrice);
  const isBelowMin = investmentAmount < asset.minimumInvestment;
  const isAboveAvailable = quantity > asset.availableTokens;
  const hasInsufficientWalletBalance = wallet.isConnected && wallet.balanceUSDC < totalAmount;

  const handleIncrement = (amount: number = 1) => {
    setQuantity((prev) => Math.min(asset.availableTokens, prev + amount));
  };

  const handleDecrement = (amount: number = 1) => {
    setQuantity((prev) => Math.max(1, prev - amount));
  };

  const handleConfirmOrder = async () => {
    setIsSubmitting(true);
    const result = await investInAsset(asset.id, quantity);
    setIsSubmitting(false);
    if (result.success && result.txHash) {
      setCompletedTxHash(result.txHash);
      setStep('success');
    }
  };

  const copyTxHash = () => {
    if (completedTxHash) {
      navigator.clipboard.writeText(completedTxHash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Modal
      isOpen={isInvestModalOpen}
      onClose={closeInvestModal}
      title={
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
            $
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white font-display">
              {step === 'success' ? 'Simulated Order Complete' : `Invest in ${asset.name}`}
            </h3>
            <p className="text-xs text-gray-400">
              {step === 'success'
                ? 'Your simulated blockchain tokens have been credited'
                : 'Tokenized fractional ownership and instant settlement'}
            </p>
          </div>
        </div>
      }
      maxWidth="md"
    >
      {step === 'input' && (
        <div className="space-y-5">
          {/* Asset Summary Snippet */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[#0F1626] border border-[#1E293B]">
            <img
              src={asset.images[0]}
              alt={asset.name}
              className="w-12 h-12 rounded-lg object-cover border border-[#22304E] shrink-0"
            />
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-semibold text-white truncate">{asset.name}</h4>
              <p className="text-xs text-gray-400">{asset.location.city}, {asset.location.country}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[11px] text-cyan-400 font-medium">Token Price: ${asset.tokenPrice}</span>
              </div>
            </div>
          </div>

          {/* Token Quantity Input */}
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <label className="font-medium text-gray-300">Select Token Quantity</label>
              <span className="text-gray-400">
                Available:{' '}
                <span className="text-white font-medium">{formatNumber(asset.availableTokens)}</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleDecrement(5)}
                disabled={quantity <= 1}
                className="w-10 h-11 rounded-xl bg-[#0F1626] hover:bg-[#1C2640] border border-[#22304E] text-white flex items-center justify-center font-bold disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                -5
              </button>
              <button
                type="button"
                onClick={() => handleDecrement(1)}
                disabled={quantity <= 1}
                className="w-10 h-11 rounded-xl bg-[#0F1626] hover:bg-[#1C2640] border border-[#22304E] text-white flex items-center justify-center font-bold disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>

              <div className="flex-1 relative">
                <input
                  type="number"
                  min={1}
                  max={asset.availableTokens}
                  value={quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    setQuantity(isNaN(val) ? 0 : Math.max(0, val));
                  }}
                  className="w-full h-11 bg-[#0F1626] border border-[#22304E] rounded-xl px-4 text-center text-white font-display font-bold text-lg focus:outline-none focus:border-cyan-400 transition-colors"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-medium">
                  Tokens
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleIncrement(1)}
                disabled={quantity >= asset.availableTokens}
                className="w-10 h-11 rounded-xl bg-[#0F1626] hover:bg-[#1C2640] border border-[#22304E] text-white flex items-center justify-center font-bold disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleIncrement(5)}
                disabled={quantity >= asset.availableTokens}
                className="w-10 h-11 rounded-xl bg-[#0F1626] hover:bg-[#1C2640] border border-[#22304E] text-white flex items-center justify-center font-bold disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                +5
              </button>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-2 mt-2">
              {[minTokens, 25, 50, 100].map((preset) => {
                if (preset <= 0 || preset > asset.availableTokens) return null;
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setQuantity(preset)}
                    className="flex-1 py-1 text-xs rounded-lg bg-[#0F1626] hover:bg-[#1A243D] text-gray-300 border border-[#1E293B] hover:text-white transition-colors"
                  >
                    {preset === minTokens ? `Min (${preset})` : `${preset} tokens`}
                  </button>
                );
              })}
            </div>

            {/* Error warnings */}
            {isBelowMin && (
              <p className="text-xs text-amber-400 mt-2 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                Minimum investment is ${asset.minimumInvestment} ({minTokens} tokens).
              </p>
            )}
            {isAboveAvailable && (
              <p className="text-xs text-rose-400 mt-2 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                Requested tokens exceed available supply ({asset.availableTokens}).
              </p>
            )}
          </div>

          {/* Investment Calculation Breakdown */}
          <div className="p-4 rounded-xl bg-[#0F1626] border border-[#1E293B] space-y-2.5 text-xs">
            <div className="flex justify-between items-center text-gray-400">
              <span>Token Quantity</span>
              <span className="text-white font-medium">{formatNumber(quantity)} tokens</span>
            </div>
            <div className="flex justify-between items-center text-gray-400">
              <span>Token Price</span>
              <span className="text-white font-medium">${tokenPrice} USDC</span>
            </div>
            <div className="flex justify-between items-center text-gray-400">
              <span>Investment Subtotal</span>
              <span className="text-white font-medium">{formatCurrency(investmentAmount)}</span>
            </div>
            <div className="flex justify-between items-center text-gray-400">
              <span>Protocol Fee (0.5% mock)</span>
              <span className="text-white font-medium">{formatCurrency(protocolFee)}</span>
            </div>
            <div className="h-[1px] bg-[#1E293B] my-1" />
            <div className="flex justify-between items-center text-sm font-semibold">
              <span className="text-gray-200">Total Investment</span>
              <span className="text-cyan-400 font-display text-base font-bold">
                {formatCurrency(totalAmount)}
              </span>
            </div>
          </div>

          {/* Wallet Balance Status */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#151D30] border border-[#22304E] text-xs">
            <div className="text-gray-400">
              Your Wallet Balance:{' '}
              <span className="text-white font-semibold">
                {wallet.isConnected ? formatCurrency(wallet.balanceUSDC) : 'Not Connected'}
              </span>
            </div>
            {!wallet.isConnected ? (
              <button
                type="button"
                onClick={openWalletModal}
                className="text-cyan-400 hover:text-cyan-300 font-semibold underline"
              >
                Connect Wallet
              </button>
            ) : hasInsufficientWalletBalance ? (
              <span className="text-rose-400 font-medium">Insufficient Balance</span>
            ) : (
              <span className="text-emerald-400 font-medium flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Sufficient
              </span>
            )}
          </div>

          {/* Action button */}
          {!wallet.isConnected ? (
            <button
              type="button"
              onClick={openWalletModal}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-600/25"
            >
              Connect Wallet to Continue
            </button>
          ) : (
            <button
              type="button"
              disabled={isBelowMin || isAboveAvailable || hasInsufficientWalletBalance}
              onClick={() => setStep('confirm')}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold text-sm transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
            >
              <span>Review Investment</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <div className="flex items-center gap-2 text-[11px] text-gray-500">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>Simulated Web3 environment. No real funds or blockchain state modified.</span>
          </div>
        </div>
      )}

      {step === 'confirm' && (
        <div className="space-y-5">
          <div className="p-4 rounded-xl bg-[#0F1626] border border-cyan-500/30 space-y-3">
            <h4 className="text-sm font-semibold text-cyan-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Please Confirm Your Investment Order
            </h4>
            <p className="text-xs text-gray-300">
              You are authorizing the minting/allocation of {quantity} fractional security tokens
              in <strong>{asset.name}</strong>.
            </p>

            <div className="p-3 rounded-lg bg-[#151D30] border border-[#22304E] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Asset</span>
                <span className="text-white font-medium">{asset.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Token Symbol</span>
                <span className="font-mono text-cyan-300 font-bold">{asset.blockchainInfo.tokenSymbol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Tokens to Acquire</span>
                <span className="text-white font-semibold">{formatNumber(quantity)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Price per Token</span>
                <span className="text-white font-semibold">${tokenPrice} USDC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Protocol Settlement</span>
                <span className="text-purple-300 font-mono text-[11px]">
                  Solana Anchor ({wallet.cluster.toUpperCase()})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Network Gas Fee</span>
                <span className="text-cyan-400 font-mono text-[11px]">0.000005 SOL (~$0.0008)</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-[#22304E]">
                <span className="text-gray-400">Total Deducted</span>
                <span className="text-emerald-400 font-bold font-display text-sm">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Recipient Solana Address</span>
                <span className="font-mono text-gray-300">{shortenAddress(wallet.address || user.walletAddress, 4)}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep('input')}
              disabled={isSubmitting}
              className="w-1/3 py-2.5 rounded-xl border border-[#2A3854] text-gray-300 hover:text-white hover:bg-white/5 text-sm font-medium transition-colors"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleConfirmOrder}
              disabled={isSubmitting}
              className="w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-500 hover:from-emerald-500 hover:to-cyan-400 text-white font-semibold text-sm transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span>Executing Solana Anchor Instruction...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm On-Chain Investment</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {step === 'success' && (
        <div className="space-y-5 text-center py-2">
          <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <h4 className="text-xl font-bold text-white font-display">Solana Investment Confirmed!</h4>
            <p className="text-xs text-gray-400 mt-1">
              You now hold {quantity} tokens of {asset.name}. Anchor program instruction confirmed on Solana {wallet.cluster.toUpperCase()}.
            </p>
          </div>

          {/* Transaction Receipt Box */}
          <div className="p-4 rounded-xl bg-[#0F1626] border border-[#1E293B] text-left text-xs space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Solana Signature</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={copyTxHash}
                  className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 font-mono"
                  title="Copy signature"
                >
                  <span>{shortenAddress(completedTxHash, 5)}</span>
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
                <a
                  href={getSolanaExplorerUrl(completedTxHash, 'tx', wallet.cluster)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-gray-400 hover:text-white"
                  title="View on Solana Explorer"
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Anchor Instruction</span>
              <span className="text-cyan-300 font-mono">assetx_rwa::invest_tokens</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Network & Settlement</span>
              <span className="text-emerald-400 font-semibold">Confirmed (Solana {wallet.cluster.toUpperCase()})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Invested Capital</span>
              <span className="text-white font-medium">{formatCurrency(investmentAmount)} SPL-USDC</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Tokens Minted</span>
              <span className="text-cyan-400 font-medium">+{quantity} {asset.blockchainInfo.tokenSymbol}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Network Fee</span>
              <span className="text-gray-300 font-mono">0.000005 SOL</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <Link
              to="/investor/dashboard"
              onClick={closeInvestModal}
              className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold text-center transition-colors shadow-md"
            >
              View Investor Dashboard
            </Link>
            <button
              type="button"
              onClick={closeInvestModal}
              className="py-2.5 px-4 rounded-xl border border-[#2A3854] text-gray-300 hover:text-white hover:bg-white/5 text-xs font-medium transition-colors"
            >
              Continue Exploring
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};
