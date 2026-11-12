import React, { useState } from 'react';
import {
  Music,
  Plus,
  Bell,
  User,
  LogIn,
  Sliders,
  Radio,
  Sparkles,
  Smartphone,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { NavTab } from '../../types';
import { PWAInstallButton } from '../pwa/PWAInstallButton';
import { AndroidExportModal } from '../android/AndroidExportModal';
import { GooglePlayBundleModal } from '../android/GooglePlayBundleModal';

export const Navbar: React.FC<{
  currentTab: NavTab;
  onNavigate: (tab: NavTab) => void;
  onOpenCreateProject: () => void;
  pendingInvitesCount: number;
}> = ({ currentTab, onNavigate, onOpenCreateProject, pendingInvitesCount }) => {
  const { user, profile, signInWithGoogle, setShowProfileEditor } = useAuth();
  const [showAndroidModal, setShowAndroidModal] = useState(false);
  const [showGooglePlayModal, setShowGooglePlayModal] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/80 px-4 sm:px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div
          onClick={() => onNavigate('home')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-purple-900/30 group-hover:scale-105 transition-transform">
            <Music className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-black tracking-tight text-white group-hover:text-purple-300 transition-colors">
                Global Music Jam
              </span>
              <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Studio v1.0
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 hidden sm:block">
              Collaborative Music Creation Platform
            </p>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile Install Button */}
          <PWAInstallButton />

          {/* Pure Android Project / APK Button */}
          <button
            onClick={() => setShowAndroidModal(true)}
            title="Inspect & Build Pure Native Android APK"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 hover:text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span>Android (APK)</span>
          </button>

          {/* Option 3: Google Play Store Bundle (.AAB) Button */}
          <button
            onClick={() => setShowGooglePlayModal(true)}
            title="Option 3: Google Play Store Bundle (.AAB) Release Pipeline"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 border border-purple-500/40 text-purple-300 hover:text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Play Store (.AAB)</span>
          </button>

          {/* Quick Create Project */}
          <button
            onClick={onOpenCreateProject}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-md shadow-purple-900/30 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Song</span>
          </button>

          {/* Notifications / Invites indicator */}
          <button
            onClick={() => onNavigate('home')}
            title="Invitations & Notifications"
            className="relative p-2 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-colors"
          >
            <Bell className="w-4 h-4" />
            {pendingInvitesCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
                {pendingInvitesCount}
              </span>
            )}
          </button>

          {/* User Auth Profile */}
          {user ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('profile')}
                className="flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-colors"
              >
                {profile?.photoURL ? (
                  <img
                    src={profile.photoURL}
                    alt={profile.displayName}
                    className="w-7 h-7 rounded-lg object-cover border border-purple-500/50"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-lg bg-purple-600 flex items-center justify-center text-white text-xs font-bold">
                    {(profile?.displayName || 'GM').substring(0, 2).toUpperCase()}
                  </div>
                )}
                <span className="text-xs font-medium text-zinc-200 hidden md:block max-w-[110px] truncate">
                  {profile?.displayName || 'Musician'}
                </span>
              </button>
            </div>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-zinc-900 font-semibold text-xs shadow-md transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>

      <AndroidExportModal
        isOpen={showAndroidModal}
        onClose={() => setShowAndroidModal(false)}
      />

      <GooglePlayBundleModal
        isOpen={showGooglePlayModal}
        onClose={() => setShowGooglePlayModal(false)}
      />
    </header>
  );
};
