import React from 'react';
import { MockAssetService } from '../../services/mockAssetService';
import { AssetCard } from '../../components/marketplace/AssetCard';
import { Shield, Zap, Globe2 } from 'lucide-react';

export const InfrastructurePage: React.FC = () => {
  const allAssets = MockAssetService.getApprovedAssets();
  const infraAssets = allAssets.filter(
    (a) => a.category === 'Infrastructure' || a.category === 'Renewable Energy' || a.category === 'Industrial'
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Category Header */}
      <div className="relative p-8 rounded-3xl bg-gradient-to-r from-emerald-950/40 via-[#151D30] to-[#151D30] border border-emerald-500/20 shadow-2xl">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-semibold text-emerald-300">
            <Zap className="w-3.5 h-3.5" />
            <span>Infrastructure & Green Transition</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-white tracking-tight">
            Infrastructure & Renewable Energy
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
            Essential critical assets generating sovereign cash flows. Invest in utility-scale 150 MW
            solar farms with 25-year government PPAs, deep-water automated container terminals, and EV
            component manufacturing clusters.
          </p>

          <div className="flex items-center gap-6 pt-3 text-xs text-gray-400">
            <div>
              <span className="block text-emerald-400 font-bold font-display text-base">11.2% - 14.2%</span>
              <span>Projected Cash Yield</span>
            </div>
            <div className="h-6 w-[1px] bg-[#22304E]" />
            <div>
              <span className="block text-white font-bold font-display text-base">25-Yr PPA</span>
              <span>Sovereign Counterparty</span>
            </div>
            <div className="h-6 w-[1px] bg-[#22304E]" />
            <div>
              <span className="block text-cyan-400 font-bold font-display text-base">Carbon Offsets</span>
              <span>Verra Registered</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {infraAssets.map((asset) => (
          <AssetCard key={asset.id} asset={asset} />
        ))}
      </div>
    </div>
  );
};
