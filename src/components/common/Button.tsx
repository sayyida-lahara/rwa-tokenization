import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'emerald' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
    md: 'px-4 py-2 text-sm rounded-xl gap-2',
    lg: 'px-6 py-3 text-base rounded-xl font-semibold gap-2.5',
  }[size];

  const variantClasses = {
    primary:
      'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/25 border border-blue-500/30 hover:border-blue-400 active:scale-[0.98]',
    secondary:
      'bg-[#1E293B] hover:bg-[#28354F] text-white border border-[#2B3956] active:scale-[0.98]',
    emerald:
      'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 border border-emerald-500/30 active:scale-[0.98]',
    outline:
      'bg-transparent hover:bg-white/5 text-gray-200 hover:text-white border border-[#2A3854] hover:border-blue-400/50 active:scale-[0.98]',
    ghost:
      'bg-transparent hover:bg-white/5 text-gray-300 hover:text-white active:scale-[0.98]',
    danger:
      'bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 active:scale-[0.98]',
  }[variant];

  return (
    <button
      className={`inline-flex items-center justify-center font-medium transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none ${sizeClasses} ${variantClasses} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-current" /> : icon}
      <span>{children}</span>
    </button>
  );
};
