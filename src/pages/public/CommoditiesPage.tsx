import React from 'react';
import { MockAssetService } from '../../services/mockAssetService';
import { AssetCard } from '../../components/marketplace/AssetCard';
import { Coins, ShieldCheck, Lock, ExternalLink } from 'lucide-react';

export const CommoditiesPage: React.FC = () => {
  const allAssets = MockAssetService.getApprovedAssets();
  const commodityAssets = allAssets.filter((a) => a.category === 'Gold');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Category Header */}
      <div className="relative p-8 rounded-3xl bg-gradient-to-r from-amber-950/40 via-[#151D30] to-[#151D30] border border-amber-500/20 shadow-2xl">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs font-semibold text-amber-300">
            <Coins className="w-3.5 h-3.5" />
            <span>Precious Metals & Commodities</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-white tracking-tight">
            Allocated Gold & Commodities
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
            Institutional-grade physical gold reserves held in high-security Swiss nuclear-bunker vaults.
            Each token represents verifiable title to LBMA Good Delivery 400 oz bullion bars with Chainlink
            Proof of Reserve auditing.
          </p>

          <div className="flex items-center gap-6 pt-3 text-xs text-gray-400">
            <div>
              <span className="block text-amber-300 font-bold font-display text-base">99.99% Purity</span>
              <span>LBMA Good Delivery</span>
            </div>
            <div className="h-6 w-[1px] bg-[#22304E]" />
            <div>
              <span className="block text-white font-bold font-display text-base">Zurich Vault</span>
              <span>Loomis Custody</span>
            </div>
            <div className="h-6 w-[1px] bg-[#22304E]" />
            <div>
              <span className="block text-cyan-400 font-bold font-display text-base">Proof of Reserve</span>
              <span>Chainlink On-Chain</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {commodityAssets.map((asset) => (
          <AssetCard key={asset.id} asset={asset} />
        ))}
      </div>
    </div>
  );
};
