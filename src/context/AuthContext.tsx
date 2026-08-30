'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { auth as getAuth } from '@/lib/firebase/client';
import { UserProfile, UserBranding, UserSettings } from '@/types';
import { firestoreHelpers } from '@/lib/firebase/firestore';

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  branding: UserBranding | null;
  settings: UserSettings | null;
  loading: boolean;
  error: string | null;
  refreshProfile: () => Promise<void>;
  refreshBranding: () => Promise<void>;
  refreshSettings: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [branding, setBranding] = useState<UserBranding | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshProfile = async () => {
    if (!user) return;
    try {
      const data = await firestoreHelpers.getUserProfile(user.uid);
      setProfile(data);
    } catch (err) {
      console.error('Failed to refresh profile:', err);
    }
  };

  const refreshBranding = async () => {
    if (!user) return;
    try {
      const data = await firestoreHelpers.getUserBranding(user.uid);
      setBranding(data);
    } catch (err) {
      console.error('Failed to refresh branding:', err);
    }
  };

  const refreshSettings = async () => {
    if (!user) return;
    try {
      const data = await firestoreHelpers.getUserSettings(user.uid);
      setSettings(data);
    } catch (err) {
      console.error('Failed to refresh settings:', err);
    }
  };

  useEffect(() => {
    let cancelled = false;
    try {
      const authInstance = getAuth();
      if (!authInstance) {
        setLoading(false);
        return;
      }
      const unsubscribe = onAuthStateChanged(authInstance, async (firebaseUser) => {
        if (cancelled) return;
        setUser(firebaseUser);
        if (firebaseUser) {
          try {
            const profileData = await firestoreHelpers.getUserProfile(firebaseUser.uid);
            if (!cancelled) setProfile(profileData);
          } catch (err) {
            console.warn('Failed to load profile (non-critical):', err);
            if (!cancelled) setProfile(null);
          }
          try {
            const brandingData = await firestoreHelpers.getUserBranding(firebaseUser.uid);
            if (!cancelled) setBranding(brandingData);
          } catch (err) {
            console.warn('Failed to load branding (non-critical):', err);
            if (!cancelled) setBranding(null);
          }
          try {
            const settingsData = await firestoreHelpers.getUserSettings(firebaseUser.uid);
            if (!cancelled) setSettings(settingsData);
          } catch (err) {
            console.warn('Failed to load settings (non-critical):', err);
            if (!cancelled) setSettings(null);
          }
        } else {
          if (!cancelled) setProfile(null);
          if (!cancelled) setBranding(null);
          if (!cancelled) setSettings(null);
        }
        if (!cancelled) setLoading(false);
      });

      return () => {
        cancelled = true;
        unsubscribe();
      };
    } catch (err) {
      console.error('Auth initialization error:', err);
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent mx-auto" />
          <p className="mt-3 text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, profile, branding, settings, loading, error, refreshProfile, refreshBranding, refreshSettings }}>
      {error && (
        <div className="fixed top-0 left-0 right-0 z-[9999] p-3 bg-red-50 border-b border-red-200 text-red-700 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-3 text-red-500 hover:text-red-700 font-bold">✕</button>
        </div>
      )}
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}