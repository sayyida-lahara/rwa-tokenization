import React from 'react';
import { Link } from 'react-router';
import { useWatchlist } from '../../context/WatchlistContext';
import { MockAssetService } from '../../services/mockAssetService';
import { AssetCard } from '../../components/marketplace/AssetCard';
import { Bookmark, ArrowRight, Trash2 } from 'lucide-react';

export const WatchlistPage: React.FC = () => {
  const { watchlistIds, removeFromWatchlist } = useWatchlist();
  const allAssets = MockAssetService.getAssets();

  const savedAssets = allAssets.filter((a) => watchlistIds.includes(a.id));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1E293B]">
        <div>
          <h1 className="text-2xl font-bold font-display text-white">Saved Watchlist</h1>
          <p className="text-xs text-gray-400">
            Monitor verified real-world opportunities before executing fractional allocations
          </p>
        </div>

        <Link
          to="/explore"
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors self-start sm:self-auto"
        >
          Browse More Assets
        </Link>
      </div>

      {savedAssets.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#151D30] border border-[#1E293B] space-y-3">
          <Bookmark className="w-10 h-10 text-gray-500 mx-auto" />
          <h3 className="text-base font-semibold text-white font-display">Your Watchlist is Empty</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Click the heart icon on any asset card in the marketplace to save it to your personal watchlist.
          </p>
          <Link
            to="/explore"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
          >
            <span>Explore Marketplace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>{savedAssets.length} saved assets in your watchlist</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedAssets.map((asset) => (
              <AssetCard key={asset.id} asset={asset} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
