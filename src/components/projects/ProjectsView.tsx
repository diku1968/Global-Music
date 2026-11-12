import React, { useState, useEffect } from 'react';
import {
  Disc3,
  Plus,
  Music,
  Users,
  Clock,
  Layers,
  Sparkles,
  Lock,
  Globe,
  Sliders,
  Send,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { projectService } from '../../services/projectService';
import { Project, NavTab } from '../../types';

export const ProjectsView: React.FC<{
  onOpenCreateProject: () => void;
  onNavigate: (tab: NavTab) => void;
  onOpenInStudio?: (projectId: string) => void;
}> = ({ onOpenCreateProject, onNavigate, onOpenInStudio }) => {
  const { user, signInWithGoogle } = useAuth();
  const [activeTab, setActiveTab] = useState<'my' | 'public'>('my');
  const [myProjects, setMyProjects] = useState<Project[]>([]);
  const [publicProjects, setPublicProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProjects = async () => {
    setLoading(true);
    try {
      if (user) {
        const mine = await projectService.getUserProjects(user.uid);
        setMyProjects(mine);
      }
      const pub = await projectService.listPublicProjects(100);
      setPublicProjects(pub);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [user]);

  const displayedProjects = activeTab === 'my' ? myProjects : publicProjects;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
            <Disc3 className="w-8 h-8 text-purple-400" />
            Music Projects & Stems
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Manage your multitrack songs and discover community projects seeking instrumentalists
          </p>
        </div>

        <button
          onClick={onOpenCreateProject}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-purple-900/40 flex items-center justify-center gap-2 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Song Project</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
        <button
          onClick={() => setActiveTab('my')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'my'
              ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          My Projects ({myProjects.length})
        </button>
        <button
          onClick={() => setActiveTab('public')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'public'
              ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Community Projects ({publicProjects.length})
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-56 rounded-2xl bg-zinc-900/40 border border-zinc-800 animate-pulse p-5"
            />
          ))}
        </div>
      ) : activeTab === 'my' && !user ? (
        <div className="p-12 text-center rounded-3xl bg-zinc-950/60 border border-dashed border-zinc-800 max-w-lg mx-auto">
          <Disc3 className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-2">Sign in to manage your projects</h3>
          <p className="text-xs text-zinc-400 mb-6">
            Create multitrack compositions, invite instrumentalists, and track timeline stems.
          </p>
          <button
            onClick={signInWithGoogle}
            className="px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-zinc-900 font-semibold text-xs shadow-lg transition-colors"
          >
            Sign In with Google
          </button>
        </div>
      ) : displayedProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayedProjects.map((p) => (
            <div
              key={p.projectId}
              className="p-5 rounded-2xl bg-zinc-950/70 hover:bg-zinc-900 border border-zinc-800 hover:border-purple-500/40 transition-all flex flex-col justify-between gap-4 group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-purple-950/70 border border-purple-500/40 text-purple-300">
                    {p.genre}
                  </span>
                  <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                    <span>{p.bpm} BPM</span>
                    <span>•</span>
                    <span>{p.musicKey || 'C Major'}</span>
                  </div>
                </div>

                <h3 className="font-bold text-white text-lg group-hover:text-purple-300 transition-colors mb-1">
                  {p.title}
                </h3>
                <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                  {p.description || 'Collaborative multitrack song production.'}
                </p>

                <div className="mt-4 pt-3 border-t border-zinc-800/80">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 block mb-1.5">
                    Roles Needed:
                  </span>
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

              <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                  <Clock className="w-3.5 h-3.5 text-zinc-500" />
                  <span>{p.timeSignature || '4/4'} Time</span>
                </div>

                <button
                  onClick={() => {
                    if (onOpenInStudio) onOpenInStudio(p.projectId);
                    else onNavigate('studio');
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 hover:text-white text-xs font-semibold transition-all flex items-center gap-1.5"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Open in Studio</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl bg-zinc-950/60 border border-dashed border-zinc-800 max-w-lg mx-auto">
          <Disc3 className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-2">No projects found</h3>
          <p className="text-xs text-zinc-400 mb-6">
            {activeTab === 'my'
              ? 'You have not started any song collaborations yet.'
              : 'No community projects currently posted.'}
          </p>
          <button
            onClick={onOpenCreateProject}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-lg shadow-purple-900/40 transition-colors"
          >
            Create Your First Song Project
          </button>
        </div>
      )}
    </div>
  );
};
