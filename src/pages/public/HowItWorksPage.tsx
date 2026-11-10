import React from 'react';
import { Link } from 'react-router';
import {
  ShieldCheck,
  FileText,
  Lock,
  Cpu,
  TrendingUp,
  Building,
  CheckCircle2,
  ArrowRight,
  Layers,
  Coins,
} from 'lucide-react';

export const HowItWorksPage: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Institutional Asset Sourcing & Due Diligence',
      desc: 'Top-tier commercial properties, gold reserves, and renewable infrastructure are sourced from established institutional developers. Every asset undergoes title verification and independent valuation by CBRE, Savills, or Knight Frank.',
      icon: <Building className="w-6 h-6 text-blue-400" />,
    },
    {
      num: '02',
      title: 'SPV Structuring & Legal Custody',
      desc: 'Each physical asset is transferred into a standalone Special Purpose Vehicle (SPV) or bankruptcy-remote trust. Title deeds and vault warrants are locked with regulated custodians like Apex Trust.',
      icon: <FileText className="w-6 h-6 text-emerald-400" />,
    },
    {
      num: '03',
      title: 'Lahara Anchor Tokenization & Transfer Hooks',
      desc: 'Equity in the SPV is tokenized using Lahara Token-2022 with Transfer Hooks on Lahara Testnet. Smart contract instructions executed via Rust Anchor programs enforce instant compliance, zero-custody vault escrow, and atomic settlement.',
      icon: <Cpu className="w-6 h-6 text-cyan-400" />,
    },
    {
      num: '04',
      title: 'Fractional Primary Offering',
      desc: 'Investors browse verified offerings, review prospectus documents and financial models, and purchase fractional tokens starting at $50 using USDC or connected Web3 wallets.',
      icon: <Coins className="w-6 h-6 text-amber-400" />,
    },
    {
      num: '05',
      title: 'Automated Secondary Settlement & Custody',
      desc: 'Holders retain fractional title rights and liquidity with on-chain cryptographic proof of ownership, verifiable against custodian registry records.',
      icon: <TrendingUp className="w-6 h-6 text-purple-400" />,
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Page Header */}
      <div className="text-center space-y-4">
        <span className="text-xs font-semibold text-cyan-400 uppercase tracking-widest bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/30">
          Platform Architecture
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold font-display text-white tracking-tight">
          How Real World Asset Tokenization Works
        </h1>
        <p className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto leading-relaxed">
          Bridging real-world assets with Web3 financial rails to create institutional liquidity,
          transparent custody, and fractional ownership for global investors.
        </p>
      </div>

      {/* The 5-Step Process Cards */}
      <div className="space-y-4">
        {steps.map((s, idx) => (
          <div
            key={s.num}
            className="p-6 rounded-2xl bg-[#151D30] border border-[#1E293B] hover:border-cyan-500/40 transition-all flex flex-col md:flex-row items-start gap-6 shadow-xl group"
          >
            <div className="p-3.5 rounded-2xl bg-[#0F1626] border border-[#22304E] shrink-0 group-hover:scale-110 transition-transform">
              {s.icon}
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">
                  STAGE {s.num}
                </span>
                <h3 className="text-lg font-bold font-display text-white">{s.title}</h3>
              </div>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Legal & Security Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        <div className="p-6 rounded-2xl bg-[#151D30] border border-[#1E293B] space-y-3">
          <div className="flex items-center gap-2 text-cyan-400">
            <ShieldCheck className="w-5 h-5" />
            <h3 className="font-display font-bold text-white text-base">Legal SPV Ring-Fencing</h3>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed">
            Every tokenized project exists as an isolated Special Purpose Vehicle (SPV). If the developer
            or platform experiences financial stress, the asset remains bankruptcy-remote and tokenholders
            retain 100% legal claim to the property title deeds.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#151D30] border border-[#1E293B] space-y-3">
          <div className="flex items-center gap-2 text-emerald-400">
            <Lock className="w-5 h-5" />
            <h3 className="font-display font-bold text-white text-base">Regulated Permissioned Tokens</h3>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed">
            Unlike anonymous utility tokens, ERC-3643 tokens embed compliance rules directly at the smart
            contract level. Tokens can only be transferred between KYC-approved wallets, ensuring compliance
            with securities regulations in each jurisdiction.
          </p>
        </div>
      </div>

      {/* CTA Box */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-blue-900/40 via-[#151D30] to-cyan-900/40 border border-cyan-500/30 text-center space-y-4 shadow-2xl">
        <h2 className="text-2xl font-bold font-display text-white">
          Ready to Start Your RWA Investment Journey?
        </h2>
        <p className="text-xs text-gray-300 max-w-md mx-auto leading-relaxed">
          Explore our initial 12 institutional offerings across commercial office parks, gold reserves, and solar farms.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <Link
            to="/explore"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-cyan-500/20"
          >
            Explore Real World Assets
          </Link>
          <Link
            to="/issuer/tokenize"
            className="px-6 py-3 rounded-xl bg-[#0F1626] border border-[#22304E] text-white font-semibold text-xs hover:bg-[#1A2338]"
          >
            Tokenize an Asset
          </Link>
        </div>
      </div>
    </div>
  );
};
