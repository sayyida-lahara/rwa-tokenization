import type {
  Asset,
  AssetCategory,
  ChainReceipt,
  InvestmentExecutionResult,
  MarketplaceSettings,
  SolanaCluster,
  User,
  UserPreferences,
  UserRole,
  VerificationStatus,
  WalletState,
} from '../types';

/**
 * Thin typed client for the Node/React Router backend. Every persisted mutation
 * goes through these functions; the browser never touches SQLite or a chain
 * directly.
 */

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  });

  const text = await response.text();
  let payload: any = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }

  if (!response.ok) {
    const message =
      (payload && typeof payload === 'object' && payload.error) ||
      (typeof payload === 'string' && payload) ||
      `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return payload as T;
}

export async function fetchBootstrap() {
  return request<import('../types').AppBootstrap>('/api/bootstrap');
}

export async function loginAsRoleRequest(role: UserRole): Promise<User> {
  const result = await request<{ currentUser: User }>('/api/auth/role', {
    method: 'POST',
    body: JSON.stringify({ role }),
  });
  return result.currentUser;
}

export async function loginWithEmailRequest(email: string): Promise<User> {
  const result = await request<{ currentUser: User }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
  return result.currentUser;
}

export interface UserUpdatePatch {
  name?: string;
  phone?: string;
  accountStatus?: User['accountStatus'];
  walletAddress?: string;
  kycLevel?: User['kycLevel'];
  companyName?: string;
  avatar?: string;
}

export async function updateUserRequest(userId: string, patch: UserUpdatePatch): Promise<User> {
  const result = await request<{ user: User }>(`/api/users/${encodeURIComponent(userId)}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
  return result.user;
}

export async function connectWalletRequest(
  type: NonNullable<WalletState['walletType']>
): Promise<WalletState> {
  const result = await request<{ wallet: WalletState }>('/api/wallet/connect', {
    method: 'POST',
    body: JSON.stringify({ type }),
  });
  return result.wallet;
}

export async function disconnectWalletRequest(): Promise<WalletState> {
  const result = await request<{ wallet: WalletState }>('/api/wallet/disconnect', {
    method: 'POST',
    body: JSON.stringify({}),
  });
  return result.wallet;
}

export async function switchClusterRequest(cluster: SolanaCluster): Promise<WalletState> {
  const result = await request<{ wallet: WalletState }>('/api/wallet/cluster', {
    method: 'POST',
    body: JSON.stringify({ cluster }),
  });
  return result.wallet;
}

export interface InvestmentRequest {
  assetId: string;
  quantity: number;
  userAddress: string;
  userEmail: string;
}

export async function investRequest(input: InvestmentRequest): Promise<InvestmentExecutionResult> {
  return request<InvestmentExecutionResult>('/api/investments', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export interface AssetSubmissionInput {
  name: string;
  category: AssetCategory;
  totalValuation: number;
  tokenPrice?: number;
  totalTokenSupply?: number;
  minimumInvestment?: number;
  expectedYield?: number;
  description?: string;
  subcategory?: string;
  tagLine?: string;
  images?: string[];
  location?: Asset['location'];
  ownership?: Asset['ownership'];
  documents?: Asset['documents'];
  submittedBy?: string;
  [key: string]: unknown;
}

export async function submitAssetRequest(
  input: AssetSubmissionInput
): Promise<{ asset: Asset; chain: ChainReceipt }> {
  return request<{ asset: Asset; chain: ChainReceipt }>('/api/assets', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateAssetStatusRequest(
  assetId: string,
  status: VerificationStatus,
  reviewComments?: string,
  rejectionReason?: string
): Promise<Asset> {
  const result = await request<{ asset: Asset }>(
    `/api/assets/${encodeURIComponent(assetId)}/status`,
    {
      method: 'POST',
      body: JSON.stringify({ status, reviewComments, rejectionReason }),
    }
  );
  return result.asset;
}

export async function toggleWatchlistRequest(assetId: string): Promise<string[]> {
  const result = await request<{ watchlistIds: string[] }>('/api/watchlist', {
    method: 'POST',
    body: JSON.stringify({ assetId }),
  });
  return result.watchlistIds;
}

export async function removeFromWatchlistRequest(assetId: string): Promise<string[]> {
  const result = await request<{ watchlistIds: string[] }>(
    `/api/watchlist/${encodeURIComponent(assetId)}`,
    { method: 'DELETE' }
  );
  return result.watchlistIds;
}

export async function savePreferencesRequest(
  userId: string,
  preferences: UserPreferences
): Promise<UserPreferences> {
  const result = await request<{ preferences: UserPreferences }>(
    `/api/preferences/${encodeURIComponent(userId)}`,
    {
      method: 'POST',
      body: JSON.stringify(preferences),
    }
  );
  return result.preferences;
}

export async function saveMarketplaceRequest(
  settings: MarketplaceSettings
): Promise<MarketplaceSettings> {
  const result = await request<{ marketplace: MarketplaceSettings }>('/api/marketplace', {
    method: 'POST',
    body: JSON.stringify(settings),
  });
  return result.marketplace;
}

export async function subscribeNewsletterRequest(email: string): Promise<string[]> {
  const result = await request<{ subscribers: string[] }>('/api/newsletter', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
  return result.subscribers;
}

export async function resetDemoDataRequest(): Promise<import('../types').AppBootstrap> {
  return request<import('../types').AppBootstrap>('/api/reset', {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

export async function fetchChainPDAs(
  assetId: string,
  investor?: string
): Promise<{
  marketplaceConfigPda: { pda: string; bump: number };
  assetOfferingPda: { pda: string; bump: number };
  tokenVaultPda: { pda: string; bump: number };
  investorPositionPda: { pda: string; bump: number };
  dividendVaultPda: { pda: string; bump: number };
}> {
  const query = new URLSearchParams({ assetId, ...(investor ? { investor } : {}) });
  return request(`/api/chain/pdas?${query.toString()}`);
}
