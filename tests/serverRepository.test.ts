import { describe, test, expect, beforeEach } from 'bun:test';
import {
  getBootstrap,
  getAssets,
  getAssetById,
  submitAsset,
  updateAssetStatus,
  executeInvestment,
  getWallet,
  connectWallet,
  disconnectWallet,
  switchCluster,
  getPortfolioSummary,
  getTransactions,
  getWatchlist,
  toggleWatchlist,
  removeFromWatchlist,
  getMarketplaceSettings,
  saveMarketplaceSettings,
  savePreferences,
  getPreferencesForUser,
  subscribeNewsletter,
  getNewsletterSubscribers,
  getDerivedPDAs,
  resetDemoData,
  ApiError,
} from '../app/server/repository.server';
import { getCluster, getProgramId } from '../app/server/mockChain.server';

describe('AssetX Backend & SQLite Repository - Mock Smart Contract Architecture', () => {
  beforeEach(() => {
    // Reset SQLite database to clean seed state
    resetDemoData();
  });

  describe('1. SQLite Initialization & Bootstrap Hydration', () => {
    test('hydrates initial assets, users, wallet and settings from SQLite', () => {
      const bootstrap = getBootstrap();
      expect(bootstrap.assets.length).toBeGreaterThanOrEqual(10);
      expect(bootstrap.users.length).toBeGreaterThanOrEqual(3);
      expect(bootstrap.currentUser).toBeDefined();
      expect(bootstrap.currentUser.role).toBe('investor');
      expect(bootstrap.wallet.isConnected).toBe(true);
      expect(bootstrap.wallet.balanceUSDC).toBeGreaterThan(0);
      expect(bootstrap.chain.programId).toBe(getProgramId());
      expect(bootstrap.marketplace.feePercent).toBe(0.5);
    });
  });

  describe('2. Issuer Asset Tokenization with Mock Smart Contract Execution', () => {
    test('submits new asset offering, executes mock chain instruction, and persists to SQLite', () => {
      const result = submitAsset({
        name: 'NeoTech Innovation Park',
        category: 'Commercial',
        totalValuation: 18_000_000,
        tokenPrice: 50,
        totalTokenSupply: 360_000,
        minimumInvestment: 100,
        expectedYield: 11.8,
        description: 'Grade-A tech hub in electronic city.',
        submittedBy: 'issuer@assetx.demo',
      });

      expect(result.asset.id).toBeDefined();
      expect(result.asset.verificationStatus).toBe('Pending Verification');
      expect(result.asset.totalValuation).toBe(18_000_000);

      // Verify mock smart-contract receipt generated on backend
      expect(result.chain.instruction).toBe('create_asset_offering');
      expect(result.chain.signature).toBeDefined();
      expect(result.chain.signature.length).toBeGreaterThan(40);
      expect(result.chain.finality).toBe('confirmed');

      // Verify asset persisted in SQLite
      const retrieved = getAssetById(result.asset.id);
      expect(retrieved).toBeDefined();
      expect(retrieved?.name).toBe('NeoTech Innovation Park');
      expect(retrieved?.blockchainInfo.vaultPda).toBeDefined();
      expect(retrieved?.blockchainInfo.tokenMint).toBeDefined();
    });
  });

  describe('3. Compliance Admin Verification in SQLite', () => {
    test('approves pending asset and promotes it to active listing', () => {
      const { asset } = submitAsset({
        name: 'Alpha Logistics Center',
        category: 'Commercial',
        totalValuation: 12_000_000,
        tokenPrice: 40,
      });

      const approved = updateAssetStatus(
        asset.id,
        'Approved',
        'Title deeds and RICS appraisal verified by legal auditor.'
      );

      expect(approved.verificationStatus).toBe('Approved');
      expect(approved.investmentStatus).toBe('Active');
      expect(approved.reviewComments).toContain('Title deeds and RICS appraisal verified');

      // Check SQLite persistence
      const fromDb = getAssetById(asset.id);
      expect(fromDb?.verificationStatus).toBe('Approved');
    });

    test('rejects unverified asset with legal feedback', () => {
      const { asset } = submitAsset({
        name: 'Disputed Farmland',
        category: 'Residential',
        totalValuation: 2_000_000,
        tokenPrice: 20,
      });

      const rejected = updateAssetStatus(
        asset.id,
        'Rejected',
        'Zoning permits incomplete',
        'Title encumbrance'
      );

      expect(rejected.verificationStatus).toBe('Rejected');
      expect(rejected.rejectionReason).toBe('Title encumbrance');

      const fromDb = getAssetById(asset.id);
      expect(fromDb?.verificationStatus).toBe('Rejected');
    });
  });

  describe('4. Investment Execution Flow (Backend + SQLite + Mock Chain)', () => {
    test('executes investment with fee deduction, mock Solana receipt, and SQLite updates', () => {
      const asset = getAssets().find((a) => a.verificationStatus === 'Approved')!;
      const walletBefore = getWallet();
      const initialAvailable = asset.availableTokens;

      const quantity = 5;
      const result = executeInvestment({
        assetId: asset.id,
        quantity,
        userAddress: walletBefore.address || '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
        userEmail: 'investor@assetx.demo',
      });

      // Verify mock smart-contract execution receipt
      expect(result.chain.instruction).toBe('invest_in_asset_offering');
      expect(result.chain.signature).toBeDefined();
      expect(result.chain.slot).toBeGreaterThan(0);

      // Verify SQLite asset token supply decreased
      expect(result.asset.availableTokens).toBe(initialAvailable - quantity);

      // Verify transaction ledger in SQLite
      expect(result.transaction.signature).toBe(result.chain.signature);
      expect(result.transaction.tokenQuantity).toBe(quantity);
      expect(result.transaction.status).toBe('Completed');

      // Verify wallet deduction in SQLite
      const expectedCost = quantity * asset.tokenPrice * 1.005; // 0.5% fee
      expect(result.wallet.balanceUSDC).toBeCloseTo(walletBefore.balanceUSDC - expectedCost, 1);

      // Verify portfolio in SQLite
      const portfolio = getPortfolioSummary();
      const holding = portfolio.holdings.find((h) => h.assetId === asset.id);
      expect(holding).toBeDefined();
      expect(holding?.tokenQuantity).toBeGreaterThanOrEqual(quantity);
    });

    test('enforces minimum ticket requirement', () => {
      const asset = getAssets().find((a) => a.verificationStatus === 'Approved')!;
      expect(() => {
        executeInvestment({
          assetId: asset.id,
          quantity: 0,
          userAddress: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
          userEmail: 'investor@assetx.demo',
        });
      }).toThrow();
    });

    test('enforces emergency circuit breaker pause', () => {
      const asset = getAssets().find((a) => a.verificationStatus === 'Approved')!;

      // Compliance pauses trading
      saveMarketplaceSettings({
        ...getMarketplaceSettings(),
        isTradingPaused: true,
      });

      expect(() => {
        executeInvestment({
          assetId: asset.id,
          quantity: 10,
          userAddress: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
          userEmail: 'investor@assetx.demo',
        });
      }).toThrow('Marketplace trading is currently paused by compliance');
    });
  });

  describe('5. Wallet Lifecycle & Cluster Management in SQLite', () => {
    test('connects and disconnects wallet', () => {
      const disconnected = disconnectWallet();
      expect(disconnected.isConnected).toBe(false);
      expect(disconnected.address).toBeNull();

      const connected = connectWallet('phantom');
      expect(connected.isConnected).toBe(true);
      expect(connected.address).toBeDefined();
      expect(connected.walletType).toBe('phantom');
    });

    test('switches Solana cluster on backend', () => {
      const devnet = switchCluster('devnet');
      expect(devnet.cluster).toBe('devnet');
      expect(getWallet().cluster).toBe('devnet');

      const testnet = switchCluster('testnet');
      expect(testnet.cluster).toBe('testnet');
    });
  });

  describe('6. Watchlist & User Preferences in SQLite', () => {
    test('toggles and removes watchlist items', () => {
      const initialList = getWatchlist();
      const targetId = 'asset-3';

      toggleWatchlist(targetId);
      expect(getWatchlist()).toContain(targetId);

      removeFromWatchlist(targetId);
      expect(getWatchlist()).not.toContain(targetId);
    });

    test('saves and reads user notification preferences', () => {
      const userId = 'user-investor';
      savePreferences(userId, {
        emailAlerts: false,
        dividendAlerts: true,
      });

      const prefs = getPreferencesForUser(userId);
      expect(prefs.emailAlerts).toBe(false);
      expect(prefs.dividendAlerts).toBe(true);
    });
  });

  describe('7. Solana PDA Derivations via Mock Chain Service', () => {
    test('derives valid deterministic Solana PDAs for asset and investor', () => {
      const pdas = getDerivedPDAs('asset-1', '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU');
      expect(pdas.marketplaceConfigPda.pda).toContain('MktCfg');
      expect(pdas.marketplaceConfigPda.bump).toBe(254);
      expect(pdas.assetOfferingPda.pda).toContain('AstOff');
      expect(pdas.tokenVaultPda.pda).toContain('TknVlt');
      expect(pdas.investorPositionPda.pda).toContain('InvPos');
      expect(pdas.dividendVaultPda.pda).toContain('DivVlt');
    });
  });
});
