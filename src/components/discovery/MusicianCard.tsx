import React, { useState, useEffect } from 'react';
import {
  Music,
  Globe,
  Award,
  UserPlus,
  UserCheck,
  Send,
  Sparkles,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';
import { MusicianProfile } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { musicianService } from '../../services/musicianService';

const INSTRUMENT_COLORS: Record<string, string> = {
  Guitar: 'from-amber-500 to-orange-600',
  Bass: 'from-blue-600 to-indigo-700',
  Drums: 'from-red-600 to-rose-700',
  Keyboard: 'from-emerald-500 to-teal-600',
  Piano: 'from-cyan-500 to-blue-600',
  Vocals: 'from-purple-500 to-pink-600',
  Violin: 'from-yellow-600 to-amber-700',
  Flute: 'from-teal-400 to-emerald-600',
  Percussion: 'from-orange-500 to-red-600',
  Producer: 'from-fuchsia-600 to-purple-800',
  Saxophone: 'from-amber-400 to-yellow-600',
};

export const MusicianCard: React.FC<{
  musician: MusicianProfile;
  onViewDetails: (musician: MusicianProfile) => void;
  onInvite: (musician: MusicianProfile) => void;
  onMessage: (musician: MusicianProfile) => void;
}> = ({ musician, onViewDetails, onInvite, onMessage }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loadingFollow, setLoadingFollow] = useState(false);

  const isSelf = user?.uid === musician.userId;

  useEffect(() => {
    if (user && !isSelf) {
      musicianService.isFollowing(musician.userId).then(setIsFollowing);
    }
  }, [user, musician.userId, isSelf]);

  const handleToggleFollow = async (e: React.MouseEvent) => {
    e.stopPropagation();
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
      toast('Action could not be completed', 'error');
    } finally {
      setLoadingFollow(false);
    }
  };

  const gradient =
    INSTRUMENT_COLORS[musician.primaryInstrument] || 'from-purple-600 to-indigo-600';

  return (
    <div
      onClick={() => onViewDetails(musician)}
      className="group relative bg-zinc-900/50 hover:bg-zinc-900/80 border border-zinc-800 hover:border-purple-500/50 rounded-2xl p-5 transition-all duration-300 hover:shadow-xl hover:shadow-purple-950/20 flex flex-col justify-between cursor-pointer"
    >
      <div>
        {/* Header & Avatar */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            {musician.photoURL ? (
              <img
                src={musician.photoURL}
                alt={musician.displayName}
                className="w-12 h-12 rounded-xl object-cover border border-zinc-700/80"
              />
            ) : (
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center font-bold text-white shadow-md`}
              >
                {musician.displayName.substring(0, 2).toUpperCase()}
              </div>
            )}

            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-semibold text-white group-hover:text-purple-300 transition-colors text-base truncate max-w-[150px]">
                  {musician.displayName}
                </h3>
                {isSelf && (
                  <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded border border-purple-500/30">
                    You
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-0.5">
                <Globe className="w-3.5 h-3.5 text-zinc-500" />
                <span className="truncate max-w-[140px]">{musician.country || 'Global Musician'}</span>
              </div>
            </div>
          </div>

          {/* Collab Availability Indicator */}
          <div
            className={`flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full border ${
              musician.isAvailableForCollab
                ? 'bg-emerald-950/50 text-emerald-300 border-emerald-500/30'
                : 'bg-zinc-900 text-zinc-500 border-zinc-800'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                musician.isAvailableForCollab ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'
              }`}
            />
            <span>{musician.isAvailableForCollab ? 'Open' : 'Busy'}</span>
          </div>
        </div>

        {/* Primary Instrument and Experience */}
        <div className="flex items-center gap-2 mb-3">
          <span
            className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg font-medium text-white bg-gradient-to-r ${gradient} shadow-sm`}
          >
            <Music className="w-3 h-3" />
            {musician.primaryInstrument}
          </span>

          {musician.experienceLevel && (
            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md bg-zinc-800/80 border border-zinc-700/60 text-zinc-300">
              <Award className="w-3 h-3 text-cyan-400" />
              {musician.experienceLevel}
            </span>
          )}
        </div>

        {/* Bio snippet */}
        <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed mb-4 min-h-[32px]">
          {musician.bio || 'Musician passionate about global collaborative compositions and session tracking.'}
        </p>

        {/* Skills Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {(musician.skills || ['Multi-instrumentalist']).slice(0, 3).map((skill) => (
            <span
              key={skill}
              className="text-[11px] px-2 py-0.5 rounded bg-zinc-800/60 text-zinc-300 border border-zinc-800"
            >
              {skill}
            </span>
          ))}
          {musician.skills && musician.skills.length > 3 && (
            <span className="text-[10px] text-zinc-500 self-center">
              +{musician.skills.length - 3}
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-2">
        {!isSelf ? (
          <>
            <button
              onClick={handleToggleFollow}
              disabled={loadingFollow}
              className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition-all ${
                isFollowing
                  ? 'bg-zinc-800 text-purple-300 border-purple-500/40 hover:bg-zinc-700'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-700'
              }`}
            >
              {isFollowing ? (
                <>
                  <UserCheck className="w-3.5 h-3.5 text-purple-400" />
                  <span>Following</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Follow</span>
                </>
              )}
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onMessage(musician);
              }}
              title="Private Message"
              className="p-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onInvite(musician);
              }}
              className="flex-1 py-1.5 px-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md shadow-purple-950/50 flex items-center justify-center gap-1.5 transition-all"
            >
              <Send className="w-3 h-3" />
              <span>Collab</span>
            </button>
          </>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(musician);
            }}
            className="w-full py-1.5 px-3 rounded-xl text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-colors"
          >
            Manage Your Profile
          </button>
        )}
      </div>
    </div>
  );
};
