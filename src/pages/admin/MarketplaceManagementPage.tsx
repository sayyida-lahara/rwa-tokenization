import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { useData } from '../../context/DataContext';
import { Sliders, ShieldCheck, DollarSign, Cpu, AlertTriangle, Save, RefreshCw } from 'lucide-react';

export const MarketplaceManagementPage: React.FC = () => {
  const { marketplace, saveMarketplaceSettings } = useData();
  const { showSuccess, showWarning, showError } = useToast();

  const [feePercent, setFeePercent] = useState<number>(marketplace.feePercent);
  const [minOfferingValuation, setMinOfferingValuation] = useState<number>(marketplace.minOfferingValuation);
  const [oracleProvider, setOracleProvider] = useState(marketplace.oracleProvider);
  const [settlementNetwork, setSettlementNetwork] = useState(marketplace.settlementNetwork);
  const [isTradingPaused, setIsTradingPaused] = useState(marketplace.isTradingPaused);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setFeePercent(marketplace.feePercent);
    setMinOfferingValuation(marketplace.minOfferingValuation);
    setOracleProvider(marketplace.oracleProvider);
    setSettlementNetwork(marketplace.settlementNetwork);
    setIsTradingPaused(marketplace.isTradingPaused);
  }, [marketplace]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await saveMarketplaceSettings({
        feePercent,
        minOfferingValuation,
        oracleProvider,
        settlementNetwork,
        isTradingPaused,
      });
      showSuccess(
        'Protocol Settings Saved',
        'Marketplace parameters and fee rates have been updated in SQLite & simulated chain.'
      );
    } catch (err: any) {
      showError('Save Failed', err.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleEmergencyPause = async () => {
    const newState = !isTradingPaused;
    setIsTradingPaused(newState);
    try {
      await saveMarketplaceSettings({
        feePercent,
        minOfferingValuation,
        oracleProvider,
        settlementNetwork,
        isTradingPaused: newState,
      });
      if (newState) {
        showWarning('Emergency Pause Activated', 'New token investments temporarily restricted.');
      } else {
        showSuccess('Marketplace Resumed', 'All investment orders and trading active.');
      }
    } catch (err: any) {
      setIsTradingPaused(!newState);
      showError('Pause Toggle Failed', err.message || 'Failed to toggle pause');
    }
  };

  return (
    <div className="max-w-3xl space-y-8">
      {/* Header */}
      <div className="pb-4 border-b border-[#1E293B]">
        <h1 className="text-2xl font-bold font-display text-white">Marketplace Configuration</h1>
        <p className="text-xs text-gray-400">
          Control protocol fees, smart contract parameters, settlement chains, and platform controls
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Protocol Fee Settings */}
        <div className="p-6 rounded-2xl bg-[#151D30] border border-[#1E293B] space-y-4 shadow-xl">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold font-display text-white">Fee & Economic Controls</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-gray-300 block mb-1.5">
                Protocol Transaction Fee (%)
              </label>
              <input
                type="number"
                step={0.05}
                min={0}
                max={5}
                value={feePercent}
                onChange={(e) => setFeePercent(Number(e.target.value))}
                className="w-full bg-[#0F1626] border border-[#22304E] rounded-xl px-3.5 py-2 text-white font-mono focus:outline-none focus:border-cyan-400"
              />
              <span className="text-[10px] text-gray-500 mt-1 block">
                Applied to primary token subscriptions (Default: 0.5%)
              </span>
            </div>

            <div>
              <label className="font-semibold text-gray-300 block mb-1.5">
                Minimum Asset Valuation Threshold ($ USD)
              </label>
              <input
                type="number"
                step={100000}
                value={minOfferingValuation}
                onChange={(e) => setMinOfferingValuation(Number(e.target.value))}
                className="w-full bg-[#0F1626] border border-[#22304E] rounded-xl px-3.5 py-2 text-white font-mono focus:outline-none focus:border-cyan-400"
              />
              <span className="text-[10px] text-gray-500 mt-1 block">
                Minimum valuation for new SPV submissions
              </span>
            </div>
          </div>
        </div>

        {/* Blockchain Settlement Config */}
        <div className="p-6 rounded-2xl bg-[#151D30] border border-[#1E293B] space-y-4 shadow-xl">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-purple-400" />
            <h3 className="text-base font-bold font-display text-white">
              Settlement & Oracle Infrastructure
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-gray-300 block mb-1.5">
                Primary Settlement Layer
              </label>
              <select
                value={settlementNetwork}
                onChange={(e) => setSettlementNetwork(e.target.value)}
                className="w-full bg-[#0F1626] border border-[#22304E] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="Solana Mainnet Beta">Solana Mainnet Beta</option>
                <option value="Solana Testnet">Solana Testnet</option>
                <option value="Solana Devnet">Solana Devnet</option>
                <option value="Solana Localnet">Solana Localnet</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-gray-300 block mb-1.5">
                KYC Identity Oracle
              </label>
              <input
                type="text"
                value={oracleProvider}
                onChange={(e) => setOracleProvider(e.target.value)}
                className="w-full bg-[#0F1626] border border-[#22304E] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>
        </div>

        {/* Emergency Controls */}
        <div className="p-6 rounded-2xl bg-[#151D30] border border-[#1E293B] space-y-3 shadow-xl">
          <div className="flex items-center gap-2 text-amber-400">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="text-base font-bold font-display text-white">Emergency Circuit Breaker</h3>
          </div>
          <p className="text-xs text-gray-400">
            In the event of anomalous volatility or auditor notification, the platform multi-sig can pause order execution.
          </p>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#0F1626] border border-[#1E293B]">
            <div>
              <p className="text-xs font-semibold text-white">
                Marketplace Trading State:{' '}
                <span className={isTradingPaused ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                  {isTradingPaused ? 'PAUSED' : 'ACTIVE'}
                </span>
              </p>
              <p className="text-[10px] text-gray-500">
                {isTradingPaused ? 'Investors cannot acquire tokens' : 'All contracts open for subscriptions'}
              </p>
            </div>

            <button
              type="button"
              onClick={handleToggleEmergencyPause}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                isTradingPaused
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40'
              }`}
            >
              {isTradingPaused ? 'Resume Marketplace' : 'Activate Emergency Pause'}
            </button>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/25 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};
