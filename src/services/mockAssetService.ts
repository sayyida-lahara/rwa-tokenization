import type { Asset, VerificationStatus } from '../types';
import { INITIAL_ASSETS } from '../data/mockAssets';
import { getStorageItem, setStorageItem } from '../utils/storage';
import { generateSolanaPublicKey, SolanaAnchorService } from './solanaAnchorService';

const ASSETS_STORAGE_KEY = 'assetx_solana_assets_testnet_v3';

export class MockAssetService {
  private static init(): Asset[] {
    const existing = getStorageItem<Asset[] | null>(ASSETS_STORAGE_KEY, null);
    if (!existing || existing.length === 0) {
      setStorageItem(ASSETS_STORAGE_KEY, INITIAL_ASSETS);
      return INITIAL_ASSETS;
    }
    return existing;
  }

  static getAssets(): Asset[] {
    return this.init();
  }

  static getApprovedAssets(): Asset[] {
    const assets = this.getAssets();
    return assets.filter((a) => a.verificationStatus === 'Approved');
  }

  static getAssetById(id: string): Asset | undefined {
    const assets = this.getAssets();
    return assets.find((a) => a.id === id);
  }

  static getAssetsByCategory(category: string): Asset[] {
    const assets = this.getApprovedAssets();
    return assets.filter(
      (a) => a.category.toLowerCase() === category.toLowerCase()
    );
  }

  static submitAsset(data: Partial<Asset> & { name: string; category: any; totalValuation: number }): Asset {
    const assets = this.getAssets();
    const newId = `asset-sub-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const tokenPrice = data.tokenPrice || (data.totalTokenSupply ? data.totalValuation / data.totalTokenSupply : 50);
    const totalTokenSupply = data.totalTokenSupply || Math.round(data.totalValuation / tokenPrice);

    const tokenMint = generateSolanaPublicKey('Mint');
    const vaultPda = SolanaAnchorService.deriveTokenVaultPDA(newId).pda;

    const newAsset: Asset = {
      id: newId,
      name: data.name,
      tagLine: data.tagLine || 'Newly tokenized institutional asset awaiting Solana Anchor verification',
      category: data.category,
      subcategory: data.subcategory || `${data.category} Project`,
      location: data.location || {
        address: 'Prime Commercial District',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        flag: '🇮🇳',
      },
      description: data.description || 'Verified tokenized real-world investment opportunity on Solana Anchor.',
      highlights: data.highlights && data.highlights.length > 0 ? data.highlights : [
        'Institutional Grade Asset Architecture',
        'Independent third-party appraisal on file',
        'Tokenized SPV legal custody in place',
        'Anchor Rust Program Verified on Solana',
      ],
      images: data.images && data.images.length > 0 ? data.images : [
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
      ],
      totalValuation: data.totalValuation,
      tokenPrice: tokenPrice,
      totalTokenSupply: totalTokenSupply,
      availableTokens: totalTokenSupply,
      minimumInvestment: data.minimumInvestment || tokenPrice * 2,
      expectedYield: data.expectedYield || 10.5,
      verificationStatus: 'Pending Verification',
      investmentStatus: 'Upcoming',
      listingDate: new Date().toISOString().split('T')[0],
      fundingProgress: 0,
      ownership: data.ownership || {
        issuerName: 'Demo Asset Issuer',
        entityName: `${data.name} SPV Ltd`,
        structure: 'Special Purpose Vehicle LLC',
        registrationNumber: `REG-${Math.floor(100000 + Math.random() * 900000)}`,
        country: 'India',
      },
      specifications: data.specifications || {
        'Asset Class': data.category,
        'Valuation Standard': 'RICS / IVS compliant',
        'Custodian': 'Institutional Trust Services',
        'Settlement': 'Solana Anchor Program',
      },
      financialInfo: data.financialInfo || {
        grossAnnualRentalIncome: Math.round(data.totalValuation * 0.11),
        netOperatingIncome: Math.round(data.totalValuation * 0.102),
        propertyManagementFeePercent: 4.0,
        capitalAppreciationEstimate: 6.5,
        dividendFrequency: 'Monthly',
        nextDistributionDate: '2026-12-01',
      },
      documents: data.documents && data.documents.length > 0 ? data.documents : [
        { id: `doc-${Date.now()}-1`, name: 'Asset Valuation Deed', type: 'PDF', size: '3.8 MB', verifiedDate: new Date().toISOString().split('T')[0], url: '#' },
        { id: `doc-${Date.now()}-2`, name: 'SPV Ownership Certificate', type: 'PDF', size: '2.4 MB', verifiedDate: new Date().toISOString().split('T')[0], url: '#' },
      ],
      blockchainInfo: data.blockchainInfo || {
        tokenSymbol: data.name.substring(0, 4).toUpperCase() + '-X',
        tokenStandard: 'Token-2022 (Transfer Hooks)',
        network: 'Solana',
        cluster: 'testnet',
        programId: SolanaAnchorService.getProgramId(),
        tokenMint,
        vaultPda,
        complianceAuditor: 'Securitize ONCHAINID / Solana Token-2022',
        treasuryCustodian: 'BitGo Institutional Custody (Solana)',
      },
      valuationHistory: [
        { date: 'Initial Listing', valuation: data.totalValuation, tokenPrice: tokenPrice },
      ],
      tokenDistribution: [
        { name: 'Public Token Sale', percentage: 70, tokens: Math.round(totalTokenSupply * 0.7), color: '#3B82F6' },
        { name: 'Sponsor Stake', percentage: 20, tokens: Math.round(totalTokenSupply * 0.2), color: '#10B981' },
        { name: 'Reserve', percentage: 10, tokens: Math.round(totalTokenSupply * 0.1), color: '#00E5FF' },
      ],
      submittedBy: data.submittedBy || 'issuer@assetx.demo',
      submittedAt: new Date().toISOString(),
    };

    const updated = [newAsset, ...assets];
    setStorageItem(ASSETS_STORAGE_KEY, updated);
    return newAsset;
  }

  static updateAssetStatus(
    id: string,
    status: VerificationStatus,
    reviewComments?: string,
    rejectionReason?: string
  ): Asset | null {
    const assets = this.getAssets();
    const index = assets.findIndex((a) => a.id === id);
    if (index === -1) return null;

    const current = assets[index];
    const updated: Asset = {
      ...current,
      verificationStatus: status,
      investmentStatus: status === 'Approved' ? 'Active' : current.investmentStatus,
      reviewComments: reviewComments ?? current.reviewComments,
      rejectionReason: rejectionReason ?? current.rejectionReason,
    };

    assets[index] = updated;
    setStorageItem(ASSETS_STORAGE_KEY, assets);
    return updated;
  }

  static updateAssetTokens(id: string, quantityPurchased: number): Asset | null {
    const assets = this.getAssets();
    const index = assets.findIndex((a) => a.id === id);
    if (index === -1) return null;

    const current = assets[index];
    const newAvailable = Math.max(0, current.availableTokens - quantityPurchased);
    const tokensSold = current.totalTokenSupply - newAvailable;
    const progress = Math.min(100, Math.round((tokensSold / current.totalTokenSupply) * 100));

    const updated: Asset = {
      ...current,
      availableTokens: newAvailable,
      fundingProgress: progress,
      investmentStatus: newAvailable === 0 ? 'Fully Funded' : current.investmentStatus,
    };

    assets[index] = updated;
    setStorageItem(ASSETS_STORAGE_KEY, assets);
    return updated;
  }

  static resetToDefault(): void {
    setStorageItem(ASSETS_STORAGE_KEY, INITIAL_ASSETS);
  }
}
