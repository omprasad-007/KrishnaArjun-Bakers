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
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    // Initial bakery catalog seed in Firestore if empty
    api.seedInitialBakeryData().catch(() => {});

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const profile = await api.getMe(firebaseUser.uid);
          if (profile) {
            setUser(profile);
            localStorage.setItem('ka_firebase_user', JSON.stringify(profile));
          } else {
            const basicUser = {
              id: firebaseUser.uid,
              name: firebaseUser.displayName || 'Customer',
              phone: firebaseUser.email?.split('@')[0] || '',
              email: firebaseUser.email,
              role: firebaseUser.email?.includes('admin') ? 'ADMIN' : 'CUSTOMER',
              village: 'Sangola',
            };
            setUser(basicUser);
            localStorage.setItem('ka_firebase_user', JSON.stringify(basicUser));
          }
        } catch (err) {
          console.error("Profile sync error:", err);
        }
      } else {
        const cached = localStorage.getItem('ka_firebase_user');
        if (!cached) {
          setUser(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (phoneOrEmail, password) => {
    try {
      // Check admin shortcut
      if (phoneOrEmail === '9876543210' && password === 'admin123') {
        const adminProfile = {
          id: 'admin_sangola_01',
          name: 'Arjun Shinde (Bakery Owner)',
          phone: '9876543210',
          email: 'admin@krishnaarjunbakers.com',
          role: 'ADMIN',
          address: 'Main Market Road, Near ST Stand',
          village: 'Sangola',
          taluka: 'Sangola',
          district: 'Solapur',
          state: 'Maharashtra',
        };
        setUser(adminProfile);
        localStorage.setItem('ka_firebase_user', JSON.stringify(adminProfile));
        toast.success('Welcome back, Admin Arjun Shinde!');
        return adminProfile;
      }

      const profile = await api.login(phoneOrEmail, password);
      setUser(profile);
      localStorage.setItem('ka_firebase_user', JSON.stringify(profile));
      toast.success(`Welcome back, ${profile.name || 'Customer'}!`);
      return profile;
    } catch (err) {
      toast.error(err.message || 'Login failed. Please check credentials.');
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
    } catch (e) {}
    localStorage.removeItem('ka_firebase_user');
    setUser(null);
    toast.info('Logged out successfully.');
  };

  const updateProfile = async (updates) => {
    try {
      if (!user) return;
      const updated = await api.updateProfile(user.id, updates);
      setUser(updated);
      localStorage.setItem('ka_firebase_user', JSON.stringify(updated));
      toast.success('Profile updated successfully!');
      return updated;
    } catch (err) {
      toast.error(err.message || 'Failed to update profile.');
      throw err;
    }
  };

  const isAdmin = user?.role === 'ADMIN';
  const isCustomer = user?.role === 'CUSTOMER';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        isCustomer,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  return context || defaultAuthValue;
};

export default AuthContext;
