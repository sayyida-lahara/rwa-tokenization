import React from 'react';
import { Modal } from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../types';
import { UserCheck, ShieldAlert, Building2, User, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router';

interface QuickUserSwitchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickUserSwitchModal: React.FC<QuickUserSwitchModalProps> = ({ isOpen, onClose }) => {
  const { user, role, loginAsRole } = useAuth();
  const navigate = useNavigate();

  const rolesConfig: Array<{
    role: UserRole;
    title: string;
    description: string;
    email: string;
    route: string;
    icon: React.ReactNode;
    color: string;
  }> = [
    {
      role: 'investor',
      title: 'Institutional Investor',
      description: 'Browse assets, invest USDC, monitor portfolio, view dividend distributions.',
      email: 'investor@assetx.demo',
      route: '/investor/dashboard',
      icon: <User className="w-5 h-5" />,
      color: 'border-blue-500/40 text-blue-400 bg-blue-500/10',
    },
    {
      role: 'issuer',
      title: 'Asset Issuer / Sponsor',
      description: 'Submit real-world assets for tokenization, track listing status, manage offerings.',
      email: 'issuer@assetx.demo',
      route: '/issuer/dashboard',
      icon: <Building2 className="w-5 h-5" />,
      color: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10',
    },
    {
      role: 'admin',
      title: 'Platform Compliance Admin',
      description: 'Review asset submissions, approve/reject offerings, audit users & marketplace.',
      email: 'admin@assetx.demo',
      route: '/admin/dashboard',
      icon: <ShieldAlert className="w-5 h-5" />,
      color: 'border-purple-500/40 text-purple-400 bg-purple-500/10',
    },
  ];

  const handleSelectRole = (targetRole: UserRole, targetRoute: string) => {
    loginAsRole(targetRole);
    onClose();
    navigate(targetRoute);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-cyan-400" />
          <div>
            <h3 className="text-base font-semibold text-white font-display">Switch Demo Persona</h3>
            <p className="text-xs text-gray-400">Experience AssetX from different stakeholder perspectives</p>
          </div>
        </div>
      }
      maxWidth="md"
    >
      <div className="space-y-3">
        {rolesConfig.map((item) => {
          const isActive = role === item.role;
          return (
            <div
              key={item.role}
              onClick={() => handleSelectRole(item.role, item.route)}
              className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                isActive
                  ? 'bg-blue-900/20 border-cyan-400/60 shadow-[0_0_15px_rgba(0,229,255,0.15)]'
                  : 'bg-[#0F1626] border-[#1E293B] hover:border-[#2D3F65] hover:bg-[#151E33]'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className={`p-2.5 rounded-xl border shrink-0 ${item.color}`}>
                  {item.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-white font-display flex items-center gap-2">
                      <span>{item.title}</span>
                      {isActive && (
                        <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/40 font-mono">
                          Current Persona
                        </span>
                      )}
                    </h4>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">{item.description}</p>
                  <div className="flex items-center gap-3 mt-2 text-[11px] font-mono text-gray-400">
                    <span>{item.email}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Modal>
  );
};
