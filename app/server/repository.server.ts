import type {
  Asset,
  AssetCategory,
  AppBootstrap,
  ChainInfo,
  ChainReceipt,
  Holding,
  InvestmentExecutionResult,
  MarketplaceSettings,
  PortfolioHolding,
  PortfolioSummary,
  SolanaCluster,
  Transaction,
  User,
  UserPreferences,
  UserRole,
  VerificationStatus,
  WalletState,
} from '../../src/types';
import {
  DEFAULT_MARKETPLACE_SETTINGS,
  DEFAULT_USER_PREFERENCES,
  DEFAULT_WALLET,
  SETTLEMENT_NETWORKS,
  getDb,
  getKeyValue,
  parseJson,
  resetDatabase,
  setKeyValue,
} from './db.server';
import {
  deriveAssetOfferingPDA,
  deriveDividendVaultPDA,
  deriveInvestorPositionPDA,
  deriveMarketplaceConfigPDA,
  deriveTokenVaultPDA,
  executeMockChainInstruction,
  generateSolanaPublicKey,
  getCluster,
  getProgramId,
} from './mockChain.server';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

interface JsonRow {
  data: string;
}

interface ValueRow {
  value: string;
}

const WALLET_ADDRESSES: Record<'phantom' | 'solflare' | 'backpack' | 'demo', string> = {
  phantom: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
  solflare: '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLyNbh96nfcbs',
  backpack: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
  demo: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
};

const CLUSTERS: SolanaCluster[] = ['mainnet-beta', 'devnet', 'testnet', 'localnet'];

function nowIso(): string {
  return new Date().toISOString();
}

function today(): string {
  return new Date().toISOString().split('T')[0];
}

/* -------------------------------------------------------------------------- */
/* Assets                                                                     */
/* -------------------------------------------------------------------------- */

export function getAssets(): Asset[] {
  const rows = getDb()
    .prepare('SELECT data FROM assets ORDER BY sort_order ASC, created_at ASC')
    .all() as unknown as JsonRow[];
  return rows.map((row) => parseJson<Asset>(row.data));
}

export function getApprovedAssets(): Asset[] {
  return getAssets().filter((asset) => asset.verificationStatus === 'Approved');
}

export function getAssetById(id: string): Asset | undefined {
  const row = getDb().prepare('SELECT data FROM assets WHERE id = ?').get(id) as
    | JsonRow
    | undefined;
  return row ? parseJson<Asset>(row.data) : undefined;
}

function saveAsset(asset: Asset, sortOrder?: number): void {
  const db = getDb();
  if (sortOrder !== undefined) {
    db.prepare(
      'INSERT OR REPLACE INTO assets (id, data, sort_order, created_at) VALUES (?, ?, ?, ?)'
    ).run(asset.id, JSON.stringify(asset), sortOrder, nowIso());
    return;
  }
  db.prepare('UPDATE assets SET data = ? WHERE id = ?').run(JSON.stringify(asset), asset.id);
}

function nextAssetSortOrder(): number {
  const row = getDb().prepare('SELECT COALESCE(MIN(sort_order), 1) AS min FROM assets').get() as {
    min: number;
  };
  return Number(row.min) - 1;
}

export interface AssetSubmissionInput
  extends Partial<Asset> {
  name: string;
  category: AssetCategory;
  totalValuation: number;
}

export function submitAsset(data: AssetSubmissionInput): { asset: Asset; chain: ChainReceipt } {
  const tokenPrice =
    data.tokenPrice || (data.totalTokenSupply ? data.totalValuation / data.totalTokenSupply : 50);
  const totalTokenSupply =
    data.totalTokenSupply || Math.round(data.totalValuation / Math.max(tokenPrice, 1));

  const newId = `asset-sub-${Date.now()}-${Math.floor(Math.random() * 10_000)}`;
  const tokenMint = generateSolanaPublicKey('Mint');
  const vaultPda = deriveTokenVaultPDA(newId).pda;
  const cluster = getCluster();
  const chain = executeMockChainInstruction('create_asset_offering', cluster);

  const newAsset: Asset = {
    id: newId,
    name: data.name,
    tagLine:
      data.tagLine || 'Newly tokenized institutional asset awaiting Solana Anchor verification',
    category: data.category,
    subcategory: data.subcategory || `${data.category} Project`,
    location:
      data.location || {
        address: 'Prime Commercial District',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        flag: '🇮🇳',
      },
    description:
      data.description || 'Verified tokenized real-world investment opportunity on Solana Anchor.',
    highlights:
      data.highlights && data.highlights.length > 0
        ? data.highlights
        : [
            'Institutional Grade Asset Architecture',
            'Independent third-party appraisal on file',
            'Tokenized SPV legal custody in place',
            'Anchor Rust Program Verified on Solana',
          ],
    images:
      data.images && data.images.length > 0
        ? data.images
        : [
            'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
          ],
    totalValuation: data.totalValuation,
    tokenPrice,
    totalTokenSupply,
    availableTokens: totalTokenSupply,
    minimumInvestment: data.minimumInvestment || tokenPrice * 2,
    expectedYield: data.expectedYield || 10.5,
    verificationStatus: 'Pending Verification',
    investmentStatus: 'Upcoming',
    listingDate: today(),
    fundingProgress: 0,
    ownership:
      data.ownership || {
        issuerName: 'Demo Asset Issuer',
        entityName: `${data.name} SPV Ltd`,
        structure: 'Special Purpose Vehicle LLC',
        registrationNumber: `REG-${Math.floor(100000 + Math.random() * 900000)}`,
        country: 'India',
      },
    specifications:
      data.specifications || {
        'Asset Class': data.category,
        'Valuation Standard': 'RICS / IVS compliant',
        Custodian: 'Institutional Trust Services',
        Settlement: 'Solana Anchor Program',
      },
    financialInfo:
      data.financialInfo || {
        grossAnnualRentalIncome: Math.round(data.totalValuation * 0.11),
        netOperatingIncome: Math.round(data.totalValuation * 0.102),
        propertyManagementFeePercent: 4.0,
        capitalAppreciationEstimate: 6.5,
        dividendFrequency: 'Monthly',
        nextDistributionDate: '2026-12-01',
      },
    documents:
      data.documents && data.documents.length > 0
        ? data.documents
        : [
            {
              id: `doc-${Date.now()}-1`,
              name: 'Asset Valuation Deed',
              type: 'PDF',
              size: '3.8 MB',
              verifiedDate: today(),
              url: '#',
            },
            {
              id: `doc-${Date.now()}-2`,
              name: 'SPV Ownership Certificate',
              type: 'PDF',
              size: '2.4 MB',
              verifiedDate: today(),
              url: '#',
            },
          ],
    blockchainInfo:
      data.blockchainInfo || {
        tokenSymbol: data.name.substring(0, 4).toUpperCase() + '-X',
        tokenStandard: 'Token-2022 (Transfer Hooks)',
        network: 'Solana',
        cluster,
        programId: getProgramId(),
        tokenMint,
        vaultPda,
        complianceAuditor: 'Securitize ONCHAINID / Solana Token-2022',
        treasuryCustodian: 'BitGo Institutional Custody (Solana)',
      },
    valuationHistory: [
      { date: 'Initial Listing', valuation: data.totalValuation, tokenPrice },
    ],
    tokenDistribution: [
      {
        name: 'Public Token Sale',
        percentage: 70,
        tokens: Math.round(totalTokenSupply * 0.7),
        color: '#3B82F6',
      },
      {
        name: 'Sponsor Stake',
        percentage: 20,
        tokens: Math.round(totalTokenSupply * 0.2),
        color: '#10B981',
      },
      {
        name: 'Reserve',
        percentage: 10,
        tokens: Math.round(totalTokenSupply * 0.1),
        color: '#00E5FF',
      },
    ],
    submittedBy: data.submittedBy || 'issuer@assetx.demo',
    submittedAt: nowIso(),
  };

  saveAsset(newAsset, nextAssetSortOrder());
  return { asset: newAsset, chain };
}

export function updateAssetStatus(
  id: string,
  status: VerificationStatus,
  reviewComments?: string,
  rejectionReason?: string
): Asset {
  const current = getAssetById(id);
  if (!current) throw new ApiError(`Asset not found: ${id}`, 404);

  const updated: Asset = {
    ...current,
    verificationStatus: status,
    investmentStatus: status === 'Approved' ? 'Active' : current.investmentStatus,
    reviewComments: reviewComments ?? current.reviewComments,
    rejectionReason: rejectionReason ?? current.rejectionReason,
  };

  saveAsset(updated);
  return updated;
}

function updateAssetTokens(assetId: string, quantityPurchased: number): Asset {
  const current = getAssetById(assetId);
  if (!current) throw new ApiError(`Asset not found: ${assetId}`, 404);

  const newAvailable = Math.max(0, current.availableTokens - quantityPurchased);
  const tokensSold = current.totalTokenSupply - newAvailable;
  const progress = Math.min(100, Math.round((tokensSold / current.totalTokenSupply) * 100));

  const updated: Asset = {
    ...current,
    availableTokens: newAvailable,
    fundingProgress: progress,
    investmentStatus: newAvailable === 0 ? 'Fully Funded' : current.investmentStatus,
  };

  saveAsset(updated);
  return updated;
}

/* -------------------------------------------------------------------------- */
/* Users / demo authentication                                                */
/* -------------------------------------------------------------------------- */

export function getUsers(): User[] {
  const rows = getDb()
    .prepare('SELECT data FROM users ORDER BY sort_order ASC, created_at ASC')
    .all() as unknown as JsonRow[];
  return rows.map((row) => parseJson<User>(row.data));
}

export function getUserById(id: string): User | undefined {
  return getUsers().find((user) => user.id === id);
}

export function getUserByEmail(email: string): User | undefined {
  return getUsers().find((user) => user.email.toLowerCase() === email.toLowerCase());
}

export function getCurrentUser(): User {
  const users = getUsers();
  if (users.length === 0) throw new ApiError('No demo users are configured', 500);

  const currentId = getKeyValue<string>('currentUser', users[0].id);
  const match = users.find((user) => user.id === currentId);
  if (match) return match;

  setKeyValue('currentUser', users[0].id);
  return users[0];
}

export function loginAsRole(role: UserRole): User {
  const target = getUsers().find((user) => user.role === role);
  if (!target) throw new ApiError(`No demo account exists for role: ${role}`, 404);
  setKeyValue('currentUser', target.id);
  return target;
}

export function loginWithEmail(email: string): User | null {
  const user = getUserByEmail(email);
  if (!user) return null;
  setKeyValue('currentUser', user.id);
  return user;
}

export function updateUser(
  userId: string,
  patch: Partial<Pick<User, 'name' | 'phone' | 'accountStatus' | 'walletAddress' | 'kycLevel' | 'companyName' | 'avatar'>>
): User {
  const current = getUserById(userId);
  if (!current) throw new ApiError(`User not found: ${userId}`, 404);

  const updated: User = { ...current, ...patch };
  getDb()
    .prepare('UPDATE users SET data = ? WHERE id = ?')
    .run(JSON.stringify(updated), userId);

  return updated;
}

export function isCurrentUser(userId: string): boolean {
  return getCurrentUser().id === userId;
}

/* -------------------------------------------------------------------------- */
/* Wallet                                                                     */
/* -------------------------------------------------------------------------- */

export function getWallet(): WalletState {
  return { ...DEFAULT_WALLET, ...getKeyValue<Partial<WalletState>>('wallet', DEFAULT_WALLET) };
}

function saveWallet(wallet: WalletState): WalletState {
  setKeyValue('wallet', wallet);
  return wallet;
}

export function connectWallet(
  type: 'phantom' | 'solflare' | 'backpack' | 'demo'
): WalletState {
  const current = getWallet();
  return saveWallet({
    isConnected: true,
    address: WALLET_ADDRESSES[type],
    balanceUSDC: current.balanceUSDC > 0 ? current.balanceUSDC : 145250,
    balanceSOL: current.balanceSOL > 0 ? current.balanceSOL : 42.5,
    cluster: current.cluster || 'testnet',
    walletType: type,
  });
}

export function disconnectWallet(): WalletState {
  const current = getWallet();
  return saveWallet({
    isConnected: false,
    address: null,
    balanceUSDC: 0,
    balanceSOL: 0,
    cluster: current.cluster || 'testnet',
    walletType: null,
  });
}

export function switchCluster(cluster: SolanaCluster): WalletState {
  if (!CLUSTERS.includes(cluster)) throw new ApiError(`Unknown Solana cluster: ${cluster}`, 400);
  return saveWallet({ ...getWallet(), cluster });
}

function deductWalletBalance(totalUsdc: number): WalletState {
  const current = getWallet();
  return saveWallet({
    ...current,
    balanceUSDC: Math.max(0, current.balanceUSDC - totalUsdc),
    // 5000 lamports Solana transaction fee, expressed in SOL.
    balanceSOL: Math.max(0, current.balanceSOL - 0.000005),
  });
}

/* -------------------------------------------------------------------------- */
/* Holdings / transactions / portfolio                                        */
/* -------------------------------------------------------------------------- */

export function getHoldings(): Holding[] {
  const rows = getDb().prepare('SELECT data FROM holdings').all() as unknown as JsonRow[];
  return rows.map((row) => parseJson<Holding>(row.data));
}

export function getTransactions(): Transaction[] {
  const rows = getDb()
    .prepare('SELECT data FROM transactions ORDER BY timestamp DESC, rowid DESC')
    .all() as unknown as JsonRow[];
  return rows.map((row) => parseJson<Transaction>(row.data));
}

export function getPortfolioSummary(): PortfolioSummary {
  const holdings = getHoldings();
  const assets = getAssets();

  let totalPortfolioValue = 0;
  let totalInvested = 0;
  let totalTokensHeld = 0;

  const enrichedHoldings: PortfolioHolding[] = holdings.map((holding) => {
    const asset = assets.find((item) => item.id === holding.assetId);
    const currentPrice = asset ? asset.tokenPrice : holding.averagePurchasePrice;
    const currentValue = holding.tokenQuantity * currentPrice;
    const gainLoss = currentValue - holding.totalInvested;
    const gainLossPercent =
      holding.totalInvested > 0 ? (gainLoss / holding.totalInvested) * 100 : 0;

    totalPortfolioValue += currentValue;
    totalInvested += holding.totalInvested;
    totalTokensHeld += holding.tokenQuantity;

    return {
      ...holding,
      asset,
      currentValue,
      gainLoss,
      gainLossPercent,
    };
  });

  const netGain = totalPortfolioValue - totalInvested;
  const overallReturnPercent = totalInvested > 0 ? (netGain / totalInvested) * 100 : 0;

  return {
    totalPortfolioValue,
    totalInvested,
    totalAssetsOwned: holdings.length,
    totalTokensHeld,
    netGain,
    overallReturnPercent,
    holdings: enrichedHoldings,
  };
}

export interface InvestmentInput {
  assetId: string;
  quantity: number;
  userAddress: string;
  userEmail: string;
}

/**
 * Executes a token purchase. The SQLite writes and the mocked smart-contract
 * call are treated as one backend operation; the frontend never touches chain
 * state or persistence directly.
 */
export function executeInvestment(input: InvestmentInput): InvestmentExecutionResult {
  const quantity = Math.floor(Number(input.quantity));
  if (!Number.isFinite(quantity) || quantity <= 0) {
    throw new ApiError('Token quantity must be a positive whole number', 400);
  }

  const asset = getAssetById(input.assetId);
  if (!asset) throw new ApiError(`Asset not found: ${input.assetId}`, 404);

  const marketplace = getMarketplaceSettings();
  if (marketplace.isTradingPaused) {
    throw new ApiError('Marketplace trading is currently paused by compliance', 409);
  }

  if (quantity > asset.availableTokens) {
    throw new ApiError(`Only ${asset.availableTokens} tokens are available for investment.`, 409);
  }

  const investmentAmount = quantity * asset.tokenPrice;
  if (investmentAmount < asset.minimumInvestment) {
    throw new ApiError(
      `Minimum investment is $${asset.minimumInvestment} (${Math.ceil(
        asset.minimumInvestment / asset.tokenPrice
      )} tokens).`,
      400
    );
  }

  const fee = Math.round(investmentAmount * (marketplace.feePercent / 100) * 100) / 100;
  const totalAmount = Math.round((investmentAmount + fee) * 100) / 100;

  const db = getDb();
  const walletBefore = getWallet();
  if (walletBefore.isConnected && walletBefore.balanceUSDC < totalAmount) {
    throw new ApiError(
      `Insufficient USDC balance. Required $${totalAmount.toFixed(2)}, available $${walletBefore.balanceUSDC.toFixed(2)}.`,
      409
    );
  }

  const chain = executeMockChainInstruction('invest_in_asset_offering', walletBefore.cluster);

  const existingHoldings = getHoldings();
  const existingIndex = existingHoldings.findIndex((holding) => holding.assetId === asset.id);
  let updatedHolding: Holding;

  if (existingIndex >= 0) {
    const existing = existingHoldings[existingIndex];
    const newTotalTokens = existing.tokenQuantity + quantity;
    const newTotalInvested = existing.totalInvested + investmentAmount;
    updatedHolding = {
      assetId: asset.id,
      tokenQuantity: newTotalTokens,
      averagePurchasePrice: Math.round((newTotalInvested / newTotalTokens) * 100) / 100,
      totalInvested: newTotalInvested,
      firstPurchasedAt: existing.firstPurchasedAt,
      lastPurchasedAt: nowIso(),
    };
  } else {
    updatedHolding = {
      assetId: asset.id,
      tokenQuantity: quantity,
      averagePurchasePrice: asset.tokenPrice,
      totalInvested: investmentAmount,
      firstPurchasedAt: nowIso(),
      lastPurchasedAt: nowIso(),
    };
  }

  const transaction: Transaction = {
    id: `tx-${Date.now()}-${Math.floor(Math.random() * 10_000)}`,
    txHash: chain.signature,
    signature: chain.signature,
    slot: chain.slot,
    timestamp: nowIso(),
    assetId: asset.id,
    assetName: asset.name,
    assetImage: asset.images[0],
    type: 'Purchase',
    tokenQuantity: quantity,
    tokenPrice: asset.tokenPrice,
    totalAmount,
    fee,
    feeSOL: 0.000005,
    status: 'Completed',
    userAddress: input.userAddress || walletBefore.address || '',
    userEmail: input.userEmail,
    cluster: walletBefore.cluster,
  };

  let updatedAsset: Asset;
  let updatedWallet: WalletState;

  db.exec('BEGIN IMMEDIATE');
  try {
    updatedAsset = updateAssetTokens(asset.id, quantity);

    db.prepare(
      'INSERT OR REPLACE INTO holdings (asset_id, data) VALUES (?, ?)'
    ).run(asset.id, JSON.stringify(updatedHolding));

    db.prepare(
      'INSERT INTO transactions (id, data, timestamp) VALUES (?, ?, ?)'
    ).run(transaction.id, JSON.stringify(transaction), transaction.timestamp);

    updatedWallet = deductWalletBalance(totalAmount);
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }

  return {
    asset: updatedAsset,
    transaction,
    holding: updatedHolding,
    wallet: updatedWallet,
    portfolio: getPortfolioSummary(),
    chain,
  };
}

/* -------------------------------------------------------------------------- */
/* Watchlist                                                                  */
/* -------------------------------------------------------------------------- */

export function getWatchlist(): string[] {
  const rows = getDb()
    .prepare('SELECT asset_id FROM watchlist ORDER BY rowid ASC')
    .all() as unknown as { asset_id: string }[];
  return rows.map((row) => row.asset_id);
}

export function toggleWatchlist(assetId: string): string[] {
  if (!getAssetById(assetId)) throw new ApiError(`Asset not found: ${assetId}`, 404);

  const db = getDb();
  const existing = db.prepare('SELECT asset_id FROM watchlist WHERE asset_id = ?').get(assetId);
  if (existing) {
    db.prepare('DELETE FROM watchlist WHERE asset_id = ?').run(assetId);
  } else {
    db.prepare('INSERT INTO watchlist (asset_id, added_at) VALUES (?, ?)').run(assetId, nowIso());
  }
  return getWatchlist();
}

export function removeFromWatchlist(assetId: string): string[] {
  getDb().prepare('DELETE FROM watchlist WHERE asset_id = ?').run(assetId);
  return getWatchlist();
}

/* -------------------------------------------------------------------------- */
/* Preferences / marketplace / newsletter                                     */
/* -------------------------------------------------------------------------- */

function readPreferences(): Record<string, UserPreferences> {
  const rows = getDb()
    .prepare('SELECT user_id, data FROM preferences')
    .all() as unknown as { user_id: string; data: string }[];
  const result: Record<string, UserPreferences> = {};
  for (const row of rows) {
    result[row.user_id] = { ...DEFAULT_USER_PREFERENCES, ...parseJson<Partial<UserPreferences>>(row.data) };
  }
  return result;
}

export function getPreferencesForUser(userId: string): UserPreferences {
  return { ...DEFAULT_USER_PREFERENCES, ...(readPreferences()[userId] || {}) };
}

export function savePreferences(
  userId: string,
  preferences: UserPreferences
): UserPreferences {
  if (!getUserById(userId)) throw new ApiError(`User not found: ${userId}`, 404);

  const normalized: UserPreferences = {
    emailAlerts: Boolean(preferences.emailAlerts),
    dividendAlerts: Boolean(preferences.dividendAlerts),
  };
  getDb()
    .prepare('INSERT OR REPLACE INTO preferences (user_id, data) VALUES (?, ?)')
    .run(userId, JSON.stringify(normalized));
  return normalized;
}

export function getMarketplaceSettings(): MarketplaceSettings {
  const stored = getKeyValue<Partial<MarketplaceSettings>>(
    'marketplace',
    DEFAULT_MARKETPLACE_SETTINGS
  );
  return { ...DEFAULT_MARKETPLACE_SETTINGS, ...stored };
}

export function saveMarketplaceSettings(
  settings: MarketplaceSettings
): MarketplaceSettings {
  const normalized: MarketplaceSettings = {
    ...settings,
    feePercent: Math.min(5, Math.max(0, Number(settings.feePercent) || 0)),
    minOfferingValuation: Math.max(0, Number(settings.minOfferingValuation) || 0),
    settlementNetwork:
      settings.settlementNetwork || DEFAULT_MARKETPLACE_SETTINGS.settlementNetwork,
    oracleProvider:
      (settings.oracleProvider || '').trim() || DEFAULT_MARKETPLACE_SETTINGS.oracleProvider,
    isTradingPaused: Boolean(settings.isTradingPaused),
  };
  setKeyValue('marketplace', normalized);
  return normalized;
}

export function subscribeNewsletter(email: string): string[] {
  const normalized = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    throw new ApiError('Please provide a valid email address', 400);
  }
  getDb()
    .prepare('INSERT OR IGNORE INTO newsletter (email, subscribed_at) VALUES (?, ?)')
    .run(normalized, nowIso());
  return getNewsletterSubscribers();
}

export function getNewsletterSubscribers(): string[] {
  const rows = getDb()
    .prepare('SELECT email FROM newsletter ORDER BY subscribed_at ASC')
    .all() as unknown as { email: string }[];
  return rows.map((row) => row.email);
}

export { SETTLEMENT_NETWORKS };

/* -------------------------------------------------------------------------- */
/* Aggregate bootstrap                                                        */
/* -------------------------------------------------------------------------- */

export function getChainInfo(): ChainInfo {
  const wallet = getWallet();
  const cluster = wallet.cluster || getCluster();
  const network =
    cluster === 'mainnet-beta'
      ? 'Solana Mainnet Beta'
      : `Solana ${cluster.charAt(0).toUpperCase()}${cluster.slice(1)}`;

  return {
    programId: getProgramId(),
    cluster,
    network,
    explorerBaseUrl: process.env.VITE_SOLANA_EXPLORER_URL || 'https://explorer.solana.com',
  };
}

export function getDerivedPDAs(
  assetId: string,
  investorKey = '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU'
) {
  return {
    marketplaceConfigPda: deriveMarketplaceConfigPDA(),
    assetOfferingPda: deriveAssetOfferingPDA(assetId),
    tokenVaultPda: deriveTokenVaultPDA(assetId),
    investorPositionPda: deriveInvestorPositionPDA(assetId, investorKey),
    dividendVaultPda: deriveDividendVaultPDA(assetId),
  };
}

export function getBootstrap(): AppBootstrap {
  return {
    assets: getAssets(),
    users: getUsers(),
    currentUser: getCurrentUser(),
    wallet: getWallet(),
    holdings: getHoldings(),
    transactions: getTransactions(),
    portfolio: getPortfolioSummary(),
    watchlistIds: getWatchlist(),
    preferences: readPreferences(),
    marketplace: getMarketplaceSettings(),
    chain: getChainInfo(),
    newsletterSubscribers: getNewsletterSubscribers(),
  };
}

export function resetDemoData(): AppBootstrap {
  resetDatabase();
  return getBootstrap();
}
