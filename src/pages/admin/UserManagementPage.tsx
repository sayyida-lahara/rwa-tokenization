import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { shortenAddress } from '../../utils/formatters';
import type { User } from '../../types';
import { Users, ShieldCheck, Search, Filter, MoreHorizontal, UserCheck, AlertTriangle } from 'lucide-react';
import { Modal } from '../../components/common/Modal';

export const UserManagementPage: React.FC = () => {
  const { users, updateUserStatus } = useAuth();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const filteredUsers = users.filter((u) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!u.name.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q) && !u.walletAddress.toLowerCase().includes(q)) {
        return false;
      }
    }
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-[#1E293B]">
        <h1 className="text-2xl font-bold font-display text-white">User & Identity Management</h1>
        <p className="text-xs text-gray-400">
          Manage institutional investor profiles, KYC verification tiers, and wallet whitelists
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-[#151D30] border border-[#1E293B]">
        <div className="w-full sm:w-80 relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or wallet..."
            className="w-full bg-[#0F1626] border border-[#22304E] rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto text-xs">
          <span className="text-gray-400">Role:</span>
          {['all', 'investor', 'issuer', 'admin'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-xl capitalize font-semibold transition-colors ${
                roleFilter === r
                  ? 'bg-blue-600/25 text-cyan-300 border border-cyan-500/40'
                  : 'text-gray-400 hover:text-white bg-[#0F1626]'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto rounded-2xl border border-[#1E293B] bg-[#151D30]">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#0F1626] text-gray-400 border-b border-[#1E293B] uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3 px-4">User</th>
              <th className="py-3 px-4">Wallet Address</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4">KYC Tier</th>
              <th className="py-3 px-4">Registration</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E293B]/70">
            {filteredUsers.map((u) => (
              <tr key={u.id} className="hover:bg-[#1A243D] transition-colors">
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={u.avatar}
                      alt={u.name}
                      className="w-9 h-9 rounded-xl object-cover border border-[#22304E] shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-semibold text-white">{u.name}</p>
                      <p className="text-[10px] text-gray-400 font-mono">{u.email}</p>
                    </div>
                  </div>
                </td>

                <td className="py-3.5 px-4 font-mono text-cyan-300">
                  {shortenAddress(u.walletAddress, 4)}
                </td>

                <td className="py-3.5 px-4">
                  <span className="uppercase text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-500/10 text-cyan-300 border border-blue-500/20">
                    {u.role}
                  </span>
                </td>

                <td className="py-3.5 px-4 font-semibold text-emerald-400">
                  {u.kycLevel}
                </td>

                <td className="py-3.5 px-4 text-gray-400 font-mono text-[11px]">
                  {u.registeredAt}
                </td>

                <td className="py-3.5 px-4">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      u.accountStatus === 'Active'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : u.accountStatus === 'Pending KYC'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    }`}
                  >
                    {u.accountStatus}
                  </span>
                </td>

                <td className="py-3.5 px-4 text-right">
                  <button
                    onClick={() => setSelectedUser(u)}
                    className="px-2.5 py-1 rounded-lg border border-[#283754] hover:border-cyan-400 text-gray-300 hover:text-white transition-colors"
                  >
                    Manage
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* User Manage Modal */}
      <Modal
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        title={
          selectedUser && (
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-cyan-400" />
              <h3 className="text-base font-semibold text-white font-display">
                Manage {selectedUser.name}
              </h3>
            </div>
          )
        }
        maxWidth="md"
      >
        {selectedUser && (
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-[#0F1626] border border-[#1E293B] space-y-1.5">
              <div className="flex justify-between">
                <span className="text-gray-400">Email Address</span>
                <span className="text-white font-mono">{selectedUser.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Wallet</span>
                <span className="text-cyan-300 font-mono select-all">{selectedUser.walletAddress}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">KYC Verification Status</span>
                <span className="text-emerald-400 font-bold">{selectedUser.kycLevel} Verified</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-semibold text-gray-300 block">Update Account Status</label>
              <div className="grid grid-cols-3 gap-2">
                {(['Active', 'Pending KYC', 'Suspended'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      updateUserStatus(selectedUser.id, status);
                      setSelectedUser({ ...selectedUser, accountStatus: status });
                    }}
                    className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                      selectedUser.accountStatus === status
                        ? 'bg-blue-600/30 text-cyan-300 border-cyan-400'
                        : 'bg-[#0F1626] border-[#1E293B] text-gray-400 hover:text-white'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setSelectedUser(null)}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors mt-2"
            >
              Close
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
};
