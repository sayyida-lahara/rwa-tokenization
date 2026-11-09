import React, { createContext, useContext, useState } from 'react';
import { getStorageItem, setStorageItem } from '../utils/storage';
import { useToast } from './ToastContext';
import { MockAssetService } from '../services/mockAssetService';

const WATCHLIST_STORAGE_KEY = 'assetx_watchlist_v2';
const DEFAULT_WATCHLIST = ['asset-1', 'asset-2', 'asset-6'];

interface WatchlistContextType {
  watchlistIds: string[];
  isInWatchlist: (assetId: string) => boolean;
  toggleWatchlist: (assetId: string) => void;
  removeFromWatchlist: (assetId: string) => void;
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

export const WatchlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [watchlistIds, setWatchlistIds] = useState<string[]>(() =>
    getStorageItem<string[]>(WATCHLIST_STORAGE_KEY, DEFAULT_WATCHLIST)
  );
  const { showSuccess, showInfo } = useToast();

  const isInWatchlist = (assetId: string) => watchlistIds.includes(assetId);

  const toggleWatchlist = (assetId: string) => {
    const asset = MockAssetService.getAssetById(assetId);
    const assetName = asset?.name || 'Asset';

    if (watchlistIds.includes(assetId)) {
      const updated = watchlistIds.filter((id) => id !== assetId);
      setWatchlistIds(updated);
      setStorageItem(WATCHLIST_STORAGE_KEY, updated);
      showInfo('Removed from Watchlist', `${assetName} removed from your saved assets.`);
    } else {
      const updated = [...watchlistIds, assetId];
      setWatchlistIds(updated);
      setStorageItem(WATCHLIST_STORAGE_KEY, updated);
      showSuccess('Added to Watchlist', `${assetName} saved to your watchlist.`);
    }
  };

  const removeFromWatchlist = (assetId: string) => {
    const asset = MockAssetService.getAssetById(assetId);
    const assetName = asset?.name || 'Asset';
    const updated = watchlistIds.filter((id) => id !== assetId);
    setWatchlistIds(updated);
    setStorageItem(WATCHLIST_STORAGE_KEY, updated);
    showInfo('Removed from Watchlist', `${assetName} removed from your saved assets.`);
  };

  return (
    <WatchlistContext.Provider
      value={{
        watchlistIds,
        isInWatchlist,
        toggleWatchlist,
        removeFromWatchlist,
      }}
    >
      {children}
    </WatchlistContext.Provider>
  );
};

export const useWatchlist = () => {
  const context = useContext(WatchlistContext);
  if (!context) {
    throw new Error('useWatchlist must be used within a WatchlistProvider');
  }
  return context;
};
