import React from 'react';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { WalletProvider } from './context/WalletContext';
import { InvestmentProvider } from './context/InvestmentContext';
import { WatchlistProvider } from './context/WatchlistContext';

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ToastProvider>
      <AuthProvider>
        <WalletProvider>
          <InvestmentProvider>
            <WatchlistProvider>
              {children}
            </WatchlistProvider>
          </InvestmentProvider>
        </WalletProvider>
      </AuthProvider>
    </ToastProvider>
  );
};

export default AppProviders;
