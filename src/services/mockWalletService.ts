import type { WalletState, SolanaCluster } from '../types';
import { getStorageItem, setStorageItem } from '../utils/storage';
import { SolanaAnchorService } from './solanaAnchorService';

const WALLET_STORAGE_KEY = 'assetx_solana_wallet_testnet_v3';

const DEFAULT_WALLET: WalletState = {
  isConnected: true,
  address: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
  balanceUSDC: 145250,
  balanceSOL: 42.5,
  cluster: 'testnet',
  walletType: 'phantom',
};

export class MockWalletService {
  static getWallet(): WalletState {
    return getStorageItem<WalletState>(WALLET_STORAGE_KEY, DEFAULT_WALLET);
  }

  static async connect(type: 'phantom' | 'solflare' | 'backpack' | 'demo'): Promise<WalletState> {
    let address = '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU';

    // If running in browser and user selects Phantom/Solflare and window.solana is available:
    if (typeof window !== 'undefined' && type === 'phantom' && (window as any).solana?.isPhantom) {
      try {
        const resp = await (window as any).solana.connect({ onlyIfTrusted: false });
        if (resp && resp.publicKey) {
          address = resp.publicKey.toString();
        }
      } catch {
        // User cancelled or blocked; fallback to default devnet keypair
        address = '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU';
      }
    } else if (typeof window !== 'undefined' && type === 'solflare' && (window as any).solflare) {
      try {
        await (window as any).solflare.connect();
        if ((window as any).solflare.publicKey) {
          address = (window as any).solflare.publicKey.toString();
        }
      } catch {
        address = '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLyNbh96nfcbs';
      }
    } else if (type === 'backpack') {
      address = '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1';
    } else if (type === 'demo') {
      address = '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM';
    }

    const current = this.getWallet();
    const newState: WalletState = {
      isConnected: true,
      address,
      balanceUSDC: 145250,
      balanceSOL: 42.5,
      cluster: current.cluster || 'testnet',
      walletType: type,
    };
    setStorageItem(WALLET_STORAGE_KEY, newState);
    return newState;
  }

  static disconnect(): WalletState {
    const current = this.getWallet();
    const disconnectedState: WalletState = {
      isConnected: false,
      address: null,
      balanceUSDC: 0,
      balanceSOL: 0,
      cluster: current.cluster || 'testnet',
      walletType: null,
    };
    setStorageItem(WALLET_STORAGE_KEY, disconnectedState);
    return disconnectedState;
  }

  static deductBalance(usdcAmount: number): WalletState {
    const current = this.getWallet();
    const updated: WalletState = {
      ...current,
      balanceUSDC: Math.max(0, current.balanceUSDC - usdcAmount),
      balanceSOL: Math.max(0, current.balanceSOL - 0.000005), // Solana transaction gas fee (5000 lamports)
    };
    setStorageItem(WALLET_STORAGE_KEY, updated);
    return updated;
  }

  static switchCluster(cluster: SolanaCluster): WalletState {
    const current = this.getWallet();
    SolanaAnchorService.setCluster(cluster);
    const updated: WalletState = {
      ...current,
      cluster,
    };
    setStorageItem(WALLET_STORAGE_KEY, updated);
    return updated;
  }
}
