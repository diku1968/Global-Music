import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';
import { musicianService } from '../services/musicianService';
import { MusicianProfile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: MusicianProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  updateProfile: (profile: MusicianProfile) => Promise<void>;
  refreshProfile: () => Promise<void>;
  showProfileEditor: boolean;
  setShowProfileEditor: (show: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<MusicianProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showProfileEditor, setShowProfileEditor] = useState(false);

  const fetchProfile = async (uid: string, currentUser?: User) => {
    try {
      let p = await musicianService.getMusicianProfile(uid);
      if (!p && currentUser) {
        // First-time profile initialization with user's Google details
        const initialProfile: MusicianProfile = {
          userId: uid,
          displayName: currentUser.displayName || 'Session Musician',
          email: currentUser.email || '',
          photoURL: currentUser.photoURL || '',
          bio: 'Passionate musician looking to collaborate with artists across the globe.',
          country: 'United States',
          preferredLanguage: 'English',
          primaryInstrument: 'Guitar',
          instruments: ['Guitar'],
          skills: ['Songwriting', 'Rhythm Section', 'Arranging'],
          experienceLevel: 'Intermediate',
          portfolioLinks: [],
          followersCount: 0,
          followingCount: 0,
          isAvailableForCollab: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await musicianService.saveMusicianProfile(initialProfile);
        p = initialProfile;
        // Prompt them to review their profile
        setShowProfileEditor(true);
      }
      setProfile(p);
    } catch (err) {
      console.error('Failed to load musician profile:', err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchProfile(currentUser.uid, currentUser);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        await fetchProfile(result.user.uid, result.user);
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signOutUser = async () => {
    try {
      await signOut(auth);
      setProfile(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const updateProfile = async (updated: MusicianProfile) => {
    await musicianService.saveMusicianProfile(updated);
    setProfile(updated);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.uid, user);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signInWithGoogle,
        signOutUser,
        updateProfile,
        refreshProfile,
        showProfileEditor,
        setShowProfileEditor,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
