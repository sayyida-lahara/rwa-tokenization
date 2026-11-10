import React, { createContext, useContext } from 'react';
import { useData } from './DataContext';
import { useToast } from './ToastContext';

interface WatchlistContextType {
  watchlistIds: string[];
  isInWatchlist: (assetId: string) => boolean;
  toggleWatchlist: (assetId: string) => Promise<void>;
  removeFromWatchlist: (assetId: string) => Promise<void>;
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

export const WatchlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    watchlistIds,
    assets,
    toggleWatchlist: toggleWatchlistRequest,
    removeFromWatchlist: removeFromWatchlistRequest,
  } = useData();
  const { showSuccess, showInfo } = useToast();

  const isInWatchlist = (assetId: string) => watchlistIds.includes(assetId);

  const assetNameFor = (assetId: string) =>
    assets.find((asset) => asset.id === assetId)?.name || 'Asset';

  const toggleWatchlist = async (assetId: string) => {
    const assetName = assetNameFor(assetId);
    const wasSaved = watchlistIds.includes(assetId);
    await toggleWatchlistRequest(assetId);

    if (wasSaved) {
      showInfo('Removed from Watchlist', `${assetName} removed from your saved assets.`);
    } else {
      showSuccess('Added to Watchlist', `${assetName} saved to your watchlist.`);
    }
  };

  const removeFromWatchlist = async (assetId: string) => {
    const assetName = assetNameFor(assetId);
    await removeFromWatchlistRequest(assetId);
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
