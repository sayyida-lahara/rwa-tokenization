import React, { useState } from 'react';
import { Outlet } from 'react-router';
import { Navbar } from '../components/common/Navbar';
import { Sidebar } from '../components/dashboard/Sidebar';
import { InvestModal } from '../components/modals/InvestModal';
import { WalletModal } from '../components/wallet/WalletModal';
import { QuickUserSwitchModal } from '../components/modals/QuickUserSwitchModal';
import { Menu, X } from 'lucide-react';

export const InvestorLayout: React.FC = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isPersonaModalOpen, setIsPersonaModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#0B1020] text-gray-100">
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block shrink-0">
          <Sidebar
            type="investor"
            onOpenPersonaModal={() => setIsPersonaModalOpen(true)}
          />
        </div>

        {/* Mobile Sidebar Overlay */}
        {isMobileSidebarOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            <div className="relative w-64 bg-[#0F1626] h-full shadow-2xl flex flex-col">
              <div className="p-3 border-b border-[#1E293B] flex justify-between items-center">
                <span className="text-xs font-semibold text-white">Investor Menu</span>
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="p-1 text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <Sidebar
                  type="investor"
                  onOpenPersonaModal={() => {
                    setIsPersonaModalOpen(true);
                    setIsMobileSidebarOpen(false);
                  }}
                  onCloseMobile={() => setIsMobileSidebarOpen(false)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          {/* Mobile sub-header with sidebar trigger */}
          <div className="lg:hidden flex items-center justify-between pb-4 mb-4 border-b border-[#1E293B]">
            <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
              Investor Portal
            </span>
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#151D30] border border-[#22304E] text-xs text-white"
            >
              <Menu className="w-3.5 h-3.5" />
              <span>Portal Navigation</span>
            </button>
          </div>

          <Outlet />
        </main>
      </div>

      <InvestModal />
      <WalletModal />
      <QuickUserSwitchModal
        isOpen={isPersonaModalOpen}
        onClose={() => setIsPersonaModalOpen(false)}
      />
    </div>
  );
};
