import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ShieldCheck, User, Building2, ShieldAlert, ArrowRight, Lock, Sparkles } from 'lucide-react';
import type { UserRole } from '../../types';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { loginAsRole, loginWithEmail, user } = useAuth();
  const { showSuccess } = useToast();
  const [emailInput, setEmailInput] = useState('investor@assetx.demo');

  const handleQuickLogin = (role: UserRole, targetRoute: string) => {
    loginAsRole(role);
    navigate(targetRoute);
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginWithEmail(emailInput)) {
      if (emailInput.includes('admin')) {
        navigate('/admin/dashboard');
      } else if (emailInput.includes('issuer')) {
        navigate('/issuer/dashboard');
      } else {
        navigate('/investor/dashboard');
      }
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-cyan-400 to-emerald-400 p-[2px] mx-auto shadow-xl shadow-cyan-500/20">
          <div className="w-full h-full bg-[#0B1020] rounded-[14px] flex items-center justify-center">
            <span className="font-display font-extrabold text-cyan-400 text-xl">X</span>
          </div>
        </div>
        <h1 className="text-2xl font-bold font-display text-white">
          Sign In to Asset<span className="text-cyan-400">X</span>
        </h1>
        <p className="text-xs text-gray-400">
          Select a pre-configured demo account or enter your credentials.
        </p>
      </div>

      {/* Quick 1-Click Persona Access */}
      <div className="p-5 rounded-2xl bg-[#151D30] border border-[#1E293B] space-y-3 shadow-xl">
        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
          One-Click Demo Personas
        </span>

        <button
          onClick={() => handleQuickLogin('investor', '/investor/dashboard')}
          className="w-full p-3 rounded-xl bg-[#0F1626] hover:bg-[#1A2338] border border-[#22304E] hover:border-blue-500/40 text-left flex items-center justify-between group transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <User className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white group-hover:text-cyan-300 transition-colors">
                Investor Demo
              </p>
              <p className="text-[10px] text-gray-400 font-mono">investor@assetx.demo</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-transform group-hover:translate-x-1" />
        </button>

        <button
          onClick={() => handleQuickLogin('issuer', '/issuer/dashboard')}
          className="w-full p-3 rounded-xl bg-[#0F1626] hover:bg-[#1A2338] border border-[#22304E] hover:border-emerald-500/40 text-left flex items-center justify-between group transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white group-hover:text-emerald-300 transition-colors">
                Asset Issuer / Sponsor Demo
              </p>
              <p className="text-[10px] text-gray-400 font-mono">issuer@assetx.demo</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-transform group-hover:translate-x-1" />
        </button>

        <button
          onClick={() => handleQuickLogin('admin', '/admin/dashboard')}
          className="w-full p-3 rounded-xl bg-[#0F1626] hover:bg-[#1A2338] border border-[#22304E] hover:border-purple-500/40 text-left flex items-center justify-between group transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white group-hover:text-purple-300 transition-colors">
                Platform Admin Demo
              </p>
              <p className="text-[10px] text-gray-400 font-mono">admin@assetx.demo</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-transform group-hover:translate-x-1" />
        </button>
      </div>

      {/* Manual Email Input Form */}
      <form
        onSubmit={handleEmailSubmit}
        className="p-5 rounded-2xl bg-[#151D30] border border-[#1E293B] space-y-4 shadow-xl"
      >
        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
          Or Enter Registered Email
        </span>

        <div>
          <label className="text-xs text-gray-300 block mb-1 font-medium">Work Email Address</label>
          <input
            type="email"
            required
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            className="w-full bg-[#0F1626] border border-[#22304E] rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
          />
        </div>

        <button
          type="submit"
          className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-600/20 transition-all"
        >
          Sign In with Email
        </button>
      </form>

      <div className="text-center text-xs text-gray-500 flex items-center justify-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
        <span>Institutional demo environment. No real password required.</span>
      </div>
    </div>
  );
};
