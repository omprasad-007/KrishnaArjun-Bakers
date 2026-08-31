import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { User, Phone, Lock, MapPin, Mail, ArrowRight } from 'lucide-react';

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    address: '',
    village: 'Sangola',
    taluka: 'Sangola',
    district: 'Solapur',
    state: 'Maharashtra',
  });
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const redirectPath = queryParams.get('redirect') || '/home';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
      toast.error("Please enter your name, email, and password.");
      return;
    }

    try {
      setLoading(true);
      await register({
        ...formData,
        name: formData.name.trim(),
        email: formData.email.trim(),
      });
      navigate(redirectPath);
    } catch (err) {
      // Handled in AuthContext
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-10 px-4 max-w-lg mx-auto space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[#8b4513] to-[#6c2f00] text-[#ffdbc9] flex items-center justify-center font-extrabold text-3xl mx-auto shadow-warm-md">
          🥖
        </div>
        <h1 className="font-headline font-extrabold text-2xl sm:text-3xl text-[#1b1c1c]">
          Create an Account
        </h1>
        <p className="text-xs text-gray-500">
          Join KrishnaArjun Bakers for fresh daily baked orders & easy tracking
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#dac2b6]/40 shadow-warm-md space-y-5">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-gray-700 mb-1.5">Full Name *</label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Ramesh Kulkarni"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#dac2b6]/60 bg-[#fcf9f8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fea619] font-medium text-gray-800 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1.5">Email Address *</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#dac2b6]/60 bg-[#fcf9f8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fea619] font-medium text-gray-800 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-700 mb-1.5">Phone Number (10 Digits)</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. 9822334455"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#dac2b6]/60 bg-[#fcf9f8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fea619] font-medium text-gray-800 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1.5">Password (6+ chars) *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#dac2b6]/60 bg-[#fcf9f8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fea619] font-medium text-gray-800 transition-colors"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1.5">Delivery Address / Landmark</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="e.g. Near Datta Mandir, Station Road"
              rows={2}
              className="w-full p-2.5 rounded-xl border border-[#dac2b6]/60 bg-[#fcf9f8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fea619] font-medium text-gray-800 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Village/Town</label>
              <input
                type="text"
                value={formData.village}
                onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                className="w-full p-2 rounded-xl border border-[#dac2b6]/60 bg-[#fcf9f8] focus:bg-white focus:outline-none font-medium text-xs text-gray-800"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">Taluka</label>
              <input
                type="text"
                value={formData.taluka}
                onChange={(e) => setFormData({ ...formData, taluka: e.target.value })}
                className="w-full p-2 rounded-xl border border-[#dac2b6]/60 bg-[#fcf9f8] focus:bg-white focus:outline-none font-medium text-xs text-gray-800"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">District</label>
              <input
                type="text"
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                className="w-full p-2 rounded-xl border border-[#dac2b6]/60 bg-[#fcf9f8] focus:bg-white focus:outline-none font-medium text-xs text-gray-800"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">State</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full p-2 rounded-xl border border-[#dac2b6]/60 bg-[#fcf9f8] focus:bg-white focus:outline-none font-medium text-xs text-gray-800"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#6c2f00] to-[#8b4513] hover:from-[#4a2003] hover:to-[#6c2f00] text-white font-headline font-bold text-xs shadow-warm-sm hover:shadow-warm-md transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 mt-2"
          >
            <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-gray-500 pt-3 border-t border-[#f0eded]">
          Already have an account?{' '}
          <Link
            to={redirectPath && redirectPath !== '/home' ? `/login?redirect=${encodeURIComponent(redirectPath)}` : '/login'}
            className="font-bold text-[#8b4513] hover:underline"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
