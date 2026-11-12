import React from 'react';
import {
  User,
  Music,
  Globe,
  Award,
  Edit3,
  Link as LinkIcon,
  Headphones,
  CheckCircle2,
  Users,
  LogOut,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const MusicianProfileView: React.FC = () => {
  const { user, profile, setShowProfileEditor, signOutUser, signInWithGoogle } = useAuth();
  const { toast } = useToast();

  if (!user) {
    return (
      <div className="p-12 text-center rounded-3xl bg-zinc-950/60 border border-dashed border-zinc-800 max-w-lg mx-auto my-12">
        <User className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
        <h3 className="text-base font-bold text-white mb-2">Musician Identity</h3>
        <p className="text-xs text-zinc-400 mb-6">
          Sign in to access and manage your personal artist profile, instrument skills, and portfolio.
        </p>
        <button
          onClick={signInWithGoogle}
          className="px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-zinc-900 font-semibold text-xs shadow-lg transition-colors"
        >
          Sign In with Google
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Profile Card Header */}
      <div className="relative overflow-hidden rounded-3xl bg-zinc-950 border border-zinc-800 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 pb-6 border-b border-zinc-800">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
            {profile?.photoURL ? (
              <img
                src={profile.photoURL}
                alt={profile.displayName}
                className="w-24 h-24 rounded-2xl object-cover border-2 border-purple-500/50 shadow-xl shadow-purple-950/40"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-600 to-cyan-500 flex items-center justify-center font-bold text-3xl text-white shadow-xl shadow-purple-950/40">
                {(profile?.displayName || 'GM').substring(0, 2).toUpperCase()}
              </div>
            )}

            <div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  {profile?.displayName || 'Independent Musician'}
                </h1>
                <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30">
                  Verified Artist
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-zinc-400 mt-1">
                <span className="flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-zinc-500" />
                  {profile?.country || 'Global'}
                </span>
                <span>•</span>
                <span>Language: {profile?.preferredLanguage || 'English'}</span>
                <span>•</span>
                <span className="text-zinc-500 font-mono text-[11px]">{user.email}</span>
              </div>

              {/* Status */}
              <div className="mt-3 flex items-center justify-center sm:justify-start gap-2">
                <div
                  className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border ${
                    profile?.isAvailableForCollab
                      ? 'bg-emerald-950/50 text-emerald-300 border-emerald-500/30'
                      : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      profile?.isAvailableForCollab ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'
                    }`}
                  />
                  <span>
                    {profile?.isAvailableForCollab
                      ? 'Available for Global Collaborations'
                      : 'Currently Inactive / Busy'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setShowProfileEditor(true)}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-lg shadow-purple-950/40 flex items-center gap-2 transition-all"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </button>

            <button
              onClick={signOutUser}
              title="Sign Out"
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-rose-400 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bio */}
        <div className="py-5 border-b border-zinc-800">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
            Artist Biography
          </h3>
          <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
            {profile?.bio ||
              'No biography added yet. Click "Edit Profile" to share your musical background, equipment, and influences with collaborators.'}
          </p>
        </div>

        {/* Instruments & Skills */}
        <div className="py-5 border-b border-zinc-800 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2.5 flex items-center gap-1.5">
              <Music className="w-3.5 h-3.5 text-purple-400" />
              Instruments Played
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {(profile?.instruments || [profile?.primaryInstrument || 'Guitar']).map((inst) => (
                <span
                  key={inst}
                  className="px-3 py-1 rounded-lg text-xs bg-zinc-900 border border-zinc-800 text-zinc-200 font-medium"
                >
                  {inst} {inst === profile?.primaryInstrument && '(Primary)'}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2.5 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-cyan-400" />
              Production Skills & Techniques
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {(profile?.skills || ['Songwriting', 'Session Recording']).map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 rounded-lg text-xs bg-cyan-950/40 border border-cyan-500/30 text-cyan-200"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Portfolio Links */}
        <div className="pt-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2.5 flex items-center gap-1.5">
            <Headphones className="w-3.5 h-3.5 text-indigo-400" />
            Music Portfolio & Stems
          </h3>
          {profile?.portfolioLinks && profile.portfolioLinks.length > 0 ? (
            <div className="space-y-2">
              {profile.portfolioLinks.map((link, idx) => (
                <a
                  key={idx}
                  href={link.startsWith('http') ? link : `https://${link}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 hover:border-purple-500/50 text-xs text-purple-300 transition-all group"
                >
                  <span className="truncate max-w-lg font-mono text-zinc-200">{link}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-zinc-500 group-hover:text-purple-400 transition-colors shrink-0" />
                </a>
              ))}
            </div>
          ) : (
            <p className="text-xs text-zinc-500 italic">
              No portfolio links added yet. Add links to your SoundCloud, BandLab, YouTube, or Spotify tracks.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
