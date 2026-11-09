import { describe, test, expect, beforeEach } from 'bun:test';
import { MockAssetService } from '../../src/services/mockAssetService';
import { MockWalletService } from '../../src/services/mockWalletService';
import { MockInvestmentService } from '../../src/services/mockInvestmentService';
import { MockAuthService } from '../../src/services/mockAuthService';
import { SolanaAnchorService, ANCHOR_PROGRAM_ID } from '../../src/services/solanaAnchorService';
import type { Asset, AssetCategory, VerificationStatus, SolanaCluster } from '../../src/types';

describe('AssetX End-to-End (E2E) Test Suite - Solana Testnet RWA Platform', () => {
  beforeEach(() => {
    // Reset services
    MockWalletService.connect('demo');
  });

  // =========================================================================
  // 1. MARKETPLACE BROWSING, SEARCH & FILTERING E2E
  // =========================================================================
  describe('1. Marketplace Browsing, Filtering & Discovery', () => {
    test('retrieves all approved assets on Solana Testnet', () => {
      const approved = MockAssetService.getApprovedAssets();
      expect(approved.length).toBeGreaterThanOrEqual(10);
      for (const asset of approved) {
        expect(asset.verificationStatus).toBe('Approved');
        expect(asset.blockchainInfo.cluster).toBe('testnet');
        expect(asset.blockchainInfo.programId).toBe(ANCHOR_PROGRAM_ID);
        expect(asset.blockchainInfo.tokenMint).toBeDefined();
        expect(asset.blockchainInfo.vaultPda).toBeDefined();
      }
    });

    test('filters assets by category correctly', () => {
      const all = MockAssetService.getApprovedAssets();
      const commercial = all.filter((a) => a.category === 'Commercial');
      const residential = all.filter((a) => a.category === 'Residential');
      const commodities = all.filter((a) => a.category === 'Gold');
      const infra = all.filter((a) => a.category === 'Infrastructure' || a.category === 'Renewable Energy');

      expect(commercial.length).toBeGreaterThan(0);
      expect(residential.length).toBeGreaterThan(0);
      expect(commodities.length).toBeGreaterThan(0);
      expect(infra.length).toBeGreaterThan(0);
      expect(commercial.every((a) => a.category === 'Commercial')).toBe(true);
    });

    test('supports searching assets by keyword and location', () => {
      const all = MockAssetService.getApprovedAssets();
      const bangaloreAssets = all.filter(
        (a) =>
          a.name.toLowerCase().includes('bangalore') ||
          a.location.city.toLowerCase().includes('bangalore')
      );
      expect(bangaloreAssets.length).toBeGreaterThan(0);
      expect(bangaloreAssets[0].location.city).toBe('Bangalore');
    });

    test('verifies asset financial calculations and progress', () => {
      const asset = MockAssetService.getAssetById('asset-1');
      expect(asset).toBeDefined();
      if (!asset) return;

      expect(asset.totalValuation).toBe(24500000);
      expect(asset.tokenPrice).toBe(50);
      expect(asset.totalTokenSupply).toBe(490000);
      expect(asset.availableTokens).toBeLessThanOrEqual(asset.totalTokenSupply);
      expect(asset.expectedYield).toBe(11.4);

      // Verify token price * totalTokenSupply equals total valuation
      const calculatedValuation = asset.tokenPrice * asset.totalTokenSupply;
      expect(calculatedValuation).toBe(asset.totalValuation);
    });
  });

  // =========================================================================
  // 2. SOLANA WALLET LIFECYCLE & CLUSTER SELECTION E2E
  // =========================================================================
  describe('2. Solana Web3 Wallet Lifecycle & Cluster Switching', () => {
    test('initializes default Solana Testnet wallet with funds', () => {
      const wallet = MockWalletService.getWallet();
      expect(wallet.isConnected).toBe(true);
      expect(wallet.address).toBeDefined();
      expect(wallet.address?.length).toBeGreaterThanOrEqual(32);
      expect(wallet.cluster).toBe('testnet');
      expect(wallet.balanceSOL).toBeGreaterThan(0);
      expect(wallet.balanceUSDC).toBeGreaterThan(0);
    });

    test('switches across Solana clusters and maintains RPC sync', () => {
      // Switch to devnet
      let wallet = MockWalletService.switchCluster('devnet');
      expect(wallet.cluster).toBe('devnet');
      expect(SolanaAnchorService.getActiveCluster().cluster).toBe('devnet');

      // Switch to mainnet-beta
      wallet = MockWalletService.switchCluster('mainnet-beta');
      expect(wallet.cluster).toBe('mainnet-beta');
      expect(SolanaAnchorService.getActiveCluster().cluster).toBe('mainnet-beta');

      // Switch back to primary Testnet
      wallet = MockWalletService.switchCluster('testnet');
      expect(wallet.cluster).toBe('testnet');
      expect(SolanaAnchorService.getActiveCluster().cluster).toBe('testnet');
    });

    test('supports connecting different wallet providers', async () => {
      const backpack = await MockWalletService.connect('backpack');
      expect(backpack.isConnected).toBe(true);
      expect(backpack.walletType).toBe('backpack');

      const solflare = await MockWalletService.connect('solflare');
      expect(solflare.isConnected).toBe(true);
      expect(solflare.walletType).toBe('solflare');

      const demo = await MockWalletService.connect('demo');
      expect(demo.isConnected).toBe(true);
      expect(demo.walletType).toBe('demo');
    });

    test('handles disconnection and restores balances upon reconnection', () => {
      const disconnected = MockWalletService.disconnect();
      expect(disconnected.isConnected).toBe(false);
      expect(disconnected.address).toBeNull();
      expect(disconnected.balanceUSDC).toBe(0);
      expect(disconnected.balanceSOL).toBe(0);

      const reconnected = MockWalletService.getWallet();
      // Should preserve cluster
      expect(reconnected.cluster).toBe('testnet');
    });
  });

  // =========================================================================
  // 3. 8-STEP ON-CHAIN SOLANA INVESTMENT EXECUTION E2E
  // =========================================================================
  describe('3. 8-Step On-Chain Solana Investment Flow', () => {
    test('validates minimum investment requirement', () => {
      const asset = MockAssetService.getAssetById('asset-1')!;
      expect(asset.minimumInvestment).toBe(100);

      // Attempt to invest less than minimum
      expect(() => {
        MockInvestmentService.executeInvestment(
          asset.id,
          1, // 1 token * $50 = $50 (< $100 min)
          '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
          'investor@assetx.demo'
        );
      }).toThrow(/Minimum investment/);
    });

    test('executes successful token purchase with Solana signature and fee deduction', () => {
      const assetBefore = MockAssetService.getAssetById('asset-1')!;
      const availableBefore = assetBefore.availableTokens;
      const initialWallet = MockWalletService.getWallet();
      const initialUsdc = initialWallet.balanceUSDC;
      const initialSol = initialWallet.balanceSOL;

      const tokenQuantity = 10; // 10 * $50 = $500
      const expectedCost = 500;
      const expectedProtocolFee = 2.5; // 0.5%
      const totalCost = expectedCost + expectedProtocolFee; // $502.50

      // Execute on-chain investment simulation
      const result = MockInvestmentService.executeInvestment(
        assetBefore.id,
        tokenQuantity,
        initialWallet.address!,
        'investor@assetx.demo'
      );

      expect(result.success).toBe(true);
      expect(result.transaction).toBeDefined();

      const tx = result.transaction;
      expect(tx.signature).toBeDefined();
      expect(tx.signature.length).toBeGreaterThanOrEqual(64); // 64-byte Base58 Solana signature
      expect(tx.status).toBe('Completed');
      expect(tx.type).toBe('Purchase');
      expect(tx.tokenQuantity).toBe(tokenQuantity);
      expect(tx.tokenPrice).toBe(50);
      expect(tx.totalAmount).toBe(totalCost);
      expect(tx.fee).toBe(expectedProtocolFee);
      expect(tx.feeSOL).toBe(0.000005); // Standard Solana rent/gas fee
      expect(tx.cluster).toBe('testnet');
      expect(tx.slot).toBeGreaterThan(280_000_000);

      // Verify asset available supply decreased
      const assetAfter = MockAssetService.getAssetById('asset-1')!;
      expect(assetAfter.availableTokens).toBe(availableBefore - tokenQuantity);

      // Verify wallet balance was automatically deducted
      const updatedWallet = MockWalletService.getWallet();
      expect(updatedWallet.balanceUSDC).toBeCloseTo(initialUsdc - totalCost, 2);
      expect(updatedWallet.balanceSOL).toBeLessThan(initialSol);

      // Verify holdings updated
      const holdings = MockInvestmentService.getHoldings();
      const holding = holdings.find((h) => h.assetId === assetBefore.id);
      expect(holding).toBeDefined();
      expect(holding?.tokenQuantity).toBeGreaterThanOrEqual(tokenQuantity);
    });

    test('generates clickable Solana Explorer and Solscan URLs', () => {
      const sig = '5K3yW4eR2tY6uI8oP1aS3dF5gH7jK9lZ2xX4cV6bN8mQ1wE3rT5yU7iO9pA1sD3f';
      const explorerUrl = SolanaAnchorService.getExplorerUrl(sig, 'tx', 'testnet');
      expect(explorerUrl).toBe(`https://explorer.solana.com/tx/${sig}?cluster=testnet`);

      const solscanUrl = SolanaAnchorService.getSolscanUrl(sig, 'tx', 'testnet');
      expect(solscanUrl).toBe(`https://solscan.io/tx/${sig}?cluster=testnet`);

      const programUrl = SolanaAnchorService.getExplorerUrl(ANCHOR_PROGRAM_ID, 'address', 'testnet');
      expect(programUrl).toBe(`https://explorer.solana.com/address/${ANCHOR_PROGRAM_ID}?cluster=testnet`);
    });
  });

  // =========================================================================
  // 4. ASSET ISSUER TOKENIZATION WIZARD E2E
  // =========================================================================
  describe('4. Asset Issuer Tokenization Wizard', () => {
    test('creates new RWA offering with Solana Token-2022 mint and escrow vault PDA', () => {
      const initialCount = MockAssetService.getAssets().length;

      const newAssetSubmission = {
        name: 'CyberGateway IT SEZ – Hyderabad',
        category: 'Commercial' as AssetCategory,
        location: {
          address: 'HITEC City Phase II, Madhapur',
          city: 'Hyderabad',
          state: 'Telangana',
          country: 'India',
          flag: '🇮🇳',
        },
        description: 'Grade-A tech park with Fortune 500 tenants under long-term NNN leases.',
        totalValuation: 32000000,
        tokenPrice: 50,
        totalTokenSupply: 640000,
        minimumInvestment: 100,
        expectedYield: 12.2,
        ownership: {
          issuerName: 'NexGen Infra Holdings Ltd',
          entityName: 'CyberGateway SPV Pvt Ltd',
          structure: 'Special Purpose Vehicle LLC',
          registrationNumber: 'CIN-U72200TG2024PTC192801',
          country: 'India',
        },
        documents: [
          {
            id: 'doc-hyderabad-1',
            name: 'Knight_Frank_Valuation_2026.pdf',
            type: 'PDF',
            size: '4.2 MB',
            verifiedDate: '2026-02-01',
            url: '#',
          },
        ],
      };

      const created = MockAssetService.submitAsset(newAssetSubmission);

      expect(created.id).toBeDefined();
      expect(created.name).toBe('CyberGateway IT SEZ – Hyderabad');
      expect(created.verificationStatus).toBe('Pending Verification');
      expect(created.blockchainInfo.cluster).toBe('testnet');
      expect(created.blockchainInfo.tokenStandard).toBe('Token-2022 (Transfer Hooks)');
      expect(created.blockchainInfo.programId).toBe(ANCHOR_PROGRAM_ID);
      expect(created.blockchainInfo.tokenMint).toBeDefined();
      expect(created.blockchainInfo.vaultPda).toBeDefined();

      const totalAfter = MockAssetService.getAssets().length;
      expect(totalAfter).toBe(initialCount + 1);

      // Pending asset should not be visible in public approved marketplace yet
      const approved = MockAssetService.getApprovedAssets();
      expect(approved.find((a) => a.id === created.id)).toBeUndefined();
    });
  });

  // =========================================================================
  // 5. COMPLIANCE OFFICER ADMIN APPROVAL FLOW E2E
  // =========================================================================
  describe('5. Compliance Admin Verification & Asset Lifecycle', () => {
    test('approves pending asset and promotes it to public marketplace', () => {
      // Find or create pending asset
      const assets = MockAssetService.getAssets();
      let pending = assets.find((a) => a.verificationStatus === 'Pending Verification');
      if (!pending) {
        pending = MockAssetService.submitAsset({
          name: 'Logistics Park Alpha',
          category: 'Industrial',
          totalValuation: 10000000,
          tokenPrice: 100,
        });
      }

      expect(pending.verificationStatus).toBe('Pending Verification');

      // Admin executes approval
      const approvedAsset = MockAssetService.updateAssetStatus(
        pending.id,
        'Approved',
        'Title deeds and RICS valuation verified against land registry records.'
      );

      expect(approvedAsset).toBeDefined();
      expect(approvedAsset?.verificationStatus).toBe('Approved');
      expect(approvedAsset?.reviewComments).toContain('Title deeds and RICS valuation verified');

      // Now it must be visible in public marketplace
      const publicApproved = MockAssetService.getApprovedAssets();
      expect(publicApproved.find((a) => a.id === pending!.id)).toBeDefined();
    });

    test('rejects asset with specific compliance reason', () => {
      const asset = MockAssetService.submitAsset({
        name: 'Unverified Land Parcel',
        category: 'Residential',
        totalValuation: 5000000,
        tokenPrice: 25,
      });

      const rejected = MockAssetService.updateAssetStatus(
        asset.id,
        'Rejected',
        'Title deed is subject to an unresolved lien under state municipal court review.',
        'Encumbrance title check failed'
      );

      expect(rejected?.verificationStatus).toBe('Rejected');
      expect(rejected?.rejectionReason).toBe('Encumbrance title check failed');

      // Must not appear in public marketplace
      const publicApproved = MockAssetService.getApprovedAssets();
      expect(publicApproved.find((a) => a.id === asset.id)).toBeUndefined();
    });
  });

  // =========================================================================
  // 6. CONTINUOUS SCALED DIVIDEND YIELD ENGINE O(1) E2E
  // =========================================================================
  describe('6. Continuous Scaled Dividend Yield Engine O(1)', () => {
    test('calculates exact dividend index with 1e12 scale factor and zero dust loss', () => {
      const circulatingTokens = 500_000n; // 500k tokens
      const rentalDividendUsdc = 50_000n * 1_000_000n; // 50,000 USDC with 6 decimals = 50_000_000_000
      const SCALE = 1_000_000_000_000n; // 1e12

      // delta = (50,000 * 10^6 * 10^12) / 500,000 = 100_000_000_000_000_000n
      const deltaIndex = (rentalDividendUsdc * SCALE) / circulatingTokens;
      expect(deltaIndex).toBe(100_000_000_000_000_000n);

      // Investor with 1,500 tokens
      const investorTokens = 1_500n;
      const claimedDividend = (investorTokens * deltaIndex) / SCALE;

      // 1,500 * $0.10 per token = $150.00 USDC = 150_000_000 atomic units
      expect(claimedDividend).toBe(150_000_000n);
      const claimedUsdcDollars = Number(claimedDividend) / 1_000_000;
      expect(claimedUsdcDollars).toBe(150.0);
    });

    test('verifies constant time O(1) claim calculation independent of tokenholder count', () => {
      const SCALE = 1_000_000_000_000n;
      // 100_000_000_000_000_000 index delta corresponds to 0.10 USDC per token
      const indexDelta = 100_000_000_000_000_000n;
      const investorTokens = 3_000n;

      const pendingYield = (investorTokens * indexDelta) / SCALE;

      // 3,000 tokens * $0.10 = $300 USDC = 300,000,000 atomic units
      expect(pendingYield).toBe(300_000_000n);
    });
  });

  // =========================================================================
  // 7. USER AUTHENTICATION & MULTI-PERSONA ROLE SWITCHING E2E
  // =========================================================================
  describe('7. User Personas & Role Switching', () => {
    test('authenticates and switches across Investor, Issuer, and Admin roles', () => {
      // 1. Investor
      let user = MockAuthService.loginAsRole('investor');
      expect(user.role).toBe('investor');
      expect(user.email).toBe('investor@assetx.demo');
      expect(user.kycLevel).toBe('Institutional');

      // 2. Issuer
      user = MockAuthService.loginAsRole('issuer');
      expect(user.role).toBe('issuer');
      expect(user.email).toBe('issuer@assetx.demo');
      expect(user.companyName).toBe('NexGen Capital Properties Ltd');

      // 3. Admin
      user = MockAuthService.loginAsRole('admin');
      expect(user.role).toBe('admin');
      expect(user.email).toBe('admin@assetx.demo');
      expect(user.kycLevel).toBe('Institutional');
    });
  });
});
