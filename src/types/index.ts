export type AssetCategory =
  | 'Residential'
  | 'Commercial'
  | 'Industrial'
  | 'Gold'
  | 'Infrastructure'
  | 'Renewable Energy';

export type VerificationStatus = 'Approved' | 'Pending Verification' | 'Rejected' | 'Under Review';

export type InvestmentStatus = 'Active' | 'Fully Funded' | 'Upcoming' | 'Closed';

export type SolanaCluster = 'mainnet-beta' | 'devnet' | 'testnet' | 'localnet';

export interface LocationInfo {
  address: string;
  city: string;
  state: string;
  country: string;
  flag: string;
}

export interface OwnershipInfo {
  issuerName: string;
  entityName: string;
  structure: string;
  registrationNumber: string;
  country: string;
  supportingInfo?: string;
}

export interface FinancialInfo {
  grossAnnualRentalIncome: number;
  netOperatingIncome: number;
  propertyManagementFeePercent: number;
  capitalAppreciationEstimate: number;
  dividendFrequency: 'Monthly' | 'Quarterly' | 'Annually';
  nextDistributionDate: string;
}

export interface DocumentItem {
  id: string;
  name: string;
  type: string;
  size: string;
  verifiedDate: string;
  url: string;
}

export interface BlockchainInfo {
  tokenSymbol: string;
  tokenStandard: 'Solana SPL Token' | 'Token-2022 (Transfer Hooks)';
  network: string;
  cluster: SolanaCluster;
  programId: string;
  tokenMint: string;
  vaultPda: string;
  complianceAuditor: string;
  treasuryCustodian: string;
}

export interface ValuationPoint {
  date: string;
  valuation: number;
  tokenPrice: number;
}

export interface TokenDistributionSlice {
  name: string;
  percentage: number;
  tokens: number;
  color: string;
}

export interface Asset {
  id: string;
  name: string;
  tagLine: string;
  category: AssetCategory;
  subcategory: string;
  location: LocationInfo;
  description: string;
  highlights: string[];
  images: string[];
  totalValuation: number;
  tokenPrice: number;
  totalTokenSupply: number;
  availableTokens: number;
  minimumInvestment: number; // in USD
  expectedYield: number; // % e.g. 11.4
  verificationStatus: VerificationStatus;
  investmentStatus: InvestmentStatus;
  listingDate: string;
  fundingProgress: number; // 0 - 100
  ownership: OwnershipInfo;
  specifications: Record<string, string | number>;
  financialInfo: FinancialInfo;
  documents: DocumentItem[];
  blockchainInfo: BlockchainInfo;
  valuationHistory: ValuationPoint[];
  tokenDistribution: TokenDistributionSlice[];
  isFeatured?: boolean;
  rejectionReason?: string;
  reviewComments?: string;
  submittedBy?: string;
  submittedAt?: string;
}

export type TransactionType = 'Purchase' | 'Sale' | 'Distribution' | 'Tokenize';
export type TransactionStatus = 'Completed' | 'Pending' | 'Failed';

export interface Transaction {
  id: string;
  txHash: string; // Solana tx signature
  signature: string;
  slot?: number;
  timestamp: string;
  assetId: string;
  assetName: string;
  assetImage: string;
  type: TransactionType;
  tokenQuantity: number;
  tokenPrice: number;
  totalAmount: number;
  fee: number;
  feeSOL: number;
  status: TransactionStatus;
  userAddress: string; // Base58
  userEmail: string;
  cluster: SolanaCluster;
}

export interface Holding {
  assetId: string;
  tokenQuantity: number;
  averagePurchasePrice: number;
  totalInvested: number;
  firstPurchasedAt: string;
  lastPurchasedAt: string;
}

export type UserRole = 'investor' | 'issuer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  walletAddress: string; // Base58 public key
  avatar: string;
  accountStatus: 'Active' | 'Suspended' | 'Pending KYC';
  registeredAt: string;
  kycLevel: 'Tier 1' | 'Tier 2' | 'Institutional';
  phone?: string;
  companyName?: string;
}

export interface WalletState {
  isConnected: boolean;
  address: string | null; // Base58
  balanceUSDC: number;
  balanceSOL: number;
  cluster: SolanaCluster;
  walletType: 'phantom' | 'solflare' | 'backpack' | 'demo' | null;
}

export interface PortfolioHolding extends Holding {
  asset?: Asset;
  currentValue: number;
  gainLoss: number;
  gainLossPercent: number;
}

export interface PortfolioSummary {
  totalPortfolioValue: number;
  totalInvested: number;
  totalAssetsOwned: number;
  totalTokensHeld: number;
  netGain: number;
  overallReturnPercent: number;
  holdings: PortfolioHolding[];
}

export interface UserPreferences {
  emailAlerts: boolean;
  dividendAlerts: boolean;
}

export interface MarketplaceSettings {
  feePercent: number;
  minOfferingValuation: number;
  oracleProvider: string;
  settlementNetwork: string;
  isTradingPaused: boolean;
}

export interface ChainReceipt {
  signature: string;
  slot: number;
  confirmationTimeMs: number;
  cluster: SolanaCluster;
  programId: string;
  instruction: string;
  finality: 'processed' | 'confirmed' | 'finalized';
}

export interface ChainInfo {
  programId: string;
  cluster: SolanaCluster;
  network: string;
  explorerBaseUrl: string;
}

export interface AppBootstrap {
  assets: Asset[];
  users: User[];
  currentUser: User;
  wallet: WalletState;
  holdings: Holding[];
  transactions: Transaction[];
  portfolio: PortfolioSummary;
  watchlistIds: string[];
  preferences: Record<string, UserPreferences>;
  marketplace: MarketplaceSettings;
  chain: ChainInfo;
  newsletterSubscribers: string[];
}

export interface InvestmentExecutionResult {
  asset: Asset;
  transaction: Transaction;
  holding: Holding;
  wallet: WalletState;
  portfolio: PortfolioSummary;
  chain: ChainReceipt;
}

export interface FilterState {
  searchQuery: string;
  category: string;
  minInvestment: number;
  maxInvestment: number;
  minValuation: number;
  maxValuation: number;
  location: string;
  investmentStatus: string;
  verificationStatus: string;
  sortBy: 'recently_listed' | 'lowest_price' | 'highest_price' | 'highest_valuation' | 'most_popular';
  viewMode: 'grid' | 'list';
}
