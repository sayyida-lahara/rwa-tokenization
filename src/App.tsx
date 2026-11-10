import React from 'react';
import type { AppBootstrap } from './types';
import { ToastProvider } from './context/ToastContext';
import { DataProvider } from './context/DataContext';
import { AuthProvider } from './context/AuthContext';
import { WalletProvider } from './context/WalletContext';
import { InvestmentProvider } from './context/InvestmentContext';
import { WatchlistProvider } from './context/WatchlistContext';

export const AppProviders: React.FC<{
  initialData: AppBootstrap;
  children: React.ReactNode;
}> = ({ initialData, children }) => {
  return (
    <ToastProvider>
      <DataProvider initialData={initialData}>
        <AuthProvider>
          <WalletProvider>
            <InvestmentProvider>
              <WatchlistProvider>{children}</WatchlistProvider>
            </InvestmentProvider>
          </WalletProvider>
        </AuthProvider>
      </DataProvider>
    </ToastProvider>
  );
};

export default AppProviders;
