import React, { useState } from 'react';
import type { BlockchainInfo } from '../../types';
import { Copy, Check, ShieldCheck, Cpu, ExternalLink, Code2, Database } from 'lucide-react';
import { shortenAddress } from '../../utils/formatters';
import { SolanaAnchorService } from '../../services/solanaAnchorService';

interface BlockchainDetailsProps {
  blockchainInfo: BlockchainInfo;
  onOpenInspector?: () => void;
}

export const BlockchainDetails: React.FC<BlockchainDetailsProps> = ({
  blockchainInfo,
  onOpenInspector,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const cluster = blockchainInfo.cluster || 'testnet';

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h3 className="text-base font-semibold text-white font-display flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <span>Solana Anchor Smart Contract Architecture</span>
        </h3>

        {onOpenInspector && (
          <button
            onClick={onOpenInspector}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-medium transition-all"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>View Anchor IDL & Rust Code</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        {/* Token Symbol */}
        <div className="p-3.5 rounded-xl bg-[#0F1626] border border-[#1E293B] space-y-1">
          <span className="text-gray-400">Token Symbol</span>
          <p className="font-mono text-cyan-300 font-bold text-sm">
            {blockchainInfo.tokenSymbol}
          </p>
          <span className="text-[10px] text-cyan-400 font-mono">
            {blockchainInfo.tokenStandard || 'Token-2022 (Transfer Hooks)'}
          </span>
        </div>

        {/* Settlement Network */}
        <div className="p-3.5 rounded-xl bg-[#0F1626] border border-[#1E293B] space-y-1">
          <span className="text-gray-400">Settlement Network</span>
          <p className="font-semibold text-white text-sm flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Solana {cluster.toUpperCase()}
          </p>
          <span className="text-[10px] text-gray-400 font-mono">Anchor Framework v0.30.1 • 400ms Finality</span>
        </div>

        {/* Anchor Program ID */}
        <div className="p-3.5 rounded-xl bg-[#0F1626] border border-[#1E293B] space-y-1 sm:col-span-2">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 flex items-center gap-1">
              <Database className="w-3.5 h-3.5 text-purple-400" />
              Anchor Program ID (Rust On-Chain)
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleCopy(blockchainInfo.programId, 'programId')}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono transition-colors"
              >
                {copiedField === 'programId' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedField === 'programId' ? 'Copied' : 'Copy'}</span>
              </button>
              <a
                href={SolanaAnchorService.getExplorerUrl(blockchainInfo.programId, 'address', cluster)}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
              >
                <span>Explorer</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
          <p className="font-mono text-xs text-white break-all bg-[#151D30] p-2 rounded-lg border border-[#22304E] select-all">
            {blockchainInfo.programId}
          </p>
        </div>

        {/* Token Mint Address */}
        <div className="p-3.5 rounded-xl bg-[#0F1626] border border-[#1E293B] space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">SPL Token Mint</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopy(blockchainInfo.tokenMint, 'tokenMint')}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono transition-colors"
              >
                {copiedField === 'tokenMint' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedField === 'tokenMint' ? 'Copied' : 'Copy'}</span>
              </button>
              <a
                href={SolanaAnchorService.getExplorerUrl(blockchainInfo.tokenMint, 'address', cluster)}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-gray-400 hover:text-white"
              >
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
          <p className="font-mono text-xs text-cyan-300 break-all bg-[#151D30] p-2 rounded-lg border border-[#22304E] select-all">
            {shortenAddress(blockchainInfo.tokenMint, 8)}
          </p>
        </div>

        {/* Token Vault PDA */}
        <div className="p-3.5 rounded-xl bg-[#0F1626] border border-[#1E293B] space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Escrow Vault PDA</span>
            <button
              onClick={() => handleCopy(blockchainInfo.vaultPda, 'vaultPda')}
              className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono transition-colors"
            >
              {copiedField === 'vaultPda' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedField === 'vaultPda' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <p className="font-mono text-xs text-purple-300 break-all bg-[#151D30] p-2 rounded-lg border border-[#22304E] select-all">
            {shortenAddress(blockchainInfo.vaultPda, 8)}
          </p>
        </div>

        {/* Compliance */}
        <div className="p-3.5 rounded-xl bg-[#0F1626] border border-[#1E293B] space-y-1">
          <span className="text-gray-400">Compliance & Transfer Hook</span>
          <p className="font-medium text-emerald-400 text-xs flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            {blockchainInfo.complianceAuditor}
          </p>
        </div>

        {/* Custodian */}
        <div className="p-3.5 rounded-xl bg-[#0F1626] border border-[#1E293B] space-y-1">
          <span className="text-gray-400">Institutional Custodian</span>
          <p className="font-medium text-cyan-300 text-xs">
            {blockchainInfo.treasuryCustodian}
          </p>
        </div>
      </div>
    </div>
  );
};
