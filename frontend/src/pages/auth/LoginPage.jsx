import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Mail, Lock, ArrowRight, ShieldCheck, User } from 'lucide-react';

export const LoginPage = () => {
  const [loginMode, setLoginMode] = useState('CUSTOMER'); // 'CUSTOMER' | 'ADMIN'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const redirectPath = queryParams.get('redirect') || (loginMode === 'ADMIN' ? '/admin' : '/home');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter your email address and password.");
      return;
    }

    try {
      setLoading(true);
      const user = await login(email, password);

      // Verify Admin role if logging in via Admin Portal
      if (loginMode === 'ADMIN') {
        if (user?.role !== 'ADMIN') {
          toast.error("Access Denied: This account is not an authorized Bakery Administrator.");
          return;
        }
        toast.success(`Welcome to Admin Console, ${user.name || 'Admin'}!`);
        navigate('/admin');
      } else {
        if (user?.role === 'ADMIN') {
          navigate('/admin');
        } else {
          navigate(redirectPath);
        }
      }
    } catch (err) {
      // Error toast handled in AuthContext
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 px-4 max-w-md mx-auto space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 rounded-3xl bg-[#8b4513] text-[#ffc29f] flex items-center justify-center font-extrabold text-3xl mx-auto shadow-warm-md">
          🥖
        </div>
        <h1 className="font-headline font-extrabold text-2xl text-[#1b1c1c]">
          {loginMode === 'ADMIN' ? 'Bakery Admin Portal' : 'Sign In to KrishnaArjun Bakers'}
        </h1>
        <p className="text-xs text-gray-500">
          {loginMode === 'ADMIN'
            ? 'Authorized personnel login for baking operations & inventory'
            : 'Chakote Brand Dealer & Fresh Bakery • Sangola'}
        </p>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="bg-white rounded-2xl p-1.5 border border-[#dac2b6]/50 shadow-warm-sm grid grid-cols-2 gap-1 text-xs font-bold">
        <button
          type="button"
          onClick={() => setLoginMode('CUSTOMER')}
          className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            loginMode === 'CUSTOMER'
              ? 'bg-[#8b4513] text-white shadow-warm-sm'
              : 'text-gray-600 hover:bg-[#f6f3f2]'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Customer Login</span>
        </button>

        <button
          type="button"
          onClick={() => setLoginMode('ADMIN')}
          className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            loginMode === 'ADMIN'
              ? 'bg-[#8b4513] text-white shadow-warm-sm'
              : 'text-gray-600 hover:bg-[#f6f3f2]'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Admin Portal</span>
        </button>
      </div>

      {/* Login Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#dac2b6]/40 shadow-warm-md space-y-5">
        {loginMode === 'ADMIN' && (
          <div className="p-3 bg-[#fffbf5] border border-[#fea619]/60 rounded-2xl text-[11px] text-[#855300] flex items-center gap-2 font-medium">
            <ShieldCheck className="w-4 h-4 text-[#fea619] flex-shrink-0" />
            <span>Administrator credentials required. Authorized staff only.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-gray-700 mb-1">
              {loginMode === 'ADMIN' ? 'Admin Email Address' : 'Email Address'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={loginMode === 'ADMIN' ? "admin@krishnaarjunbakers.com" : "customer@example.com"}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#dac2b6]/60 bg-[#fcf9f8] focus:bg-white focus:outline-none focus:border-secondary font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#dac2b6]/60 bg-[#fcf9f8] focus:bg-white focus:outline-none focus:border-secondary font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[#8b4513] hover:bg-[#6c2f00] text-white font-headline font-bold text-xs shadow-warm-sm transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
          >
            <span>
              {loading
                ? 'Authenticating...'
                : loginMode === 'ADMIN'
                ? 'Enter Admin Console'
                : 'Sign In with Email'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {loginMode === 'CUSTOMER' ? (
          <div className="pt-2 text-center text-xs text-gray-500 border-t border-[#f0eded]">
            Don't have an account yet?{' '}
            <Link to={`/register?redirect=${redirectPath}`} className="font-bold text-[#8b4513] hover:underline">
              Register New Account
            </Link>
          </div>
        ) : (
          <div className="pt-2 text-center text-[11px] text-gray-400 border-t border-[#f0eded]">
            Need admin access? Contact an existing bakery manager to grant privileges.
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
