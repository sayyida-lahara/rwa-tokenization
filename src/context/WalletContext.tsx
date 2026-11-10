import React, { createContext, useContext, useState } from 'react';
import type { WalletState, SolanaCluster } from '../types';
import { useData } from './DataContext';
import { useToast } from './ToastContext';
import { shortenAddress } from '../utils/formatters';

type WalletType = 'phantom' | 'solflare' | 'backpack' | 'demo';

interface WalletContextType {
  wallet: WalletState;
  isWalletModalOpen: boolean;
  openWalletModal: () => void;
  closeWalletModal: () => void;
  connect: (type: WalletType) => Promise<void>;
  disconnect: () => Promise<void>;
  switchCluster: (cluster: SolanaCluster) => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { wallet, connectWallet, disconnectWallet, switchCluster: switchClusterRequest } = useData();
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const { showSuccess, showInfo } = useToast();

  const openWalletModal = () => setIsWalletModalOpen(true);
  const closeWalletModal = () => setIsWalletModalOpen(false);

  const connect = async (type: WalletType) => {
    const updated = await connectWallet(type);
    setIsWalletModalOpen(false);

    const label =
      type === 'phantom'
        ? 'Phantom'
        : type === 'solflare'
        ? 'Solflare'
        : type === 'backpack'
        ? 'Backpack'
        : 'Demo Lahara Keypair';

    showSuccess(
      'Lahara Wallet Connected',
      `${label} (${shortenAddress(updated.address || '', 4)}) connected on Lahara ${updated.cluster.toUpperCase()}`
    );
  };

  const disconnect = async () => {
    await disconnectWallet();
    showInfo('Wallet Disconnected', 'Your Lahara wallet has been disconnected.');
  };

  const switchCluster = async (cluster: SolanaCluster) => {
    await switchClusterRequest(cluster);
    showInfo('Lahara Cluster Switched', `Active Lahara RPC network: ${cluster}`);
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
