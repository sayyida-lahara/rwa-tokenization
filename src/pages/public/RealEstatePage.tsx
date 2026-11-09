import React, { useState } from 'react';
import { MockAssetService } from '../../services/mockAssetService';
import { AssetCard } from '../../components/marketplace/AssetCard';
import { Building, Home, ShieldCheck, ArrowRight } from 'lucide-react';
import { Link } from 'react-router';

export const RealEstatePage: React.FC = () => {
  const allAssets = MockAssetService.getApprovedAssets();
  const realEstateAssets = allAssets.filter(
    (a) => a.category === 'Commercial' || a.category === 'Residential'
  );

  const [subType, setSubType] = useState<'all' | 'Commercial' | 'Residential'>('all');

  const filtered = subType === 'all'
    ? realEstateAssets
    : realEstateAssets.filter((a) => a.category === subType);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Category Header */}
      <div className="relative p-8 rounded-3xl bg-gradient-to-r from-blue-900/30 via-[#151D30] to-[#151D30] border border-[#22304E] shadow-2xl">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-xs font-semibold text-cyan-300">
            <Building className="w-3.5 h-3.5" />
            <span>Asset Category</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-white tracking-tight">
            Tokenized Real Estate
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
            Gain institutional fractional exposure to prime commercial tech parks, Grade-A corporate
            headquarters, and luxury sea-facing residential apartments. Backed by registered land deeds
            and triple-net corporate leases.
          </p>

          <div className="flex items-center gap-6 pt-3 text-xs text-gray-400">
            <div>
              <span className="block text-white font-bold font-display text-base">7 Properties</span>
              <span>Listed in Portfolio</span>
            </div>
            <div className="h-6 w-[1px] bg-[#22304E]" />
            <div>
              <span className="block text-emerald-400 font-bold font-display text-base">8.6% - 11.4%</span>
              <span>Target Annual Yield</span>
            </div>
            <div className="h-6 w-[1px] bg-[#22304E]" />
            <div>
              <span className="block text-cyan-400 font-bold font-display text-base">$50 USDC</span>
              <span>Min. Fractional Entry</span>
            </div>
          </div>
        </div>
      </div>

      {/* Subcategory Filter Tabs */}
      <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
        <div className="flex items-center gap-2">
          {[
            { id: 'all', label: 'All Real Estate' },
            { id: 'Commercial', label: 'Commercial & Tech Parks' },
            { id: 'Residential', label: 'Luxury Residential' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSubType(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                subType === tab.id
                  ? 'bg-blue-600/25 text-cyan-300 border border-cyan-500/40'
                  : 'text-gray-400 hover:text-white bg-[#151D30]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <span className="text-xs text-gray-400">
          Showing {filtered.length} verified properties
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((asset) => (
          <AssetCard key={asset.id} asset={asset} />
        ))}
      </div>
    </div>
  );
};
