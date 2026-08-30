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
    const unsubscribe = onAuthStateChanged(getAuth(), async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const [profileData, brandingData, settingsData] = await Promise.all([
          firestoreHelpers.getUserProfile(firebaseUser.uid),
          firestoreHelpers.getUserBranding(firebaseUser.uid),
          firestoreHelpers.getUserSettings(firebaseUser.uid),
        ]);
        setProfile(profileData);
        setBranding(brandingData);
        setSettings(settingsData);
      } else {
        setProfile(null);
        setBranding(null);
        setSettings(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, profile, branding, settings, loading, refreshProfile, refreshBranding, refreshSettings }}>
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