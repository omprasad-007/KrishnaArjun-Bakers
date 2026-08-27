import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';
import api from '../services/api';
import { useToast } from './ToastContext';

const defaultAuthValue = {
  user: null,
  loading: false,
  isAdmin: false,
  isCustomer: false,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  updateProfile: async () => {},
};

export const AuthContext = createContext(defaultAuthValue);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const cached = localStorage.getItem('ka_firebase_user');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    // One-time catalog initialization check
    if (!localStorage.getItem('ka_catalog_initialized')) {
      api.seedInitialBakeryData()
        .then(() => localStorage.setItem('ka_catalog_initialized', 'true'))
        .catch(() => {});
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fast optimistic sync from cache or basic profile
        const cached = localStorage.getItem('ka_firebase_user');
        if (!cached) {
          const basicUser = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
            phone: '',
            email: firebaseUser.email,
            role: firebaseUser.email?.toLowerCase().includes('admin') ? 'ADMIN' : 'CUSTOMER',
            village: 'Sangola',
          };
          setUser(basicUser);
          localStorage.setItem('ka_firebase_user', JSON.stringify(basicUser));
        }

        // Background profile sync
        api.getMe(firebaseUser.uid).then((profile) => {
          if (profile) {
            setUser(profile);
            localStorage.setItem('ka_firebase_user', JSON.stringify(profile));
          }
        }).catch(() => {});
      } else {
        localStorage.removeItem('ka_firebase_user');
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      const profile = await api.login(email, password);
      setUser(profile);
      localStorage.setItem('ka_firebase_user', JSON.stringify(profile));
      toast.success(`Welcome back, ${profile.name || 'Customer'}!`);
      return profile;
    } catch (err) {
      toast.error(err.message || 'Login failed. Please check your credentials.');
      throw err;
    }
  };

  const register = async (userData) => {
    try {
      const profile = await api.register(userData);
      setUser(profile);
      localStorage.setItem('ka_firebase_user', JSON.stringify(profile));
      toast.success(`Welcome to KrishnaArjun Bakers, ${profile.name}!`);
      return profile;
    } catch (err) {
      toast.error(err.message || 'Registration failed.');
      throw err;
    }
  };

  const logout = async () => {
    try {
      await api.logout();
      setUser(null);
      localStorage.removeItem('ka_firebase_user');
      toast.info('Signed out successfully.');
    } catch (err) {
      console.error(err);
    }
  };

  const updateProfile = async (data) => {
    try {
      if (!user) return;
      const updated = await api.updateProfile(user.id, data);
      setUser(updated);
      localStorage.setItem('ka_firebase_user', JSON.stringify(updated));
      toast.success('Profile details updated successfully!');
      return updated;
    } catch (err) {
      toast.error(err.message || 'Failed to update profile.');
      throw err;
    }
  };

  const value = {
    user,
    loading,
    isAdmin: user?.role === 'ADMIN',
    isCustomer: user?.role === 'CUSTOMER',
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  return context || defaultAuthValue;
};

export default AuthContext;
