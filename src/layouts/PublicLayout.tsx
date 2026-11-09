import React from 'react';
import { Outlet } from 'react-router';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { InvestModal } from '../components/modals/InvestModal';
import { WalletModal } from '../components/wallet/WalletModal';

export const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#0B1020] text-gray-100 selection:bg-cyan-500 selection:text-black">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <InvestModal />
      <WalletModal />
    </div>
  );
};
