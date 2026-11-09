import React, { createContext, useContext, useState } from 'react';
import type { WalletState, SolanaCluster } from '../types';
import { MockWalletService } from '../services/mockWalletService';
import { useToast } from './ToastContext';
import { shortenAddress } from '../utils/formatters';

interface WalletContextType {
  wallet: WalletState;
  isWalletModalOpen: boolean;
  openWalletModal: () => void;
  closeWalletModal: () => void;
  connect: (type: 'phantom' | 'solflare' | 'backpack' | 'demo') => Promise<void>;
  disconnect: () => void;
  switchCluster: (cluster: SolanaCluster) => void;
  deductBalance: (usdc: number) => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wallet, setWallet] = useState<WalletState>(() => MockWalletService.getWallet());
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const { showSuccess, showInfo } = useToast();

  const openWalletModal = () => setIsWalletModalOpen(true);
  const closeWalletModal = () => setIsWalletModalOpen(false);

  const connect = async (type: 'phantom' | 'solflare' | 'backpack' | 'demo') => {
    const updated = await MockWalletService.connect(type);
    setWallet(updated);
    setIsWalletModalOpen(false);

    const label =
      type === 'phantom'
        ? 'Phantom'
        : type === 'solflare'
        ? 'Solflare'
        : type === 'backpack'
        ? 'Backpack'
        : 'Demo Solana Keypair';

    showSuccess(
      'Solana Wallet Connected',
      `${label} (${shortenAddress(updated.address, 4)}) connected on Solana ${updated.cluster.toUpperCase()}`
    );
  };

  const disconnect = () => {
    const updated = MockWalletService.disconnect();
    setWallet(updated);
    showInfo('Wallet Disconnected', 'Your Solana wallet has been disconnected.');
  };

  const switchCluster = (cluster: SolanaCluster) => {
    const updated = MockWalletService.switchCluster(cluster);
    setWallet(updated);
    showInfo('Solana Cluster Switched', `Active Solana RPC network: ${cluster}`);
  };

  const deductBalance = (usdc: number) => {
    const updated = MockWalletService.deductBalance(usdc);
    setWallet(updated);
  };

  return (
    <WalletContext.Provider
      value={{
        wallet,
        isWalletModalOpen,
        openWalletModal,
        closeWalletModal,
        connect,
        disconnect,
        switchCluster,
        deductBalance,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
