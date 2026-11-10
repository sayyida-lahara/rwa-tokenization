import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { useWallet } from '../../context/WalletContext';
import { useWatchlist } from '../../context/WatchlistContext';
import { WalletStatusPill } from '../wallet/WalletStatusPill';
import { QuickUserSwitchModal } from '../modals/QuickUserSwitchModal';
import { SolanaProgramInspector } from './SolanaProgramInspector';
import {
  Search,
  Bookmark,
  Layers,
  ChevronDown,
  Menu,
  X,
  UserCheck,
  Building,
  ShieldCheck,
  LogOut,
  LayoutDashboard,
  Sparkles,
  Terminal,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { user, role, loginAsRole } = useAuth();
  const { watchlistIds } = useWatchlist();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPersonaModalOpen, setIsPersonaModalOpen] = useState(false);
  const [isProgramInspectorOpen, setIsProgramInspectorOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const navLinks = [
    { to: '/explore', label: 'Explore' },
    { to: '/category/real-estate', label: 'Real Estate' },
    { to: '/category/commodities', label: 'Commodities' },
    { to: '/category/infrastructure', label: 'Infrastructure' },
    { to: '/how-it-works', label: 'How It Works' },
  ];

  const dashboardRoute =
    role === 'admin'
      ? '/admin/dashboard'
      : role === 'issuer'
      ? '/issuer/dashboard'
      : '/investor/dashboard';

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#0B1020]/90 backdrop-blur-xl border-b border-[#1E293B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-cyan-400 to-emerald-400 p-[1.5px] shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-400/40 transition-shadow">
              <div className="w-full h-full bg-[#0B1020] rounded-[10px] flex items-center justify-center">
                <span className="font-display font-extrabold text-transparent bg-clip-text bg-gradient-to-tr from-cyan-400 to-blue-500 text-lg">
                  X
                </span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-lg text-white tracking-tight group-hover:text-cyan-300 transition-colors">
                Asset<span className="text-cyan-400">X</span>
              </span>
              <span className="text-[9px] uppercase tracking-widest text-gray-400 font-mono -mt-1 font-semibold">
                RWA Protocol
              </span>
            </div>
          </Link>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'text-cyan-300 bg-white/5'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Right Action Icons & Controls */}
          <div className="flex items-center gap-2.5">
            {/* Search Icon button */}
            <button
              onClick={() => navigate('/explore')}
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-[#151D30] border border-transparent hover:border-[#22304E] transition-all"
              title="Search marketplace"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Watchlist Icon with badge */}
            <Link
              to="/investor/watchlist"
              className="relative p-2 rounded-xl text-gray-400 hover:text-white hover:bg-[#151D30] border border-transparent hover:border-[#22304E] transition-all"
              title="View saved assets"
            >
              <Bookmark className="w-4 h-4" />
              {watchlistIds.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-cyan-500 text-[9px] font-bold text-black flex items-center justify-center">
                  {watchlistIds.length}
                </span>
              )}
            </Link>

            {/* Quick Persona Switcher Button */}
            <button
              onClick={() => setIsPersonaModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#151D30] hover:bg-[#1C2640] border border-[#22304E] text-xs font-medium text-gray-300 hover:text-white transition-all shadow-sm"
              title="Switch demo user role"
            >
              <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span className="capitalize">{role}</span>
            </button>

            {/* Lahara Anchor Program Inspector Button */}
            <button
              onClick={() => setIsProgramInspectorOpen(true)}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-xs font-mono text-purple-300 hover:text-white transition-all shadow-sm"
              title="Inspect Lahara Anchor Program, IDL, PDAs & Rust contracts"
            >
              <Terminal className="w-3.5 h-3.5 text-purple-400" />
              <span>Lahara Testnet</span>
            </button>

            {/* Wallet Status / Connect Pill */}
            <WalletStatusPill />

            {/* User Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center gap-1.5 p-1 rounded-xl hover:bg-[#151D30] border border-transparent hover:border-[#22304E] transition-all"
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-lg object-cover border border-[#2A3854]"
                />
                <ChevronDown className="w-3 h-3 text-gray-400 hidden sm:block" />
              </button>

              {isProfileDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-64 bg-[#151D30] border border-[#22304E] rounded-2xl shadow-2xl p-2 z-50 space-y-1 animate-in fade-in"
                  onClick={() => setIsProfileDropdownOpen(false)}
                >
                  <div className="p-2.5 border-b border-[#1E293B] mb-1">
                    <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                    <p className="text-[10px] text-gray-400 truncate">{user.email}</p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                        {user.role}
                      </span>
                      <span className="text-[9px] text-emerald-400 font-mono">
                        {user.kycLevel}
                      </span>
                    </div>
                  </div>

                  <Link
                    to={dashboardRoute}
                    className="flex items-center gap-2 px-3 py-2 text-xs rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition-colors font-medium"
                  >
                    <LayoutDashboard className="w-4 h-4 text-cyan-400" />
                    <span>Go to Dashboard</span>
                  </Link>

                  <button
                    onClick={() => setIsPersonaModalOpen(true)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition-colors font-medium text-left"
                  >
                    <UserCheck className="w-4 h-4 text-purple-400" />
                    <span>Switch Role / Account</span>
                  </button>

                  <Link
                    to="/issuer/tokenize"
                    className="flex items-center gap-2 px-3 py-2 text-xs rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition-colors font-medium"
                  >
                    <Building className="w-4 h-4 text-emerald-400" />
                    <span>Tokenize New Asset</span>
                  </Link>

                  <button
                    onClick={() => setIsProgramInspectorOpen(true)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-xl text-purple-300 hover:bg-purple-500/10 transition-colors font-medium text-left"
                  >
                    <Terminal className="w-4 h-4 text-purple-400" />
                    <span>Lahara Anchor Inspector</span>
                  </button>

                  <div className="border-t border-[#1E293B] pt-1 mt-1">
                    <button
                      onClick={() => loginAsRole('investor')}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-xl text-rose-300 hover:bg-rose-500/10 transition-colors font-medium text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Reset to Investor Demo</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-gray-400 hover:text-white hover:bg-[#151D30]"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-[#0F1626] border-b border-[#1E293B] p-4 space-y-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `block px-4 py-2.5 rounded-xl text-xs font-semibold ${
                    isActive ? 'bg-blue-600/20 text-cyan-300' : 'text-gray-300 hover:bg-white/5'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <div className="pt-2 border-t border-[#1E293B] flex gap-2">
              <button
                onClick={() => {
                  setIsPersonaModalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full py-2 rounded-xl bg-[#151D30] text-xs font-medium text-gray-200"
              >
                Switch Role ({role})
              </button>
            </div>
          </div>
        )}
      </header>

      <QuickUserSwitchModal
        isOpen={isPersonaModalOpen}
        onClose={() => setIsPersonaModalOpen(false)}
      />

      <SolanaProgramInspector
        isOpen={isProgramInspectorOpen}
        onClose={() => setIsProgramInspectorOpen(false)}
      />
    </>
  );
};
