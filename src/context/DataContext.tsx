import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type {
  AppBootstrap,
  Asset,
  ChainInfo,
  ChainReceipt,
  Holding,
  InvestmentExecutionResult,
  MarketplaceSettings,
  PortfolioSummary,
  SolanaCluster,
  Transaction,
  User,
  UserPreferences,
  UserRole,
  VerificationStatus,
  WalletState,
} from '../types';
import {
  type AssetSubmissionInput,
  type UserUpdatePatch,
  connectWalletRequest,
  disconnectWalletRequest,
  fetchBootstrap,
  investRequest,
  loginAsRoleRequest,
  loginWithEmailRequest,
  removeFromWatchlistRequest,
  resetDemoDataRequest,
  saveMarketplaceRequest,
  savePreferencesRequest,
  submitAssetRequest,
  subscribeNewsletterRequest,
  switchClusterRequest,
  toggleWatchlistRequest,
  updateAssetStatusRequest,
  updateUserRequest,
} from '../services/apiClient';

interface DataContextType extends AppBootstrap {
  chain: ChainInfo;

  getAssets: () => Asset[];
  getApprovedAssets: () => Asset[];
  getAssetById: (id: string) => Asset | undefined;

  loginAsRole: (role: UserRole) => Promise<User>;
  loginWithEmail: (email: string) => Promise<User | null>;
  updateUser: (userId: string, patch: UserUpdatePatch) => Promise<User>;
  updateUserStatus: (userId: string, status: User['accountStatus']) => Promise<User>;

  connectWallet: (type: NonNullable<WalletState['walletType']>) => Promise<WalletState>;
  disconnectWallet: () => Promise<WalletState>;
  switchCluster: (cluster: SolanaCluster) => Promise<WalletState>;

  investInAsset: (
    assetId: string,
    quantity: number,
    userAddress: string,
    userEmail: string
  ) => Promise<InvestmentExecutionResult>;
  submitAsset: (
    input: AssetSubmissionInput
  ) => Promise<{ asset: Asset; chain: ChainReceipt }>;
  updateAssetStatus: (
    assetId: string,
    status: VerificationStatus,
    reviewComments?: string,
    rejectionReason?: string
  ) => Promise<Asset>;

  toggleWatchlist: (assetId: string) => Promise<string[]>;
  removeFromWatchlist: (assetId: string) => Promise<string[]>;
  savePreferences: (userId: string, preferences: UserPreferences) => Promise<UserPreferences>;
  saveMarketplaceSettings: (settings: MarketplaceSettings) => Promise<MarketplaceSettings>;
  subscribeNewsletter: (email: string) => Promise<string[]>;
  resetDemoData: () => Promise<void>;
  refresh: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

function networkLabel(cluster: SolanaCluster): string {
  if (cluster === 'mainnet-beta') return 'Lahara Mainnet Beta';
  return `Lahara ${cluster.charAt(0).toUpperCase()}${cluster.slice(1)}`;
}

function replaceById<T extends { id: string }>(items: T[], next: T): T[] {
  const index = items.findIndex((item) => item.id === next.id);
  if (index === -1) return [next, ...items];
  const copy = [...items];
  copy[index] = next;
  return copy;
}

export const DataProvider: React.FC<{
  initialData: AppBootstrap;
  children: React.ReactNode;
}> = ({ initialData, children }) => {
  const [bootstrap, setBootstrap] = useState<AppBootstrap>(initialData);

  const replaceAll = useCallback((next: AppBootstrap) => {
    setBootstrap(next);
  }, []);

  const refresh = useCallback(async () => {
    const next = await fetchBootstrap();
    replaceAll(next);
  }, [replaceAll]);

  const getAssets = useCallback(() => bootstrap.assets, [bootstrap.assets]);
  const getApprovedAssets = useCallback(
    () => bootstrap.assets.filter((asset) => asset.verificationStatus === 'Approved'),
    [bootstrap.assets]
  );
  const getAssetById = useCallback(
    (id: string) => bootstrap.assets.find((asset) => asset.id === id),
    [bootstrap.assets]
  );

  const loginAsRole = useCallback(async (role: UserRole) => {
    const user = await loginAsRoleRequest(role);
    setBootstrap((prev) => ({ ...prev, currentUser: user }));
    return user;
  }, []);

  const loginWithEmail = useCallback(async (email: string) => {
    try {
      const user = await loginWithEmailRequest(email);
      setBootstrap((prev) => ({ ...prev, currentUser: user }));
      return user;
    } catch {
      return null;
    }
  }, []);

  const applyUser = useCallback((user: User) => {
    setBootstrap((prev) => ({
      ...prev,
      users: replaceById(prev.users, user),
      currentUser: prev.currentUser.id === user.id ? user : prev.currentUser,
    }));
  }, []);

  const updateUser = useCallback(
    async (userId: string, patch: UserUpdatePatch) => {
      const user = await updateUserRequest(userId, patch);
      applyUser(user);
      return user;
    },
    [applyUser]
  );

  const updateUserStatus = useCallback(
    async (userId: string, status: User['accountStatus']) => {
      return updateUser(userId, { accountStatus: status });
    },
    [updateUser]
  );

  const applyWallet = useCallback((wallet: WalletState) => {
    setBootstrap((prev) => ({ ...prev, wallet }));
  }, []);

  const connectWallet = useCallback(
    async (type: NonNullable<WalletState['walletType']>) => {
      const wallet = await connectWalletRequest(type);
      applyWallet(wallet);
      return wallet;
    },
    [applyWallet]
  );

  const disconnectWallet = useCallback(async () => {
    const wallet = await disconnectWalletRequest();
    applyWallet(wallet);
    return wallet;
  }, [applyWallet]);

  const switchCluster = useCallback(
    async (cluster: SolanaCluster) => {
      const wallet = await switchClusterRequest(cluster);
      applyWallet(wallet);
      return wallet;
    },
    [applyWallet]
  );

  const investInAsset = useCallback(
    async (assetId: string, quantity: number, userAddress: string, userEmail: string) => {
      const result = await investRequest({ assetId, quantity, userAddress, userEmail });

      setBootstrap((prev) => {
        const holdings: Holding[] = (() => {
          const index = prev.holdings.findIndex((h) => h.assetId === result.holding.assetId);
          if (index === -1) return [...prev.holdings, result.holding];
          const copy = [...prev.holdings];
          copy[index] = result.holding;
          return copy;
        })();

        const transactions: Transaction[] = [result.transaction, ...prev.transactions];

        return {
          ...prev,
          assets: replaceById(prev.assets, result.asset),
          holdings,
          transactions,
          portfolio: result.portfolio,
          wallet: result.wallet,
        };
      });

      return result;
    },
    []
  );

  const submitAsset = useCallback(async (input: AssetSubmissionInput) => {
    const result = await submitAssetRequest(input);
    setBootstrap((prev) => ({
      ...prev,
      assets: [result.asset, ...prev.assets],
    }));
    return result;
  }, []);

  const updateAssetStatus = useCallback(
    async (
      assetId: string,
      status: VerificationStatus,
      reviewComments?: string,
      rejectionReason?: string
    ) => {
      const asset = await updateAssetStatusRequest(
        assetId,
        status,
        reviewComments,
        rejectionReason
      );
      setBootstrap((prev) => ({
        ...prev,
        assets: replaceById(prev.assets, asset),
      }));
      return asset;
    },
    []
  );

  const toggleWatchlist = useCallback(async (assetId: string) => {
    const watchlistIds = await toggleWatchlistRequest(assetId);
    setBootstrap((prev) => ({ ...prev, watchlistIds }));
    return watchlistIds;
  }, []);

  const removeFromWatchlist = useCallback(async (assetId: string) => {
    const watchlistIds = await removeFromWatchlistRequest(assetId);
    setBootstrap((prev) => ({ ...prev, watchlistIds }));
    return watchlistIds;
  }, []);

  const savePreferences = useCallback(async (userId: string, preferences: UserPreferences) => {
    const saved = await savePreferencesRequest(userId, preferences);
    setBootstrap((prev) => ({
      ...prev,
      preferences: { ...prev.preferences, [userId]: saved },
    }));
    return saved;
  }, []);

  const saveMarketplaceSettings = useCallback(async (settings: MarketplaceSettings) => {
    const marketplace = await saveMarketplaceRequest(settings);
    setBootstrap((prev) => ({ ...prev, marketplace }));
    return marketplace;
  }, []);

  const subscribeNewsletter = useCallback(async (email: string) => {
    const newsletterSubscribers = await subscribeNewsletterRequest(email);
    setBootstrap((prev) => ({ ...prev, newsletterSubscribers }));
    return newsletterSubscribers;
  }, []);

  const resetDemoData = useCallback(async () => {
    const next = await resetDemoDataRequest();
    replaceAll(next);
  }, [replaceAll]);

  const chain = useMemo<ChainInfo>(
    () => ({
      ...bootstrap.chain,
      cluster: bootstrap.wallet.cluster,
      network: networkLabel(bootstrap.wallet.cluster),
    }),
    [bootstrap.chain, bootstrap.wallet.cluster]
  );

  const value = useMemo<DataContextType>(
    () => ({
      ...bootstrap,
      chain,
      getAssets,
      getApprovedAssets,
      getAssetById,
      loginAsRole,
      loginWithEmail,
      updateUser,
      updateUserStatus,
      connectWallet,
      disconnectWallet,
      switchCluster,
      investInAsset,
      submitAsset,
      updateAssetStatus,
      toggleWatchlist,
      removeFromWatchlist,
      savePreferences,
      saveMarketplaceSettings,
      subscribeNewsletter,
      resetDemoData,
      refresh,
    }),
    [
      bootstrap,
      chain,
      getAssets,
      getApprovedAssets,
      getAssetById,
      loginAsRole,
      loginWithEmail,
      updateUser,
      updateUserStatus,
      connectWallet,
      disconnectWallet,
      switchCluster,
      investInAsset,
      submitAsset,
      updateAssetStatus,
      toggleWatchlist,
      removeFromWatchlist,
      savePreferences,
      saveMarketplaceSettings,
      subscribeNewsletter,
      resetDemoData,
      refresh,
    ]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
