import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyA4LGI2aDUfpVlA8yJPEnx3YDjyDMoTm94",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "krishnaarjun-bakers.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "krishnaarjun-bakers",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "krishnaarjun-bakers.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "270470926044",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:270470926044:web:1fb2ec4485596ab160ae19",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-Q60VBB1GNC"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);
export const storage = getStorage(app);

// Analytics support check
let analytics = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {});
}

export { analytics };
export default app;
