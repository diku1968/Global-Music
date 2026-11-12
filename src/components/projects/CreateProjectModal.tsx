import React, { useState } from 'react';
import { X, Disc3, Plus, Music, Sparkles, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { projectService } from '../../services/projectService';
import { InstrumentType, Project } from '../../types';

const GENRES = [
  'Alternative Rock',
  'Indie Pop',
  'Funk / Soul',
  'Jazz Fusion',
  'Blues / Rock',
  'Heavy Metal',
  'Hip Hop / R&B',
  'Electronic / Synthwave',
  'Acoustic / Folk',
  'Reggae / Dub',
  'Classical / Orchestral',
  'Ambient / Experimental',
];

const KEYS = [
  'C Major',
  'A Minor',
  'G Major',
  'E Minor',
  'D Major',
  'B Minor',
  'F Major',
  'D Minor',
  'Bb Major',
  'G Minor',
  'Eb Major',
  'C Minor',
  'A Major',
  'F# Minor',
  'E Major',
  'C# Minor',
];

const TIME_SIGNATURES = ['4/4', '3/4', '6/8', '2/4', '5/4', '7/8', '12/8'];

const INSTRUMENTS_AVAILABLE: InstrumentType[] = [
  'Guitar',
  'Bass',
  'Drums',
  'Keyboard',
  'Piano',
  'Vocals',
  'Violin',
  'Flute',
  'Percussion',
  'Producer',
  'Saxophone',
];

export const CreateProjectModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (project: Project) => void;
}> = ({ isOpen, onClose, onProjectCreated }) => {
  const { user, profile, signInWithGoogle } = useAuth();
  const { toast } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [genre, setGenre] = useState('Alternative Rock');
  const [bpm, setBpm] = useState<number>(120);
  const [musicKey, setMusicKey] = useState('C Major');
  const [timeSignature, setTimeSignature] = useState('4/4');
  const [requiredInstruments, setRequiredInstruments] = useState<InstrumentType[]>([
    'Guitar',
    'Bass',
    'Drums',
  ]);
  const [isPublic, setIsPublic] = useState(true);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const toggleInstrument = (inst: InstrumentType) => {
    if (requiredInstruments.includes(inst)) {
      setRequiredInstruments(requiredInstruments.filter((i) => i !== inst));
    } else {
      setRequiredInstruments([...requiredInstruments, inst]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast('Please sign in to create a project', 'error');
      signInWithGoogle();
      return;
    }

    if (!title.trim()) {
      toast('Please provide a song title', 'error');
      return;
    }

    setSaving(true);
    try {
      const newProj = await projectService.createProject({
        title: title.trim(),
        description: description.trim(),
        genre,
        bpm: Number(bpm) || 120,
        musicKey,
        timeSignature,
        requiredInstruments,
        isPublic,
        ownerName: profile?.displayName || user.displayName || 'Song Creator',
      });

      toast(`Project "${newProj.title}" created!`, 'success');
      onProjectCreated(newProj);
      onClose();
    } catch (err) {
      console.error(err);
      toast('Failed to create project', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl p-6 sm:p-8 text-zinc-100 my-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 pb-5 border-b border-zinc-800">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-purple-900/30">
            <Disc3 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white">Create Music Project</h2>
            <p className="text-xs text-zinc-400">
              Establish a new multitrack collaboration for instrumentalists and singers
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Song / Project Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Midnight Reverie, Sunset Groove, Neon Velocity"
              maxLength={120}
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-sm text-white focus:border-purple-500 outline-none placeholder-zinc-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Song Concept & Musical Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={2000}
              placeholder="Describe the tempo, mood, melodic ideas, and what instruments or vocal harmonies you need..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white focus:border-purple-500 outline-none resize-none placeholder-zinc-500"
            />
          </div>

          {/* Genre & Key */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Music Genre
              </label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-sm text-white focus:border-purple-500 outline-none"
              >
                {GENRES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Musical Key
              </label>
              <select
                value={musicKey}
                onChange={(e) => setMusicKey(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-sm text-white focus:border-purple-500 outline-none"
              >
                {KEYS.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* BPM and Time Signature */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Tempo (BPM: {bpm})
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="40"
                  max="240"
                  value={bpm}
                  onChange={(e) => setBpm(Number(e.target.value))}
                  className="flex-1 accent-purple-500"
                />
                <input
                  type="number"
                  min="40"
                  max="240"
                  value={bpm}
                  onChange={(e) => setBpm(Number(e.target.value))}
                  className="w-20 px-2 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-sm text-center font-mono text-purple-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Time Signature
              </label>
              <div className="flex items-center gap-2">
                {TIME_SIGNATURES.map((ts) => (
                  <button
                    key={ts}
                    type="button"
                    onClick={() => setTimeSignature(ts)}
                    className={`flex-1 py-2 rounded-lg text-xs font-mono font-bold border transition-colors ${
                      timeSignature === ts
                        ? 'bg-purple-600/30 border-purple-500 text-purple-300'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    {ts}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Required Instruments */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
              Instruments Needed for this Song
            </label>
            <div className="flex flex-wrap gap-2">
              {INSTRUMENTS_AVAILABLE.map((inst) => {
                const selected = requiredInstruments.includes(inst);
                return (
                  <button
                    key={inst}
                    type="button"
                    onClick={() => toggleInstrument(inst)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-all ${
                      selected
                        ? 'bg-purple-600 border-purple-500 text-white'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    {selected && <Check className="w-3.5 h-3.5" />}
                    {inst}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Visibility */}
          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-white block">
                Public Discovery
              </span>
              <span className="text-xs text-zinc-400 block">
                Allow musicians worldwide to find this song and request to contribute
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-zinc-700 text-zinc-300 hover:bg-zinc-900 text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-purple-900/40 flex items-center gap-2 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              {saving ? 'Creating Project...' : 'Launch Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
