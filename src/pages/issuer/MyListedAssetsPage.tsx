import React from 'react';
import { Link } from 'react-router';
import { MockAssetService } from '../../services/mockAssetService';
import { AssetCard } from '../../components/marketplace/AssetCard';
import { Building, PlusCircle } from 'lucide-react';

export const MyListedAssetsPage: React.FC = () => {
  const assets = MockAssetService.getAssets();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1E293B]">
        <div>
          <h1 className="text-2xl font-bold font-display text-white">My Listed Assets</h1>
          <p className="text-xs text-gray-400">
            Portfolio of your organization’s tokenized commercial, residential, and infrastructure assets
          </p>
        </div>

        <Link
          to="/issuer/tokenize"
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Submission</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assets.map((asset) => (
          <AssetCard key={asset.id} asset={asset} />
        ))}
      </div>
    </div>
  );
};
