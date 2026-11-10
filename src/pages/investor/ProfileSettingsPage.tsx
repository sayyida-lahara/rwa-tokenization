import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useWallet } from '../../context/WalletContext';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { shortenAddress } from '../../utils/formatters';
import { User, ShieldCheck, Mail, Phone, Wallet, Save, RefreshCw } from 'lucide-react';

export const ProfileSettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { wallet } = useWallet();
  const { updateUser, savePreferences, preferences, resetDemoData } = useData();
  const { showSuccess, showInfo, showError } = useToast();

  const userPrefs = preferences[user.id] || { emailAlerts: true, dividendAlerts: true };
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone || '+91 98200 12345');
  const [emailAlerts, setEmailAlerts] = useState(userPrefs.emailAlerts);
  const [dividendAlerts, setDividendAlerts] = useState(userPrefs.dividendAlerts);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setName(user.name);
    setPhone(user.phone || '+91 98200 12345');
    setEmailAlerts(userPrefs.emailAlerts);
    setDividendAlerts(userPrefs.dividendAlerts);
  }, [user, userPrefs]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateUser(user.id, { name, phone });
      await savePreferences(user.id, { emailAlerts, dividendAlerts });
      showSuccess(
        'Settings Updated',
        'Investor profile and communication preferences persisted to SQLite.'
      );
    } catch (err: any) {
      showError('Save Failed', err.message || 'Failed to update preferences');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetData = async () => {
    try {
      await resetDemoData();
      showInfo('Demo Database Reset', 'Restored initial sample data in SQLite database.');
    } catch (err: any) {
      showError('Reset Failed', err.message || 'Failed to reset demo data');
    }
  };

  return (
    <div className="max-w-3xl space-y-8">
      {/* Header */}
      <div className="pb-4 border-b border-[#1E293B]">
        <h1 className="text-2xl font-bold font-display text-white">Profile & Security Settings</h1>
        <p className="text-xs text-gray-400">
          Manage your institutional identity, verified credentials, and communication preferences
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Card */}
        <div className="p-6 rounded-2xl bg-[#151D30] border border-[#1E293B] space-y-5">
          <div className="flex items-center gap-4">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-cyan-400/50 shadow-lg"
            />
            <div>
              <h3 className="text-base font-bold font-display text-white">{user.name}</h3>
              <p className="text-xs text-gray-400 font-mono">{user.email}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-500/10 text-cyan-300 border border-cyan-500/30">
                  {user.role}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  {user.kycLevel} KYC Approved
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1.5">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#0F1626] border border-[#22304E] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1.5">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#0F1626] border border-[#22304E] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>
        </div>

        {/* Connected Wallet Info */}
        <div className="p-6 rounded-2xl bg-[#151D30] border border-[#1E293B] space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white font-display flex items-center gap-2">
              <Wallet className="w-4 h-4 text-cyan-400" />
              <span>Connected Solana Custody Address (Base58)</span>
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 uppercase">
              Solana {wallet.cluster || 'Testnet'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0F1626] border border-[#1E293B] flex items-center justify-between text-xs">
            <div>
              <span className="text-gray-400 block text-[11px]">Primary Solana Base58 Public Key</span>
              <span className="font-mono text-cyan-300 font-bold select-all break-all">
                {wallet.address || user.walletAddress}
              </span>
            </div>
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 shrink-0 ml-3">
              Active Connected
            </span>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="p-6 rounded-2xl bg-[#151D30] border border-[#1E293B] space-y-3 text-xs">
          <h3 className="text-sm font-semibold text-white font-display">
            Notification Preferences
          </h3>

          <label className="flex items-center gap-3 cursor-pointer py-1">
            <input
              type="checkbox"
              checked={dividendAlerts}
              onChange={(e) => setDividendAlerts(e.target.checked)}
              className="accent-cyan-400 w-4 h-4 rounded"
            />
            <span className="text-gray-200">
              Email alert whenever rental or clean energy dividends are credited
            </span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer py-1">
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={(e) => setEmailAlerts(e.target.checked)}
              className="accent-cyan-400 w-4 h-4 rounded"
            />
            <span className="text-gray-200">
              New institutional offering launch alerts (commercial real estate & gold)
            </span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/20 transition-all"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Preferences</span>
          </button>

          <button
            type="button"
            onClick={handleResetData}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-500/30 text-rose-300 hover:bg-rose-500/10 text-xs transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </form>
    </div>
  );
};
