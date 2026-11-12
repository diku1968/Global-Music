import React, { useState, useEffect } from 'react';
import {
  Music,
  Plus,
  Radio,
  Users,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  Sparkles,
  ArrowRight,
  Disc3,
  Sliders,
  Layers,
  Globe,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { CollaborationInvitation, Project, MusicianProfile, NavTab } from '../../types';
import { invitationService } from '../../services/invitationService';
import { projectService } from '../../services/projectService';
import { musicianService } from '../../services/musicianService';

export const DashboardOverview: React.FC<{
  onNavigate: (tab: NavTab) => void;
  onOpenCreateProject: () => void;
  onSelectMusician: (musician: MusicianProfile) => void;
}> = ({ onNavigate, onOpenCreateProject, onSelectMusician }) => {
  const { user, profile, setShowProfileEditor, signInWithGoogle } = useAuth();
  const { toast } = useToast();

  const [receivedInvites, setReceivedInvites] = useState<CollaborationInvitation[]>([]);
  const [userProjects, setUserProjects] = useState<Project[]>([]);
  const [publicProjects, setPublicProjects] = useState<Project[]>([]);
  const [featuredMusicians, setFeaturedMusicians] = useState<MusicianProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      if (user) {
        const [invites, myProjs] = await Promise.all([
          invitationService.getUserInvitations(user.uid),
          projectService.getUserProjects(user.uid),
        ]);
        setReceivedInvites(invites.received);
        setUserProjects(myProjs);
      }

      const [pubProjs, allMusicians] = await Promise.all([
        projectService.listPublicProjects(6),
        musicianService.listMusicians({ availableOnly: true }),
      ]);
      setPublicProjects(pubProjs);
      setFeaturedMusicians(allMusicians.slice(0, 4));
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const handleRespondInvite = async (invitationId: string, status: 'accepted' | 'rejected') => {
    try {
      await invitationService.respondToInvitation(invitationId, status);
      setReceivedInvites((prev) =>
        prev.map((inv) => (inv.invitationId === invitationId ? { ...inv, status } : inv))
      );
      toast(`Invitation ${status}!`, 'success');
    } catch {
      toast('Failed to update invitation status', 'error');
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Studio Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-zinc-950 border border-zinc-800/80 p-6 sm:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-[500px] h-[300px] bg-gradient-to-bl from-purple-600/20 via-indigo-600/10 to-transparent blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-purple-500/10 border border-purple-500/30 text-purple-300">
                Global Studio Control Room
              </span>
              <span className="flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Audio Engine Ready
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
              Produce Music with Artists Worldwide.
            </h1>
            <p className="text-sm sm:text-base text-zinc-300 mt-3 leading-relaxed">
              Connect your musical instruments, lay down synchronized timeline stems, or launch a live real-time jamming session with musicians around the globe.
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-6">
              <button
                onClick={onOpenCreateProject}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-xl shadow-purple-950/50 flex items-center gap-2 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Start New Song Project</span>
              </button>

              <button
                onClick={() => onNavigate('discover')}
                className="px-5 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 font-semibold text-xs sm:text-sm transition-all flex items-center gap-2"
              >
                <Users className="w-4 h-4 text-purple-400" />
                <span>Find Musicians</span>
              </button>

              <button
                onClick={() => onNavigate('studio')}
                className="px-5 py-3 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 font-semibold text-xs sm:text-sm transition-all flex items-center gap-2"
              >
                <Sliders className="w-4 h-4 text-cyan-400" />
                <span>Multitrack Studio</span>
              </button>
            </div>
          </div>

          {/* Quick Musician Profile Snapshot */}
          <div className="w-full lg:w-80 bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 shrink-0 shadow-lg">
            {user ? (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  {profile?.photoURL ? (
                    <img
                      src={profile.photoURL}
                      alt={profile.displayName}
                      className="w-12 h-12 rounded-xl object-cover border border-purple-500/50"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center font-bold text-white text-lg">
                      {(profile?.displayName || 'GM').substring(0, 2).toUpperCase()}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-white truncate text-sm">
                      {profile?.displayName || 'Session Musician'}
                    </h3>
                    <p className="text-xs text-purple-300 font-medium">
                      {profile?.primaryInstrument || 'Guitarist'} • {profile?.experienceLevel || 'Intermediate'}
                    </p>
                    <p className="text-[11px] text-zinc-400 truncate">
                      {profile?.country || 'Global Musician'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center py-2.5 px-3 bg-zinc-950/60 rounded-xl border border-zinc-800/80 mb-3 text-xs">
                  <div>
                    <span className="text-[10px] uppercase text-zinc-500 block">Projects</span>
                    <span className="font-bold text-white text-sm">{userProjects.length}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-zinc-500 block">Invites</span>
                    <span className="font-bold text-purple-400 text-sm">
                      {receivedInvites.filter((i) => i.status === 'pending').length}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setShowProfileEditor(true)}
                  className="w-full py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs font-semibold text-zinc-200 transition-colors"
                >
                  Edit Profile & Instruments
                </button>
              </div>
            ) : (
              <div className="text-center py-2">
                <div className="w-10 h-10 rounded-xl bg-purple-950/60 border border-purple-500/30 text-purple-400 flex items-center justify-center mx-auto mb-3">
                  <Music className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-white text-sm mb-1">Musician Portal</h4>
                <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
                  Sign in with Google to establish your artist identity and start jamming.
                </p>
                <button
                  onClick={signInWithGoogle}
                  className="w-full py-2.5 px-3 rounded-xl bg-white hover:bg-zinc-200 text-zinc-900 font-bold text-xs shadow-md transition-colors"
                >
                  Sign In with Google
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Collaboration Invitations Section */}
      {user && receivedInvites.length > 0 && (
        <div className="bg-zinc-950/70 border border-zinc-800 rounded-3xl p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-500/40 text-purple-300 flex items-center justify-center">
                <Send className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-white">Collaboration Invitations</h2>
            </div>
            <span className="text-xs font-medium text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20">
              {receivedInvites.filter((i) => i.status === 'pending').length} Pending
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {receivedInvites.map((inv) => (
              <div
                key={inv.invitationId}
                className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <h4 className="font-semibold text-white text-sm">{inv.projectTitle}</h4>
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        inv.status === 'pending'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : inv.status === 'accepted'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </div>
                  <p className="text-xs text-purple-300 font-medium">
                    Requested Role: {inv.instrument || 'Instrumentalist'}
                  </p>
                  <p className="text-xs text-zinc-400 mt-1 italic">"{inv.message}"</p>
                  <p className="text-[11px] text-zinc-500 mt-2">
                    Invited by <span className="text-zinc-300 font-medium">{inv.senderName}</span>
                  </p>
                </div>

                {inv.status === 'pending' && (
                  <div className="flex items-center gap-2 pt-2 border-t border-zinc-800/80">
                    <button
                      onClick={() => handleRespondInvite(inv.invitationId, 'accepted')}
                      className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Accept & Join
                    </button>
                    <button
                      onClick={() => handleRespondInvite(inv.invitationId, 'rejected')}
                      className="py-1.5 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium flex items-center justify-center gap-1 transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Decline
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Featured Session Musicians Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-400" />
              Available Session Musicians
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Musicians currently open for recording contributions
            </p>
          </div>
          <button
            onClick={() => onNavigate('discover')}
            className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
          >
            <span>Explore All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {featuredMusicians.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredMusicians.map((musician) => (
              <div
                key={musician.userId}
                onClick={() => onSelectMusician(musician)}
                className="p-4 rounded-2xl bg-zinc-950/70 hover:bg-zinc-900 border border-zinc-800 hover:border-purple-500/50 transition-all cursor-pointer flex flex-col justify-between gap-3 group"
              >
                <div className="flex items-center gap-3">
                  {musician.photoURL ? (
                    <img
                      src={musician.photoURL}
                      alt={musician.displayName}
                      className="w-10 h-10 rounded-xl object-cover border border-zinc-700"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center font-bold text-white text-sm">
                      {musician.displayName.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-white group-hover:text-purple-300 transition-colors text-sm truncate">
                      {musician.displayName}
                    </h4>
                    <p className="text-xs text-purple-400 font-medium truncate">
                      {musician.primaryInstrument}
                    </p>
                  </div>
                </div>

                <div className="text-xs text-zinc-400 line-clamp-2">
                  {musician.bio || 'Available for multitrack recording and live collaboration.'}
                </div>

                <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-2 border-t border-zinc-800/80">
                  <span className="flex items-center gap-1">
                    <Globe className="w-3 h-3" />
                    {musician.country || 'Global'}
                  </span>
                  <span className="text-emerald-400 font-medium">Ready to Jam</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-zinc-950/50 border border-zinc-800 text-center">
            <p className="text-sm text-zinc-400">
              No musicians currently listed with open availability. Visit Discover to see all artists.
            </p>
          </div>
        )}
      </div>

      {/* Public Projects & Collaborations */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <Disc3 className="w-5 h-5 text-cyan-400" />
              Active Collaborative Projects
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Open songs seeking instrumentalists and vocalists
            </p>
          </div>
          <button
            onClick={() => onNavigate('projects')}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
          >
            <span>View All Projects</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {publicProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {publicProjects.map((p) => (
              <div
                key={p.projectId}
                onClick={() => onNavigate('projects')}
                className="p-5 rounded-2xl bg-zinc-950/70 hover:bg-zinc-900 border border-zinc-800 hover:border-cyan-500/40 transition-all cursor-pointer flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-cyan-950/60 border border-cyan-500/30 text-cyan-300">
                      {p.genre || 'Song'}
                    </span>
                    <span className="text-xs font-mono text-zinc-400">{p.bpm} BPM</span>
                  </div>

                  <h3 className="font-bold text-white text-base mb-1">{p.title}</h3>
                  <p className="text-xs text-zinc-400 line-clamp-2">
                    {p.description || 'Open multitrack session project awaiting instrumental contributions.'}
                  </p>
                </div>

                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
                    Instruments Needed:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {(p.requiredInstruments || ['Guitar', 'Bass', 'Drums']).map((inst) => (
                      <span
                        key={inst}
                        className="text-[11px] px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300"
                      >
                        {inst}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-zinc-950/50 border border-zinc-800 text-center">
            <p className="text-sm text-zinc-400 mb-3">
              No public projects created yet. Be the first to start a collaborative track!
            </p>
            <button
              onClick={onOpenCreateProject}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold"
            >
              Create First Project
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
