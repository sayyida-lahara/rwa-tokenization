import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useWallet } from '../../context/WalletContext';
import { ShieldCheck, Check, ArrowRight, Zap, ExternalLink, Copy, Globe, RefreshCw } from 'lucide-react';
import { formatCurrency, shortenAddress } from '../../utils/formatters';
import { SOLANA_CLUSTERS, SolanaAnchorService } from '../../services/solanaAnchorService';
import type { SolanaCluster } from '../../types';

export const WalletModal: React.FC = () => {
  const { wallet, isWalletModalOpen, closeWalletModal, connect, disconnect, switchCluster } = useWallet();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (wallet.address) {
      navigator.clipboard.writeText(wallet.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const clusters: { id: SolanaCluster; name: string; badge: string; isPrimary?: boolean }[] = [
    { id: 'testnet', name: 'Testnet', badge: 'Primary RWA', isPrimary: true },
    { id: 'devnet', name: 'Devnet', badge: 'Test SPL-USDC' },
    { id: 'mainnet-beta', name: 'Mainnet', badge: 'Institutional' },
    { id: 'localnet', name: 'Localnet', badge: 'Anchor 127.0.0.1' },
  ];

  return (
    <Modal
      isOpen={isWalletModalOpen}
      onClose={closeWalletModal}
      title={
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-md">
            <Zap className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-white font-display">
                {wallet.isConnected ? 'Connected Solana Wallet' : 'Connect Solana Wallet'}
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 uppercase">
                {wallet.cluster}
              </span>
            </div>
            <p className="text-xs text-gray-400">
              {wallet.isConnected
                ? 'Solana Anchor RWA Protocol Settlement'
                : 'Select your Solana provider to interact with Solana Testnet'}
            </p>
          </div>
        </div>
      }
      maxWidth="md"
    >
      {wallet.isConnected ? (
        <div className="space-y-5">
          {/* Active Wallet Card */}
          <div className="p-4 rounded-xl bg-[#0F1626] border border-[#1E293B] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 font-medium">Solana Public Key (Base58)</span>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Connected ({wallet.walletType?.toUpperCase()})
              </span>
            </div>

            <div className="flex items-center justify-between bg-[#151D30] p-2.5 rounded-lg border border-[#22304E]">
              <span className="text-xs font-mono text-cyan-300 break-all select-all">
                {wallet.address}
              </span>
              <button
                onClick={handleCopy}
                className="ml-2 px-2 py-1 rounded bg-[#0F1626] hover:bg-[#1C2640] text-gray-300 hover:text-white text-[11px] font-mono flex items-center gap-1 transition-colors shrink-0"
                title="Copy Base58 address"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* Balances */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-[#151D30] p-3 rounded-lg border border-[#22304E]">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-400">SPL-USDC Balance</p>
                  <span className="text-[10px] text-cyan-400 font-mono">Testnet</span>
                </div>
                <p className="text-lg font-bold text-white font-display mt-0.5">
                  {formatCurrency(wallet.balanceUSDC)}
                </p>
              </div>
              <div className="bg-[#151D30] p-3 rounded-lg border border-[#22304E]">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-400">SOL Balance</p>
                  <span className="text-[10px] text-purple-400 font-mono">Gas</span>
                </div>
                <p className="text-lg font-bold text-cyan-300 font-display mt-0.5">
                  {wallet.balanceSOL.toFixed(3)} SOL
                </p>
              </div>
            </div>

            {/* Explorer Links */}
            <div className="pt-2 flex items-center justify-between text-xs border-t border-[#1E293B]">
              <a
                href={SolanaAnchorService.getExplorerUrl(wallet.address || '', 'address', wallet.cluster)}
                target="_blank"
                rel="noreferrer"
                className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
              >
                <span>Solana Explorer</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href={SolanaAnchorService.getSolscanUrl(wallet.address || '', 'account', wallet.cluster)}
                target="_blank"
                rel="noreferrer"
                className="text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
              >
                <span>Solscan</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Solana Cluster Switcher */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-gray-400 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                <span>Solana Cluster RPC</span>
              </label>
              <span className="text-[10px] text-gray-500 font-mono">Anchor target: {wallet.cluster}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {clusters.map((c) => {
                const isActive = wallet.cluster === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => switchCluster(c.id)}
                    className={`p-2 rounded-xl border text-xs font-medium flex flex-col items-center justify-center gap-0.5 transition-all ${
                      isActive
                        ? 'bg-gradient-to-b from-cyan-950/60 to-purple-950/40 border-cyan-400 text-white shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                        : 'bg-[#0F1626] border-[#1E293B] text-gray-400 hover:text-white hover:border-[#2E3C58]'
                    }`}
                  >
                    <span className="font-semibold">{c.name}</span>
                    <span
                      className={`text-[9px] px-1 rounded ${
                        c.isPrimary
                          ? 'text-cyan-300 bg-cyan-500/20 font-bold'
                          : 'text-gray-500'
                      }`}
                    >
                      {c.badge}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Disconnect Action */}
          <div className="pt-2 flex gap-3">
            <button
              onClick={disconnect}
              className="w-full py-2.5 px-4 rounded-xl border border-rose-500/40 text-rose-300 hover:bg-rose-500/10 text-sm font-medium transition-colors"
            >
              Disconnect Wallet
            </button>
            <button
              onClick={closeWalletModal}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-sm font-semibold transition-colors shadow-lg shadow-cyan-500/20"
            >
              Done
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-xs text-gray-300">
            Connect using any native Solana wallet or initiate an instant institutional testnet keypair to explore Real World Asset tokenization on Solana.
          </p>

          {/* Active Cluster Reminder */}
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#0F1626] border border-[#1E293B] text-xs">
            <span className="text-gray-400 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              Target Network:
            </span>
            <span className="font-semibold text-cyan-300 font-mono bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
              Solana Testnet (RPC 8899)
            </span>
          </div>

          {/* Wallet Options */}
          <div className="space-y-2.5">
            {/* Instant Testnet Keypair (Recommended) */}
            <button
              onClick={() => connect('demo')}
              className="w-full p-3.5 rounded-xl bg-gradient-to-r from-cyan-950/40 via-blue-950/30 to-purple-950/40 hover:from-cyan-900/50 hover:to-purple-900/50 border border-cyan-500/40 hover:border-cyan-400 flex items-center justify-between group transition-all shadow-lg shadow-cyan-500/10"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center font-bold text-cyan-300 text-lg">
                  ⚡
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors">
                      Instant Solana Testnet Keypair
                    </h4>
                    <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-500/40 font-semibold">
                      Recommended
                    </span>
                  </div>
                  <p className="text-xs text-cyan-400/80">
                    Instant sandbox with 42.5 SOL & $145,250 Testnet SPL-USDC
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-cyan-400 group-hover:text-white transition-transform group-hover:translate-x-1" />
            </button>

            {/* Phantom */}
            <button
              onClick={() => connect('phantom')}
              className="w-full p-3.5 rounded-xl bg-[#0F1626] hover:bg-[#1A2338] border border-[#1E293B] hover:border-purple-500/50 flex items-center justify-between group transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center font-bold text-purple-400 text-lg">
                  👻
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-white group-hover:text-purple-400 transition-colors">
                      Phantom
                    </h4>
                    {typeof window !== 'undefined' && (window as any).solana?.isPhantom && (
                      <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded border border-emerald-500/30">
                        Detected
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">Solana's premier browser & mobile wallet</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-transform group-hover:translate-x-1" />
            </button>

            {/* Solflare */}
            <button
              onClick={() => connect('solflare')}
              className="w-full p-3.5 rounded-xl bg-[#0F1626] hover:bg-[#1A2338] border border-[#1E293B] hover:border-amber-500/50 flex items-center justify-between group transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center font-bold text-amber-400 text-lg">
                  🔥
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-white group-hover:text-amber-400 transition-colors">
                      Solflare
                    </h4>
                    {typeof window !== 'undefined' && (window as any).solflare && (
                      <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded border border-emerald-500/30">
                        Detected
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">Institutional grade security & hardware support</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-transform group-hover:translate-x-1" />
            </button>

            {/* Backpack */}
            <button
              onClick={() => connect('backpack')}
              className="w-full p-3.5 rounded-xl bg-[#0F1626] hover:bg-[#1A2338] border border-[#1E293B] hover:border-red-500/50 flex items-center justify-between group transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center font-bold text-red-400 text-lg">
                  🎒
                </div>
                <div className="text-left">
                  <h4 className="text-sm font-semibold text-white group-hover:text-red-400 transition-colors">
                    Backpack
                  </h4>
                  <p className="text-xs text-gray-400">Next-gen xNFT wallet for Solana</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          <div className="p-3 rounded-lg bg-[#0F1626]/60 border border-[#1E293B] flex items-center gap-2.5 text-xs text-gray-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Solana Anchor Rust contracts deployed on Solana Testnet. Zero private key exposure.</span>
          </div>
        </div>
      )}
    </Modal>
  );
};
