import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { User, Phone, MapPin, Mail, Save, ShieldCheck, CheckCircle2, LayoutDashboard } from 'lucide-react';

export const ProfilePage = () => {
  const { user, isAdmin, updateProfile } = useAuth();
  const toast = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    village: 'Sangola',
    taluka: 'Sangola',
    district: 'Solapur',
    state: 'Maharashtra',
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        village: user.village || 'Sangola',
        taluka: user.taluka || 'Sangola',
        district: user.district || 'Solapur',
        state: user.state || 'Maharashtra',
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Please enter your name.");
      return;
    }

    try {
      setSaving(true);
      await updateProfile(formData);
    } catch (err) {
      // Toast handled by AuthContext
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pb-24 pt-4 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-headline font-extrabold text-2xl md:text-3xl text-[#1b1c1c]">
            {isAdmin ? 'Bakery Admin Profile' : 'Customer Profile & Settings'}
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage your personal profile details, contact information, and delivery address.
          </p>
        </div>

        {isAdmin && (
          <Link
            to="/admin"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#8b4513] text-white text-xs font-bold shadow-warm-sm hover:bg-[#6c2f00] self-start sm:self-auto"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Admin Console</span>
          </Link>
        )}
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#dac2b6]/40 shadow-warm-sm space-y-6">
        {/* User Avatar & Status */}
        <div className="flex items-center gap-4 border-b border-[#f0eded] pb-6">
          <div className="w-16 h-16 rounded-3xl bg-[#8b4513] text-[#ffc29f] flex items-center justify-center font-headline font-extrabold text-2xl shadow-warm-sm flex-shrink-0">
            {formData.name ? formData.name[0].toUpperCase() : 'U'}
          </div>
          <div>
            <h2 className="font-headline font-bold text-lg text-[#1b1c1c]">{formData.name || 'User'}</h2>
            <p className="text-xs text-gray-500 font-medium">{formData.email || user?.email}</p>
            <span
              className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full mt-1.5 ${
                isAdmin
                  ? 'bg-[#fea619] text-[#6c2f00]'
                  : 'bg-[#dcfce7] text-[#166534]'
              }`}
            >
              {isAdmin ? '🛡️ Bakery Administrator' : '🥖 Verified Customer'}
            </span>
          </div>
        </div>

        {/* Edit Profile Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-gray-700 mb-1">Full Name *</label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#dac2b6]/60 bg-[#fcf9f8] focus:bg-white focus:outline-none focus:border-secondary font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#dac2b6]/60 bg-[#fcf9f8] focus:bg-white focus:outline-none focus:border-secondary font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. 9822334455"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#dac2b6]/60 bg-[#fcf9f8] focus:bg-white focus:outline-none focus:border-secondary font-medium"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Delivery Address / Landmark</label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="e.g. Near Old Bus Stand, Datta Galli, Sangola"
                rows={2}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#dac2b6]/60 bg-[#fcf9f8] focus:bg-white focus:outline-none focus:border-secondary font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Village/Town</label>
              <input
                type="text"
                value={formData.village}
                onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                className="w-full p-2 rounded-xl border border-[#dac2b6]/60 bg-[#fcf9f8] focus:bg-white focus:outline-none font-medium"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">Taluka</label>
              <input
                type="text"
                value={formData.taluka}
                onChange={(e) => setFormData({ ...formData, taluka: e.target.value })}
                className="w-full p-2 rounded-xl border border-[#dac2b6]/60 bg-[#fcf9f8] focus:bg-white focus:outline-none font-medium"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">District</label>
              <input
                type="text"
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                className="w-full p-2 rounded-xl border border-[#dac2b6]/60 bg-[#fcf9f8] focus:bg-white focus:outline-none font-medium"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">State</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full p-2 rounded-xl border border-[#dac2b6]/60 bg-[#fcf9f8] focus:bg-white focus:outline-none font-medium"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#f0eded] flex items-center justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 rounded-2xl bg-[#8b4513] hover:bg-[#6c2f00] text-white font-headline font-bold text-xs shadow-warm-sm transition-all flex items-center gap-2 active:scale-98 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving Profile...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
