import React from 'react';
import { ShieldCheck, Clock, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import type { VerificationStatus, InvestmentStatus } from '../../types';

interface BadgeProps {
  children?: React.ReactNode;
  variant?: 'verified' | 'category' | 'status' | 'outline';
  status?: VerificationStatus | InvestmentStatus | string;
  className?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'category',
  status,
  className = '',
  size = 'md',
}) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  if (variant === 'verified') {
    return (
      <span
        className={`inline-flex items-center gap-1 font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full ${sizeClasses} ${className}`}
      >
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        <span>Verified Asset</span>
      </span>
    );
  }

  if (variant === 'status') {
    let color = 'bg-slate-800 text-slate-300 border-slate-700';
    let icon = null;

    if (status === 'Approved' || status === 'Active' || status === 'Completed') {
      color = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      icon = <CheckCircle2 className="w-3 h-3 text-emerald-400" />;
    } else if (status === 'Pending Verification' || status === 'Under Review' || status === 'Upcoming' || status === 'Pending KYC') {
      color = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      icon = <Clock className="w-3 h-3 text-amber-400" />;
    } else if (status === 'Fully Funded') {
      color = 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      icon = <CheckCircle2 className="w-3 h-3 text-cyan-400" />;
    } else if (status === 'Rejected' || status === 'Suspended' || status === 'Failed') {
      color = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      icon = <XCircle className="w-3 h-3 text-rose-400" />;
    }

    return (
      <span
        className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${color} ${sizeClasses} ${className}`}
      >
        {icon}
        <span>{children || status}</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center font-medium bg-[#1E293B]/80 text-slate-300 border border-[#28354F] rounded-full ${sizeClasses} ${className}`}
    >
      {children}
    </span>
  );
};
