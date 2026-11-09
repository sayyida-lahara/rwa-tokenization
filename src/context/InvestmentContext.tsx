import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Asset, Holding, Transaction } from '../types';
import { MockInvestmentService } from '../services/mockInvestmentService';
import { useAuth } from './AuthContext';
import { useWallet } from './WalletContext';
import { useToast } from './ToastContext';
import confetti from 'canvas-confetti';

interface InvestmentContextType {
  holdings: Holding[];
  transactions: Transaction[];
  portfolio: ReturnType<typeof MockInvestmentService.getPortfolioSummary>;
  selectedAssetForInvest: Asset | null;
  isInvestModalOpen: boolean;
  openInvestModal: (asset: Asset) => void;
  closeInvestModal: () => void;
  investInAsset: (assetId: string, quantity: number) => Promise<{ success: boolean; txHash?: string }>;
  refreshData: () => void;
}

const InvestmentContext = createContext<InvestmentContextType | undefined>(undefined);

export const InvestmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [holdings, setHoldings] = useState<Holding[]>(() => MockInvestmentService.getHoldings());
  const [transactions, setTransactions] = useState<Transaction[]>(() => MockInvestmentService.getTransactions());
  const [portfolio, setPortfolio] = useState(() => MockInvestmentService.getPortfolioSummary());
  const [selectedAssetForInvest, setSelectedAssetForInvest] = useState<Asset | null>(null);
  const [isInvestModalOpen, setIsInvestModalOpen] = useState(false);

  const { user } = useAuth();
  const { wallet, deductBalance } = useWallet();
  const { showSuccess, showError } = useToast();

  const refreshData = useCallback(() => {
    setHoldings(MockInvestmentService.getHoldings());
    setTransactions(MockInvestmentService.getTransactions());
    setPortfolio(MockInvestmentService.getPortfolioSummary());
  }, []);

  const openInvestModal = useCallback((asset: Asset) => {
    setSelectedAssetForInvest(asset);
    setIsInvestModalOpen(true);
  }, []);

  const closeInvestModal = useCallback(() => {
    setIsInvestModalOpen(false);
  }, []);

  const investInAsset = async (assetId: string, quantity: number): Promise<{ success: boolean; txHash?: string }> => {
    try {
      const userAddress = wallet.address || user.walletAddress;
      const result = MockInvestmentService.executeInvestment(
        assetId,
        quantity,
        userAddress,
        user.email
      );

      // Deduct wallet state in context
      deductBalance(result.transaction.totalAmount);
      refreshData();

      // Trigger celebratory confetti effect
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#00E5FF', '#10B981', '#3B82F6', '#F59E0B'],
        });
      } catch {
        // Safe fallback if canvas not available
      }

      showSuccess(
        'Investment Confirmed!',
        `Purchased ${quantity} tokens in ${result.transaction.assetName}. Tx: ${result.transaction.txHash.substring(0, 10)}...`
      );

      return { success: true, txHash: result.transaction.txHash };
    } catch (err: any) {
      showError('Investment Failed', err.message || 'An error occurred during order execution.');
      return { success: false };
    }
  };

  return (
    <InvestmentContext.Provider
      value={{
        holdings,
        transactions,
        portfolio,
        selectedAssetForInvest,
        isInvestModalOpen,
        openInvestModal,
        closeInvestModal,
        investInAsset,
        refreshData,
      }}
    >
      {children}
    </InvestmentContext.Provider>
  );
};

export const useInvestment = () => {
  const context = useContext(InvestmentContext);
  if (!context) {
    throw new Error('useInvestment must be used within an InvestmentProvider');
  }
  return context;
};
