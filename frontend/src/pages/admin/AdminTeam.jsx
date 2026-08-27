import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import {
  ShieldCheck,
  UserPlus,
  UserX,
  Users,
  Search,
  CheckCircle2,
  AlertTriangle,
  Mail,
  Phone,
  Lock,
  User,
  RefreshCw,
  PlusCircle
} from 'lucide-react';

export const AdminTeam = () => {
  const { user: currentUser } = useAuth();
  const toast = useToast();

  const [admins, setAdmins] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState('CREATE'); // 'CREATE' | 'PROMOTE'
  const [searchUserQuery, setSearchUserQuery] = useState('');
  const [creating, setCreating] = useState(false);

  // New Admin Form State
  const [newAdminForm, setNewAdminForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });

  useEffect(() => {
    loadTeamData();
  }, []);

  const loadTeamData = async () => {
    try {
      setLoading(true);
      const [adminList, userList] = await Promise.all([
        api.getAdmins(),
        api.getAllUsers(),
      ]);
      setAdmins(adminList || []);
      setAllUsers(userList || []);
    } catch (err) {
      toast.error("Failed to load admin team list.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    if (!newAdminForm.name || !newAdminForm.email || !newAdminForm.password) {
      toast.error("Please enter Name, Email, and Password.");
      return;
    }
    if (newAdminForm.password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    try {
      setCreating(true);
      await api.createAdminAccount(newAdminForm);
      toast.success(`Successfully created new Bakery Admin: '${newAdminForm.name}'!`);
      setNewAdminForm({ name: '', email: '', phone: '', password: '' });
      setAddModalOpen(false);
      loadTeamData();
    } catch (err) {
      toast.error(err.message || "Failed to create new admin account.");
    } finally {
      setCreating(false);
    }
  };

  const handlePromote = async (userId, name) => {
    try {
      await api.promoteToAdmin(userId);
      toast.success(`'${name}' is now an authorized Bakery Administrator!`);
      setAddModalOpen(false);
      loadTeamData();
    } catch (err) {
      toast.error(err.message || "Failed to promote user.");
    }
  };

  const handleDemote = async (adminId, adminName) => {
    if (adminId === currentUser?.id) {
      toast.error("You cannot remove your own admin access.");
      return;
    }

    if (admins.length <= 1) {
      toast.error("Cannot remove the last remaining administrator.");
      return;
    }

    if (window.confirm(`Are you sure you want to remove '${adminName}' from the Admin Team? They will become a regular customer.`)) {
      try {
        await api.demoteAdmin(adminId);
        toast.success(`Removed admin access for '${adminName}'.`);
        loadTeamData();
      } catch (err) {
        toast.error(err.message || "Failed to remove admin.");
      }
    }
  };

  const eligibleUsersToPromote = allUsers.filter((u) => {
    const isAlreadyAdmin = admins.some((a) => a.id === u.id || a.email === u.email);
    const q = searchUserQuery.toLowerCase();
    const matches =
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.phone && u.phone.includes(q));
    return !isAlreadyAdmin && matches;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline font-extrabold text-2xl md:text-3xl text-[#1b1c1c]">
            Bakery Admin Team & Access Control
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Only existing administrators can create new admin accounts or grant manager privileges.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadTeamData}
            className="p-2.5 rounded-2xl border border-[#dac2b6]/60 bg-white hover:bg-[#f6f3f2] text-gray-600 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#8b4513] hover:bg-[#6c2f00] text-white font-headline font-bold text-xs shadow-warm-sm transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create New Admin</span>
          </button>
        </div>
      </div>

      {/* Security Privacy Notice */}
      <div className="bg-[#fffbf5] border border-[#fea619]/60 rounded-3xl p-5 shadow-warm-sm space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-[#855300]">
          <ShieldCheck className="w-5 h-5 text-[#fea619]" />
          <span>Admin-Only Privilege Creation</span>
        </div>
        <p className="text-xs text-gray-600 leading-relaxed">
          • <strong>1st Admin Authorizes 2nd Admin:</strong> New administrators cannot self-register as Admin from the public storefront. They must be created or authorized from inside this panel by an existing Administrator.<br />
          • <strong>Privacy Isolation:</strong> Administrators can see other administrators in this list. Customers only see bakery support contacts and cannot access other customer data.
        </p>
      </div>

      {/* Admin Team Table */}
      <div className="bg-white rounded-3xl border border-[#dac2b6]/40 shadow-warm-sm overflow-hidden">
        <div className="p-4 bg-[#fcf9f8] border-b border-[#f0eded] flex items-center justify-between">
          <h3 className="font-headline font-bold text-sm text-[#1b1c1c]">
            Active Bakery Administrators ({admins.length})
          </h3>
          <span className="text-[11px] text-gray-500">Authorized personnel only</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-gray-500">Loading admin staff...</div>
        ) : admins.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-500">No admin accounts found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#fcf9f8] border-b border-[#f0eded] text-gray-700 font-headline font-bold">
                  <th className="py-3.5 px-4">Administrator</th>
                  <th className="py-3.5 px-4">Email Address (Login ID)</th>
                  <th className="py-3.5 px-4">Phone Number</th>
                  <th className="py-3.5 px-4">Access Level</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f6f3f2]">
                {admins.map((adm) => {
                  const isCurrent = adm.id === currentUser?.id;

                  return (
                    <tr key={adm.id} className="hover:bg-[#fffbf5]/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#8b4513] text-[#ffc29f] flex items-center justify-center font-bold text-xs flex-shrink-0">
                            {adm.name ? adm.name[0].toUpperCase() : 'A'}
                          </div>
                          <div>
                            <span className="font-headline font-bold text-sm text-[#1b1c1c] block">
                              {adm.name || 'Bakery Admin'}
                            </span>
                            {isCurrent && (
                              <span className="text-[10px] font-bold text-[#15803d]">
                                (You - Active Session)
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-gray-800 font-medium">
                        {adm.email || 'No email'}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-gray-700">
                        {adm.phone || '—'}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="bg-[#fea619]/20 text-[#855300] font-bold text-[10px] px-2.5 py-1 rounded-full">
                          🛡️ Full Bakery Admin
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {!isCurrent && (
                          <button
                            onClick={() => handleDemote(adm.id, adm.name)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#fee2e2] bg-[#fef2f2] hover:bg-[#fee2e2] text-[#dc2626] font-bold text-[11px] transition-all"
                            title="Remove Admin Access"
                          >
                            <UserX className="w-3.5 h-3.5" />
                            <span>Remove Admin</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Create Admin Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Admin Team Management"
        subtitle="Create a new administrator account directly or promote an existing registered customer."
        maxWidth="max-w-lg"
      >
        <div className="space-y-5 text-xs">
          {/* Modal Tab Switcher */}
          <div className="bg-[#f6f3f2] p-1 rounded-2xl grid grid-cols-2 gap-1 font-bold">
            <button
              type="button"
              onClick={() => setModalTab('CREATE')}
              className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                modalTab === 'CREATE'
                  ? 'bg-[#8b4513] text-white shadow-sm'
                  : 'text-gray-600 hover:bg-[#eae7e7]'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Create New Admin</span>
            </button>

            <button
              type="button"
              onClick={() => setModalTab('PROMOTE')}
              className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                modalTab === 'PROMOTE'
                  ? 'bg-[#8b4513] text-white shadow-sm'
                  : 'text-gray-600 hover:bg-[#eae7e7]'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Promote Customer</span>
            </button>
          </div>

          {modalTab === 'CREATE' ? (
            /* Create New Admin Form */
            <form onSubmit={handleCreateAdmin} className="space-y-3.5">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Admin Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={newAdminForm.name}
                    onChange={(e) => setNewAdminForm({ ...newAdminForm, name: e.target.value })}
                    placeholder="e.g. Arjun Shinde"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#dac2b6]/60 bg-[#fcf9f8] focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Admin Email Address (Login ID) *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={newAdminForm.email}
                    onChange={(e) => setNewAdminForm({ ...newAdminForm, email: e.target.value })}
                    placeholder="e.g. arjun@krishnaarjunbakers.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#dac2b6]/60 bg-[#fcf9f8] focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Phone Number (Optional)</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={newAdminForm.phone}
                      onChange={(e) => setNewAdminForm({ ...newAdminForm, phone: e.target.value })}
                      placeholder="e.g. 9822334455"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#dac2b6]/60 bg-[#fcf9f8] focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Initial Password (6+ chars) *</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={newAdminForm.password}
                      onChange={(e) => setNewAdminForm({ ...newAdminForm, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#dac2b6]/60 bg-[#fcf9f8] focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#f0eded]">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-[#f6f3f2]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2.5 rounded-xl bg-[#8b4513] hover:bg-[#6c2f00] text-white font-headline font-bold text-xs shadow-warm-sm transition-all flex items-center gap-1.5 active:scale-98 disabled:opacity-50"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{creating ? 'Creating Admin...' : 'Create Admin Account'}</span>
                </button>
              </div>
            </form>
          ) : (
            /* Promote Existing User View */
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchUserQuery}
                  onChange={(e) => setSearchUserQuery(e.target.value)}
                  placeholder="Search customer by name or email..."
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#dac2b6]/60 bg-[#fcf9f8] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="divide-y divide-[#f0eded] max-h-56 overflow-y-auto border border-[#dac2b6]/40 rounded-2xl p-2 bg-[#fcf9f8]">
                {eligibleUsersToPromote.length === 0 ? (
                  <div className="p-6 text-center text-gray-400">
                    No matching customer accounts found.
                  </div>
                ) : (
                  eligibleUsersToPromote.map((u) => (
                    <div key={u.id} className="p-3 flex items-center justify-between gap-3 hover:bg-white rounded-xl transition-colors">
                      <div>
                        <h5 className="font-headline font-bold text-xs text-[#1b1c1c]">{u.name || 'User'}</h5>
                        <span className="text-[10px] text-gray-500 block">{u.email || u.phone}</span>
                      </div>

                      <button
                        onClick={() => handlePromote(u.id, u.name)}
                        className="px-3 py-1.5 rounded-xl bg-[#8b4513] hover:bg-[#6c2f00] text-white font-bold text-[11px] shadow-warm-sm transition-all flex items-center gap-1"
                      >
                        <UserPlus className="w-3 h-3" />
                        <span>Make Admin</span>
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-2 text-right">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-[#f6f3f2]"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default AdminTeam;
