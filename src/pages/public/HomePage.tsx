import React, { useState } from 'react';
import { Link } from 'react-router';
import { useData } from '../../context/DataContext';
import { AssetCard } from '../../components/marketplace/AssetCard';
import {
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Building,
  Coins,
  Zap,
  Globe2,
  Lock,
  PieChart,
  Users,
  ChevronDown,
  Sparkles,
  Layers,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const HomePage: React.FC = () => {
  const { getApprovedAssets } = useData();
  const assets = getApprovedAssets();
  const featuredAssets = assets.filter((a) => a.isFeatured).slice(0, 6);
  const recentAssets = [...assets].reverse().slice(0, 4);

  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does fractional Real World Asset (RWA) tokenization work?',
      a: 'Each real-world property or physical commodity is held by an independent Special Purpose Vehicle (SPV) or legal trust. The equity or debt of that SPV is digitally represented by Solana Token-2022 security tokens via our Anchor smart contract on Solana Testnet, allowing investors to purchase fractional slices with instant on-chain settlement.',
    },
    {
      q: 'Are the underlying properties legally registered and insured?',
      a: 'Yes. Every listed asset undergoes rigorous due diligence by accredited tier-1 appraisal firms (CBRE, Knight Frank, Savills) and legal title verification. All physical structures are insured against catastrophic losses, with deeds held by registered institutional custodians such as Apex Trust and BitGo.',
    },
    {
      q: 'How and when do I receive dividend distributions?',
      a: 'Rental income, power purchase agreement cash flows, and vault distributions are automatically deposited directly to your connected wallet address in USDC or into your investor account according to the asset distribution frequency (monthly or quarterly).',
    },
    {
      q: 'What is the minimum investment required to participate?',
      a: 'Unlike traditional private equity real estate requiring $50,000+ minimum tickets, AssetX enables fractional entry starting as low as $50 to $250 per token, making institutional real estate accessible to qualified global investors.',
    },
    {
      q: 'Is this an actual blockchain transaction in this environment?',
      a: 'This web application is an institutional frontend with a Node/React Router backend backed by SQLite. Wallet connections, token allocations, and smart-contract calls are simulated on the server; the browser never talks to a chain or holds persisted state directly.',
    },
  ];

  return (
    <div className="space-y-20 pb-20">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:py-24">
        {/* Subtle Background Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-blue-600/15 via-cyan-500/10 to-transparent blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#151D30] border border-cyan-500/30 text-xs text-cyan-300 shadow-inner">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-semibold tracking-wide">Next-Gen Real World Asset Protocol</span>
              </div>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
                Own a Piece of the{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-emerald-400">
                  Real World.
                </span>
              </h1>

              <p className="text-gray-300 text-base sm:text-lg max-w-xl leading-relaxed">
                Discover investment opportunities in tokenized real-world assets. Explore
                real estate, commodities, and infrastructure through blockchain-powered ownership.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to="/explore"
                  className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-sm shadow-xl shadow-cyan-500/25 transition-all flex items-center gap-2 active:scale-[0.98]"
                >
                  <span>Explore Assets</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/issuer/tokenize"
                  className="px-6 py-3.5 rounded-xl bg-[#151D30] hover:bg-[#1C2640] border border-[#283754] text-white font-semibold text-sm transition-all flex items-center gap-2 active:scale-[0.98]"
                >
                  <Building className="w-4 h-4 text-emerald-400" />
                  <span>Tokenize Your Asset</span>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-[#1E293B] flex flex-wrap items-center gap-6 text-xs text-gray-400">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>LEED & RICS Audited</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-cyan-400" />
                  <span>Solana Token-2022 Transfer Hooks</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span>Institutional Grade RWA</span>
                </div>
              </div>
            </div>

            {/* Right Hero Visual Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl p-3 bg-gradient-to-b from-[#22304E] to-[#151D30] border border-[#2D3F65] shadow-2xl">
                <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-slate-900">
                  <img
                    src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80"
                    alt="Premium Commercial Building – Bangalore"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B1020] via-transparent to-transparent opacity-80" />

                  {/* Floating Badges */}
                  <div className="absolute top-3 left-3 bg-[#0B1020]/80 backdrop-blur-md px-3 py-1 rounded-lg border border-cyan-500/30 text-xs font-semibold text-cyan-300">
                    Featured Asset
                  </div>
                  <div className="absolute top-3 right-3 bg-emerald-500/20 backdrop-blur-md px-3 py-1 rounded-lg border border-emerald-500/40 text-xs font-bold text-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verified Listing</span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="text-white font-display font-bold text-base truncate">
                      Premium Commercial Building – Bangalore
                    </p>
                    <p className="text-xs text-gray-300">Outer Ring Road, Bellandur • India 🇮🇳</p>
                  </div>
                </div>

                {/* Sub-card live progress */}
                <div className="p-4 bg-[#0F1626] rounded-xl border border-[#1E293B] mt-3 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400">Total Valuation</span>
                    <span className="font-bold text-white font-display text-sm">$24,500,000</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400">Available Supply</span>
                    <span className="font-mono text-cyan-400 font-semibold">112,500 / 490,000</span>
                  </div>
                  <div className="h-2 bg-[#1A2338] rounded-full overflow-hidden border border-[#22304E]">
                    <div className="h-full bg-gradient-to-r from-blue-600 via-cyan-400 to-emerald-400 w-[77%]" />
                  </div>
                  <Link
                    to="/asset/asset-1"
                    className="block text-center py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors"
                  >
                    View Asset Offering & Details
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PLATFORM STATISTICS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-6 rounded-2xl bg-[#151D30] border border-[#1E293B] shadow-xl">
          <div className="text-center p-3 border-r border-[#1E293B]/60 last:border-r-0">
            <p className="text-xs text-gray-400 font-medium">Total Assets Listed</p>
            <p className="text-2xl sm:text-3xl font-bold font-display text-white mt-1">12+</p>
            <span className="text-[10px] text-cyan-400">100% Institutional Grade</span>
          </div>

          <div className="text-center p-3 border-r border-[#1E293B]/60 last:border-r-0">
            <p className="text-xs text-gray-400 font-medium">Total Asset Value</p>
            <p className="text-2xl sm:text-3xl font-bold font-display text-white mt-1">$358.5M</p>
            <span className="text-[10px] text-emerald-400">Verified Appraisals</span>
          </div>

          <div className="text-center p-3 border-r border-[#1E293B]/60 last:border-r-0">
            <p className="text-xs text-gray-400 font-medium">Total Global Investors</p>
            <p className="text-2xl sm:text-3xl font-bold font-display text-white mt-1">14,850+</p>
            <span className="text-[10px] text-cyan-400">Across 42 Jurisdictions</span>
          </div>

          <div className="text-center p-3">
            <p className="text-xs text-gray-400 font-medium">Total Tokens Issued</p>
            <p className="text-2xl sm:text-3xl font-bold font-display text-white mt-1">4.62M</p>
            <span className="text-[10px] text-emerald-400">ERC-3643 Standard</span>
          </div>
        </div>
      </section>

      {/* FEATURED ASSETS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
              Institutional Opportunities
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-white mt-1">
              Featured Tokenized Assets
            </h2>
            <p className="text-xs text-gray-400 mt-1 max-w-lg">
              Curated prime assets backed by audited title deeds and independent appraisals.
            </p>
          </div>
          <Link
            to="/explore"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <span>View All Marketplace Assets</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredAssets.map((asset) => (
            <AssetCard key={asset.id} asset={asset} />
          ))}
        </div>
      </section>

      {/* CATEGORIES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
            Diversified Asset Classes
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-white">
            Explore Tokenized Categories
          </h2>
          <p className="text-xs text-gray-400">
            Build a balanced, inflation-resilient portfolio across non-correlated real-world asset classes.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            {
              title: 'Commercial Real Estate',
              desc: 'Grade-A tech parks, offices & high-street retail.',
              route: '/category/real-estate',
              icon: <Building className="w-6 h-6 text-blue-400" />,
              count: '4 Assets',
            },
            {
              title: 'Residential Real Estate',
              desc: 'Luxury waterfront villas & urban residences.',
              route: '/category/real-estate',
              icon: <Layers className="w-6 h-6 text-cyan-400" />,
              count: '3 Assets',
            },
            {
              title: 'Gold & Precious Metals',
              desc: 'LBMA-certified Swiss vault allocated bullion.',
              route: '/category/commodities',
              icon: <Coins className="w-6 h-6 text-amber-400" />,
              count: '1 Asset',
            },
            {
              title: 'Logistics Infrastructure',
              desc: 'Automated container ports & bonded warehouses.',
              route: '/category/infrastructure',
              icon: <Globe2 className="w-6 h-6 text-purple-400" />,
              count: '2 Assets',
            },
            {
              title: 'Renewable Clean Energy',
              desc: 'Utility solar farms & hybrid wind installations.',
              route: '/category/infrastructure',
              icon: <Zap className="w-6 h-6 text-emerald-400" />,
              count: '2 Assets',
            },
          ].map((cat, idx) => (
            <Link
              key={idx}
              to={cat.route}
              className="p-5 rounded-2xl bg-[#151D30] hover:bg-[#1A243D] border border-[#1E293B] hover:border-cyan-500/40 transition-all flex flex-col justify-between group shadow-lg"
            >
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-[#0F1626] border border-[#22304E] w-fit group-hover:scale-110 transition-transform">
                  {cat.icon}
                </div>
                <h3 className="font-display font-semibold text-white group-hover:text-cyan-300 text-sm">
                  {cat.title}
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">{cat.desc}</p>
              </div>
              <div className="pt-4 mt-4 border-t border-[#1E293B] flex items-center justify-between text-[11px]">
                <span className="text-gray-500 font-mono">{cat.count}</span>
                <span className="text-cyan-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Browse <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
            Simple 5-Step Process
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-white">
            How Tokenized Investing Works
          </h2>
          <p className="text-xs text-gray-400">
            From discovering institutional properties to executing automated settlement in USDC.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
          {[
            {
              step: '01',
              title: 'Explore Assets',
              desc: 'Filter verified commercial real estate, gold reserves, and clean energy projects with full due diligence.',
            },
            {
              step: '02',
              title: 'Select Investment',
              desc: 'Analyze property financials, tenant covenants, valuation history, and audited appraisals.',
            },
            {
              step: '03',
              title: 'Connect Wallet',
              desc: 'Connect your MetaMask, WalletConnect, or Instant Demo Wallet with one click without gas fees.',
            },
            {
              step: '04',
              title: 'Purchase Tokens',
              desc: 'Select fractional token quantity and complete purchase. Receive ERC-3643 tokens in your custody.',
            },
            {
              step: '05',
              title: 'Track & Manage',
              desc: 'Monitor portfolio value, track asset appreciation, and manage tokenized holdings.',
            },
          ].map((item, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-[#151D30] border border-[#1E293B] space-y-3 relative overflow-hidden"
            >
              <div className="text-2xl font-bold font-display text-cyan-400/30">
                {item.step}
              </div>
              <h3 className="font-display font-semibold text-white text-sm">{item.title}</h3>
              <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PLATFORM BENEFITS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-[#151D30] via-[#0F1626] to-[#0B1020] border border-[#1E293B] shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-3">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                Institutional Standard
              </span>
              <h3 className="text-2xl font-bold font-display text-white">
                Why Institutional RWAs on AssetX?
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Traditional commercial real estate and infrastructure suffer from extreme illiquidity,
                high entry thresholds, and cumbersome legal paperwork. AssetX solves this through smart contract automation.
              </p>
            </div>

            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#151D30]/80 border border-[#22304E] space-y-2">
                <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                <h4 className="text-sm font-semibold text-white">Fractional Accessibility</h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Invest starting at just $50 to $250 instead of millions required for private equity buildings.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#151D30]/80 border border-[#22304E] space-y-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h4 className="text-sm font-semibold text-white">Direct SPV Ownership</h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Tokens represent legal ownership in the holding SPV backed by registered land registry deeds.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#151D30]/80 border border-[#22304E] space-y-2">
                <CheckCircle2 className="w-5 h-5 text-purple-400" />
                <h4 className="text-sm font-semibold text-white">Automated Escrow Settlement</h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Smart contract-governed escrow and title transfers executed programmatically on Solana.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#151D30]/80 border border-[#22304E] space-y-2">
                <CheckCircle2 className="w-5 h-5 text-blue-400" />
                <h4 className="text-sm font-semibold text-white">Secondary Liquidity</h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Trade fractional tokens with fellow verified investors on our peer-to-peer orderbook.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RECENTLY LISTED ASSETS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
              Marketplace Activity
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-white mt-1">
              Recently Listed Real World Assets
            </h2>
          </div>
          <Link
            to="/explore"
            className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
          >
            Explore All →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {recentAssets.map((asset) => (
            <AssetCard key={asset.id} asset={asset} />
          ))}
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
            Investor Due Diligence
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-white">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-[#151D30] border border-[#1E293B] overflow-hidden transition-all"
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4"
                >
                  <span className="text-sm font-semibold text-white font-display">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-cyan-400 shrink-0 transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-gray-300 leading-relaxed border-t border-[#1E293B]/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
