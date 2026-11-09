import React from 'react';
import { NavLink, Link } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { useWallet } from '../../context/WalletContext';
import { shortenAddress, formatCurrency } from '../../utils/formatters';
import {
  LayoutDashboard,
  Wallet,
  PieChart,
  History,
  Bookmark,
  Settings,
  PlusCircle,
  FileCheck,
  Building,
  Users,
  ShieldCheck,
  Sliders,
  UserCheck,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

interface SidebarItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  badge?: string | number;
}

interface SidebarProps {
  type: 'investor' | 'issuer' | 'admin';
  onOpenPersonaModal?: () => void;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  type,
  onOpenPersonaModal,
  onCloseMobile,
}) => {
  const { user, role } = useAuth();
  const { wallet } = useWallet();

  const investorItems: SidebarItem[] = [
    { to: '/investor/dashboard', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { to: '/investor/investments', label: 'My Investments', icon: <Building className="w-4 h-4" /> },
    { to: '/investor/portfolio', label: 'Portfolio Analytics', icon: <PieChart className="w-4 h-4" /> },
    { to: '/investor/transactions', label: 'Transactions', icon: <History className="w-4 h-4" /> },
    { to: '/investor/watchlist', label: 'Watchlist', icon: <Bookmark className="w-4 h-4" /> },
    { to: '/investor/settings', label: 'Profile Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  const issuerItems: SidebarItem[] = [
    { to: '/issuer/dashboard', label: 'Issuer Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { to: '/issuer/tokenize', label: 'Tokenize an Asset', icon: <PlusCircle className="w-4 h-4" /> },
    { to: '/issuer/assets', label: 'My Listed Assets', icon: <Building className="w-4 h-4" /> },
    { to: '/issuer/status', label: 'Submission Status', icon: <FileCheck className="w-4 h-4" /> },
  ];

  const adminItems: SidebarItem[] = [
    { to: '/admin/dashboard', label: 'Admin Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { to: '/admin/verification', label: 'Asset Verification', icon: <ShieldCheck className="w-4 h-4" /> },
    { to: '/admin/users', label: 'User Management', icon: <Users className="w-4 h-4" /> },
    { to: '/admin/marketplace', label: 'Marketplace Config', icon: <Sliders className="w-4 h-4" /> },
  ];

  const items = type === 'investor' ? investorItems : type === 'issuer' ? issuerItems : adminItems;

  const roleLabels = {
    investor: { title: 'Investor Portal', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
    issuer: { title: 'Issuer Console', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    admin: { title: 'Admin Command', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
  }[type];

  return (
    <aside className="w-64 bg-[#0F1626] border-r border-[#1E293B] min-h-[calc(100vh-4rem)] flex flex-col justify-between shrink-0">
      <div className="p-4 space-y-5">
        {/* Portal Header */}
        <div className="p-3 rounded-xl bg-[#151D30] border border-[#22304E] flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Portal</span>
            <h4 className="text-sm font-semibold text-white font-display">{roleLabels.title}</h4>
          </div>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${roleLabels.color}`}>
            {type.toUpperCase()}
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(0,229,255,0.15)]'
                    : 'text-gray-400 hover:text-white hover:bg-[#151D30]'
                }`
              }
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Footer / Switcher info */}
      <div className="p-4 border-t border-[#1E293B] space-y-3 bg-[#0B1020]/50">
        {/* Current user & wallet status */}
        <div className="flex items-center gap-2.5 p-2 rounded-xl bg-[#151D30] border border-[#1E293B]">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-8 h-8 rounded-lg object-cover border border-[#22304E]"
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-white truncate">{user.name}</p>
            <p className="text-[10px] font-mono text-cyan-400 truncate">
              {shortenAddress(wallet.address || user.walletAddress, 3)}
            </p>
          </div>
        </div>

        {/* Quick Switch Button */}
        {onOpenPersonaModal && (
          <button
            onClick={onOpenPersonaModal}
            className="w-full py-2 px-3 rounded-xl border border-[#2A3854] hover:border-cyan-400 text-gray-300 hover:text-white text-xs font-semibold flex items-center justify-between bg-[#131B2E] transition-all"
          >
            <div className="flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Switch Persona</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          </button>
        )}

        <Link
          to="/explore"
          className="flex items-center justify-center gap-1 text-[11px] text-gray-400 hover:text-cyan-400 transition-colors pt-1"
        >
          <span>Back to Marketplace</span>
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>
    </aside>
  );
};
