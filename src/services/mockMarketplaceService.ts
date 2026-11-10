import { getStorageItem, setStorageItem } from '../utils/storage';

export interface MarketplaceSettings {
  feePercent: number;
  minOfferingValuation: number;
  oracleProvider: string;
  settlementNetwork: string;
  isTradingPaused: boolean;
}

const SETTINGS_STORAGE_KEY = 'assetx_marketplace_settings_v1';

export const DEFAULT_MARKETPLACE_SETTINGS: MarketplaceSettings = {
  feePercent: 0.5,
  minOfferingValuation: 1_000_000,
  oracleProvider: 'Solana Token-2022 Compliance Oracle',
  settlementNetwork: 'Solana Mainnet Beta',
  isTradingPaused: false,
};

export const SETTLEMENT_NETWORKS = [
  'Solana Mainnet Beta',
  'Solana Devnet',
  'Solana Testnet',
  'Solana Localnet',
] as const;

export class MockMarketplaceService {
  static getSettings(): MarketplaceSettings {
    const stored = getStorageItem<Partial<MarketplaceSettings> | null>(
      SETTINGS_STORAGE_KEY,
      null
    );
    return { ...DEFAULT_MARKETPLACE_SETTINGS, ...(stored || {}) };
  }

  static saveSettings(settings: MarketplaceSettings): MarketplaceSettings {
    const normalized: MarketplaceSettings = {
      ...settings,
      feePercent: Math.min(5, Math.max(0, Number(settings.feePercent) || 0)),
      minOfferingValuation: Math.max(0, Number(settings.minOfferingValuation) || 0),
      settlementNetwork: settings.settlementNetwork || DEFAULT_MARKETPLACE_SETTINGS.settlementNetwork,
      oracleProvider: settings.oracleProvider.trim() || DEFAULT_MARKETPLACE_SETTINGS.oracleProvider,
    };
    setStorageItem(SETTINGS_STORAGE_KEY, normalized);
    return normalized;
  }

  static updateSettings(patch: Partial<MarketplaceSettings>): MarketplaceSettings {
    return this.saveSettings({ ...this.getSettings(), ...patch });
  }

  /** Protocol fee expressed as a decimal (e.g. 0.5% => 0.005). */
  static getFeeRate(): number {
    return this.getSettings().feePercent / 100;
  }

  static resetToDefault(): MarketplaceSettings {
    setStorageItem(SETTINGS_STORAGE_KEY, DEFAULT_MARKETPLACE_SETTINGS);
    return DEFAULT_MARKETPLACE_SETTINGS;
  }
}
