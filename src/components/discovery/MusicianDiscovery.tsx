import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Users,
  Music,
  Sparkles,
  Compass,
  CheckCircle,
  RefreshCw,
  UserPlus,
} from 'lucide-react';
import { MusicianProfile } from '../../types';
import { musicianService } from '../../services/musicianService';
import { MusicianCard } from './MusicianCard';
import { MusicianDetailModal } from './MusicianDetailModal';
import { SendInviteModal } from './SendInviteModal';
import { useAuth } from '../../context/AuthContext';

const INSTRUMENT_FILTERS = [
  { label: 'All Instruments', value: 'All' },
  { label: 'Guitarist', value: 'Guitar' },
  { label: 'Drummer', value: 'Drums' },
  { label: 'Keyboardist', value: 'Keyboard' },
  { label: 'Pianist', value: 'Piano' },
  { label: 'Bassist', value: 'Bass' },
  { label: 'Vocalist', value: 'Vocals' },
  { label: 'Violinist', value: 'Violin' },
  { label: 'Flutist', value: 'Flute' },
  { label: 'Percussionist', value: 'Percussion' },
  { label: 'Music Producer', value: 'Producer' },
  { label: 'Other', value: 'Other' },
];

export const MusicianDiscovery: React.FC<{
  onOpenMessage: (musician: MusicianProfile) => void;
}> = ({ onOpenMessage }) => {
  const { user, profile, setShowProfileEditor, signInWithGoogle } = useAuth();
  const [musicians, setMusicians] = useState<MusicianProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInstrument, setSelectedInstrument] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);

  // Modals state
  const [inspectMusician, setInspectMusician] = useState<MusicianProfile | null>(null);
  const [inviteMusician, setInviteMusician] = useState<MusicianProfile | null>(null);

  const loadMusicians = async () => {
    setLoading(true);
    try {
      const data = await musicianService.listMusicians({
        instrument: selectedInstrument,
        searchQuery,
        availableOnly,
      });
      setMusicians(data);
    } catch (err) {
      console.error('Failed to load musicians:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMusicians();
  }, [selectedInstrument, availableOnly]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadMusicians();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Banner / Title Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-950/80 via-zinc-900 to-indigo-950/80 border border-purple-500/20 p-6 sm:p-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold uppercase tracking-wider mb-3">
              <Compass className="w-3.5 h-3.5" />
              Global Musician Community
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Discover Musicians Worldwide
            </h1>
            <p className="text-sm text-zinc-300 mt-2 leading-relaxed">
              Find guitarists, drummers, vocalists, bassists, and producers ready to contribute their recordings to your songs.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {user ? (
              <button
                onClick={() => setShowProfileEditor(true)}
                className="px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-lg shadow-purple-900/40 transition-all flex items-center justify-center gap-2"
              >
                <Music className="w-4 h-4" />
                <span>{profile ? 'Edit Musician Profile' : 'Publish Your Profile'}</span>
              </button>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white font-semibold text-xs shadow-lg shadow-purple-900/40 transition-all flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Join Community with Google</span>
              </button>
            )}

            <button
              onClick={loadMusicians}
              title="Refresh Directory"
              className="p-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-colors flex items-center justify-center"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-purple-400' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-2xl p-4 space-y-4">
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search musicians by name, country, techniques, or bio..."
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-900/90 border border-zinc-800 focus:border-purple-500 rounded-xl text-sm text-white placeholder-zinc-500 outline-none transition-all"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-xs transition-colors shrink-0 flex items-center gap-2"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Search</span>
          </button>
        </form>

        {/* Instrument Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {INSTRUMENT_FILTERS.map((item) => {
            const isSelected = selectedInstrument === item.value;
            return (
              <button
                key={item.value}
                onClick={() => setSelectedInstrument(item.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-purple-600 border-purple-500 text-white shadow-md shadow-purple-950/40'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Availability Toggle */}
        <div className="flex items-center justify-between text-xs text-zinc-400 pt-2 border-t border-zinc-900">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={availableOnly}
              onChange={(e) => setAvailableOnly(e.target.checked)}
              className="w-3.5 h-3.5 rounded bg-zinc-800 border-zinc-700 text-purple-600 focus:ring-0"
            />
            <span>Show only musicians currently available for collaboration</span>
          </label>

          <span className="text-zinc-500">
            {musicians.length} {musicians.length === 1 ? 'musician' : 'musicians'} listed
          </span>
        </div>
      </div>

      {/* Musicians Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-64 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 animate-pulse p-5 flex flex-col justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-zinc-800" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-zinc-800 rounded w-1/2" />
                  <div className="h-3 bg-zinc-800/60 rounded w-1/3" />
                </div>
              </div>
              <div className="h-10 bg-zinc-800/40 rounded" />
              <div className="h-8 bg-zinc-800/50 rounded" />
            </div>
          ))}
        </div>
      ) : musicians.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {musicians.map((musician) => (
            <MusicianCard
              key={musician.userId}
              musician={musician}
              onViewDetails={(m) => setInspectMusician(m)}
              onInvite={(m) => setInviteMusician(m)}
              onMessage={(m) => onOpenMessage(m)}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="rounded-3xl border border-dashed border-zinc-800 bg-zinc-950/40 p-12 text-center max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-purple-950/40 border border-purple-500/20 text-purple-400 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">
            No musicians found matching these criteria
          </h3>
          <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
            {selectedInstrument !== 'All' || searchQuery
              ? 'Try clearing your filters or selecting a different instrument category.'
              : 'Be the first musician in your genre to publish your profile on Global Music Jam and connect with musicians worldwide!'}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {(selectedInstrument !== 'All' || searchQuery || availableOnly) && (
              <button
                onClick={() => {
                  setSelectedInstrument('All');
                  setSearchQuery('');
                  setAvailableOnly(false);
                }}
                className="px-4 py-2 rounded-xl border border-zinc-700 hover:bg-zinc-800 text-xs text-zinc-300 font-medium transition-colors"
              >
                Clear Filters
              </button>
            )}

            {user ? (
              <button
                onClick={() => setShowProfileEditor(true)}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-lg shadow-purple-900/40 transition-all"
              >
                Edit & Publish Your Musician Profile
              </button>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-zinc-900 font-semibold text-xs shadow-lg transition-all"
              >
                Sign In to Join Directory
              </button>
            )}
          </div>
        </div>
      )}

      {/* Inspect Musician Modal */}
      <MusicianDetailModal
        musician={inspectMusician}
        onClose={() => setInspectMusician(null)}
        onInvite={(m) => {
          setInspectMusician(null);
          setInviteMusician(m);
        }}
        onMessage={(m) => {
          setInspectMusician(null);
          onOpenMessage(m);
        }}
      />

      {/* Send Invite Modal */}
      <SendInviteModal
        musician={inviteMusician}
        onClose={() => setInviteMusician(null)}
      />
    </div>
  );
};
