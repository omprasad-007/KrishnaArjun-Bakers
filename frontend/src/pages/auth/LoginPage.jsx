import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const redirectPath = queryParams.get('redirect');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error("Please enter your email address and password.");
      return;
    }

    try {
      setLoading(true);
      const user = await login(email.trim(), password);

      const isUserAdmin = Boolean(
        user?.role &&
        (user.role.toUpperCase() === 'ADMIN' || user.role.toUpperCase() === 'OWNER')
      );

      if (redirectPath) {
        navigate(redirectPath);
      } else if (isUserAdmin) {
        navigate('/admin');
      } else {
        navigate('/home');
      }
    } catch (err) {
      // Error toast is handled in AuthContext
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 px-4 max-w-md mx-auto space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[#8b4513] to-[#6c2f00] text-[#ffdbc9] flex items-center justify-center font-extrabold text-3xl mx-auto shadow-warm-md">
          🥖
        </div>
        <h1 className="font-headline font-extrabold text-2xl sm:text-3xl text-[#1b1c1c]">
          Sign In
        </h1>
        <p className="text-xs text-gray-500">
          Welcome back to KrishnaArjun Bakers • Sangola
        </p>
      </div>

      {/* Login Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#dac2b6]/40 shadow-warm-md space-y-5">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-gray-700 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#dac2b6]/60 bg-[#fcf9f8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fea619] font-medium text-gray-800 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#dac2b6]/60 bg-[#fcf9f8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fea619] font-medium text-gray-800 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#6c2f00] to-[#8b4513] hover:from-[#4a2003] hover:to-[#6c2f00] text-white font-headline font-bold text-xs shadow-warm-sm hover:shadow-warm-md transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 mt-2"
          >
            <span>{loading ? 'Signing In...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-3 text-center text-xs text-gray-500 border-t border-[#f0eded]">
          Don't have an account yet?{' '}
          <Link
            to={redirectPath ? `/register?redirect=${encodeURIComponent(redirectPath)}` : '/register'}
            className="font-bold text-[#8b4513] hover:underline"
          >
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
