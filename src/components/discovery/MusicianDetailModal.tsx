import React, { useState, useEffect } from 'react';
import {
  X,
  Music,
  Globe,
  Award,
  Link as LinkIcon,
  Send,
  MessageSquare,
  UserPlus,
  UserCheck,
  CheckCircle2,
  Headphones,
  ExternalLink,
} from 'lucide-react';
import { MusicianProfile } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { musicianService } from '../../services/musicianService';

export const MusicianDetailModal: React.FC<{
  musician: MusicianProfile | null;
  onClose: () => void;
  onInvite: (musician: MusicianProfile) => void;
  onMessage: (musician: MusicianProfile) => void;
}> = ({ musician, onClose, onInvite, onMessage }) => {
  const { user, setShowProfileEditor } = useAuth();
  const { toast } = useToast();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loadingFollow, setLoadingFollow] = useState(false);

  const isSelf = user?.uid === musician?.userId;

  useEffect(() => {
    if (user && musician && !isSelf) {
      musicianService.isFollowing(musician.userId).then(setIsFollowing);
    }
  }, [user, musician, isSelf]);

  if (!musician) return null;

  const handleToggleFollow = async () => {
    if (!user) {
      toast('Please sign in to follow musicians', 'info');
      return;
    }
    setLoadingFollow(true);
    try {
      if (isFollowing) {
        await musicianService.unfollowMusician(musician.userId);
        setIsFollowing(false);
        toast(`Unfollowed ${musician.displayName}`, 'info');
      } else {
        await musicianService.followMusician(musician.userId);
        setIsFollowing(true);
        toast(`Following ${musician.displayName}!`, 'success');
      }
    } catch {
      toast('Failed to update follow state', 'error');
    } finally {
      setLoadingFollow(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl p-6 sm:p-8 text-zinc-100 my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b border-zinc-800">
          {musician.photoURL ? (
            <img
              src={musician.photoURL}
              alt={musician.displayName}
              className="w-24 h-24 rounded-2xl object-cover border-2 border-purple-500/40 shadow-xl shadow-purple-950/30"
            />
          ) : (
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-600 to-cyan-500 flex items-center justify-center font-bold text-3xl text-white shadow-xl shadow-purple-950/40">
              {musician.displayName.substring(0, 2).toUpperCase()}
            </div>
          )}

          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white flex items-center justify-center sm:justify-start gap-2">
                  {musician.displayName}
                  {isSelf && (
                    <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30">
                      Your Profile
                    </span>
                  )}
                </h2>
                <div className="flex items-center justify-center sm:justify-start gap-3 text-xs text-zinc-400 mt-1">
                  <span className="flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-zinc-500" />
                    {musician.country || 'Global'}
                  </span>
                  {musician.preferredLanguage && (
                    <span>• {musician.preferredLanguage}</span>
                  )}
                </div>
              </div>

              {/* Status Badge */}
              <div
                className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border self-center sm:self-start ${
                  musician.isAvailableForCollab
                    ? 'bg-emerald-950/50 text-emerald-300 border-emerald-500/30'
                    : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    musician.isAvailableForCollab ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'
                  }`}
                />
                <span>
                  {musician.isAvailableForCollab
                    ? 'Available for Collab'
                    : 'Currently Booked'}
                </span>
              </div>
            </div>

            {/* Quick Badges */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-4">
              <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-lg bg-purple-950/70 border border-purple-500/40 text-purple-200 font-semibold">
                <Music className="w-3.5 h-3.5 text-purple-400" />
                Primary: {musician.primaryInstrument}
              </span>
              {musician.experienceLevel && (
                <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300">
                  <Award className="w-3.5 h-3.5 text-cyan-400" />
                  {musician.experienceLevel} Level
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="py-5 border-b border-zinc-800">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
            About the Musician
          </h4>
          <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
            {musician.bio || 'This musician has not added an artist biography yet.'}
          </p>
        </div>

        {/* Instruments & Skills Grid */}
        <div className="py-5 border-b border-zinc-800 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2.5">
              Instruments
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {(musician.instruments || [musician.primaryInstrument]).map((inst) => (
                <span
                  key={inst}
                  className="px-2.5 py-1 rounded-md text-xs bg-zinc-900 border border-zinc-700/60 text-zinc-200 font-medium"
                >
                  {inst}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2.5">
              Skills & Production Expertise
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {(musician.skills || ['Session Recording']).map((skill) => (
                <span
                  key={skill}
                  className="px-2.5 py-1 rounded-md text-xs bg-cyan-950/50 border border-cyan-500/30 text-cyan-200"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Music Portfolio & External Links */}
        <div className="py-5 border-b border-zinc-800">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2.5 flex items-center gap-1.5">
            <Headphones className="w-4 h-4 text-purple-400" />
            Music Portfolio & Stems
          </h4>
          {musician.portfolioLinks && musician.portfolioLinks.length > 0 ? (
            <div className="space-y-2">
              {musician.portfolioLinks.map((link, idx) => (
                <a
                  key={idx}
                  href={link.startsWith('http') ? link : `https://${link}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/70 hover:bg-zinc-900 border border-zinc-800 hover:border-purple-500/50 text-xs text-purple-300 transition-all group"
                >
                  <span className="truncate max-w-md font-mono text-zinc-200">{link}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-zinc-500 group-hover:text-purple-400 transition-colors shrink-0" />
                </a>
              ))}
            </div>
          ) : (
            <p className="text-xs text-zinc-500 italic">No external portfolio links provided.</p>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="pt-6 flex flex-wrap items-center justify-between gap-3">
          {!isSelf ? (
            <>
              <button
                onClick={handleToggleFollow}
                disabled={loadingFollow}
                className={`py-2.5 px-4 rounded-xl text-xs font-medium border flex items-center gap-2 transition-all ${
                  isFollowing
                    ? 'bg-zinc-900 border-purple-500/40 text-purple-300'
                    : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:bg-zinc-800'
                }`}
              >
                {isFollowing ? (
                  <>
                    <UserCheck className="w-4 h-4 text-purple-400" />
                    <span>Following</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Follow Musician</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    onClose();
                    onMessage(musician);
                  }}
                  className="py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-medium text-white transition-colors flex items-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Send Message</span>
                </button>

                <button
                  onClick={() => {
                    onClose();
                    onInvite(musician);
                  }}
                  className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-xs font-bold text-white shadow-lg shadow-purple-950/50 transition-all flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Invite to Collaboration</span>
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={() => {
                onClose();
                setShowProfileEditor(true);
              }}
              className="py-2.5 px-5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white shadow-lg shadow-purple-950/50 transition-all"
            >
              Edit Your Profile Details
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
