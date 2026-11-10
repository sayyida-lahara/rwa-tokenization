import React, { useState } from 'react';
import { Link } from 'react-router';
import { ShieldCheck, ArrowRight, Check, Terminal, ExternalLink } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { SolanaProgramInspector } from './SolanaProgramInspector';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const { showSuccess } = useToast();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      showSuccess('Subscribed to Deal Flow', `Institutional updates will be sent to ${email}`);
      setEmail('');
    }
  };

  return (
    <>
      <footer className="bg-[#080C18] border-t border-[#1E293B] text-gray-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-10">
            {/* Brand Info */}
            <div className="lg:col-span-2 space-y-3">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 via-cyan-400 to-emerald-400 p-[1.5px]">
                  <div className="w-full h-full bg-[#0B1020] rounded-[7px] flex items-center justify-center">
                    <span className="font-display font-bold text-cyan-400 text-sm">X</span>
                  </div>
                </div>
                <span className="font-display font-bold text-white text-base">
                  Asset<span className="text-cyan-400">X</span>
                </span>
              </Link>
              <p className="text-xs text-gray-400 max-w-sm leading-relaxed">
                Institutional protocol for Real World Asset tokenization on Solana. Fractional
                ownership in commercial tech parks, sea-facing residences, Swiss gold vaults, and solar infrastructure.
              </p>

              {/* Newsletter */}
              <form onSubmit={handleSubscribe} className="pt-2 max-w-sm">
                <label className="text-[11px] font-semibold text-gray-300 block mb-1.5">
                  Join Institutional Deal Flow Alerts
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="institutional@fund.com"
                    className="bg-[#151D30] border border-[#22304E] rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 flex-1"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors flex items-center gap-1 shrink-0"
                  >
                    {subscribed ? <Check className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </form>
            </div>

            {/* Marketplace Categories */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider font-display">
                Asset Classes
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link to="/category/real-estate" className="hover:text-cyan-400 transition-colors">
                    Commercial Real Estate
                  </Link>
                </li>
                <li>
                  <Link to="/category/real-estate" className="hover:text-cyan-400 transition-colors">
                    Residential Living
                  </Link>
                </li>
                <li>
                  <Link to="/category/commodities" className="hover:text-cyan-400 transition-colors">
                    Gold & Precious Metals
                  </Link>
                </li>
                <li>
                  <Link to="/category/infrastructure" className="hover:text-cyan-400 transition-colors">
                    Clean Energy Infra
                  </Link>
                </li>
                <li>
                  <Link to="/category/infrastructure" className="hover:text-cyan-400 transition-colors">
                    Maritime Logistics
                  </Link>
                </li>
              </ul>
            </div>

            {/* Stakeholder Portals */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider font-display">
                Portals
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link to="/investor/dashboard" className="hover:text-cyan-400 transition-colors">
                    Investor Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/investor/portfolio" className="hover:text-cyan-400 transition-colors">
                    Portfolio Analytics
                  </Link>
                </li>
                <li>
                  <Link to="/issuer/dashboard" className="hover:text-cyan-400 transition-colors">
                    Issuer Console
                  </Link>
                </li>
                <li>
                  <Link to="/issuer/tokenize" className="hover:text-cyan-400 transition-colors">
                    Tokenize an Asset
                  </Link>
                </li>
                <li>
                  <Link to="/admin/dashboard" className="hover:text-cyan-400 transition-colors">
                    Compliance Admin
                  </Link>
                </li>
              </ul>
            </div>

            {/* Solana Architecture & Blockchain */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider font-display">
                Solana Architecture
              </h4>
              <ul className="space-y-2 text-xs">
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-white font-medium">Solana Testnet</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <span>Anchor Framework v0.30</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  <span>Token-2022 Transfer Hooks</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  <span>400ms Settlement Finality</span>
                </li>
                <li className="pt-1">
                  <button
                    onClick={() => setIsInspectorOpen(true)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[11px] font-mono transition-colors"
                  >
                    <Terminal className="w-3 h-3" />
                    <span>Inspect Anchor Program</span>
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Legal & Regulatory Disclaimer Ribbon */}
          <div className="pt-6 border-t border-[#1E293B] flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-gray-500">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                AssetX Solana RWA Protocol. Built on Solana Testnet with Anchor Rust smart contracts. All assets and token balances are simulated for institutional demonstration.
              </span>
            </div>
            <p>© 2026 AssetX Protocol Ltd. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <SolanaProgramInspector
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
      />
    </>
  );
};
