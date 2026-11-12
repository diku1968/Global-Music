import React, { useState } from 'react';
import { X, Music, Globe, Award, Sparkles, Link as LinkIcon, Check, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { InstrumentType, ExperienceLevel, MusicianProfile } from '../../types';

const INSTRUMENT_OPTIONS: InstrumentType[] = [
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
  'Other',
];

const EXPERIENCE_OPTIONS: ExperienceLevel[] = [
  'Beginner',
  'Intermediate',
  'Advanced',
  'Professional',
];

const SKILL_SUGGESTIONS = [
  'Rhythm Guitar',
  'Lead Guitar',
  'Fingerstyle',
  'Slap Bass',
  'Double Bass',
  'Polyrhythms',
  'Vocal Harmonies',
  'Belting',
  'Classical Piano',
  'Synth Programming',
  'Audio Mixing',
  'Mastering',
  'Songwriting',
  'Improvisation',
  'Jazz Chords',
  'Arrangement',
];

export const UserProfileEditor: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { user, profile, updateProfile } = useAuth();
  const { toast } = useToast();

  const [displayName, setDisplayName] = useState(profile?.displayName || user?.displayName || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [country, setCountry] = useState(profile?.country || 'United States');
  const [preferredLanguage, setPreferredLanguage] = useState(profile?.preferredLanguage || 'English');
  const [primaryInstrument, setPrimaryInstrument] = useState<InstrumentType>(
    profile?.primaryInstrument || 'Guitar'
  );
  const [instruments, setInstruments] = useState<InstrumentType[]>(
    profile?.instruments || [profile?.primaryInstrument || 'Guitar']
  );
  const [skills, setSkills] = useState<string[]>(profile?.skills || ['Songwriting']);
  const [newSkill, setNewSkill] = useState('');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>(
    profile?.experienceLevel || 'Intermediate'
  );
  const [portfolioLinks, setPortfolioLinks] = useState<string[]>(profile?.portfolioLinks || []);
  const [newLink, setNewLink] = useState('');
  const [isAvailableForCollab, setIsAvailableForCollab] = useState<boolean>(
    profile?.isAvailableForCollab !== undefined ? profile.isAvailableForCollab : true
  );
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const toggleInstrument = (inst: InstrumentType) => {
    if (instruments.includes(inst)) {
      if (instruments.length > 1) {
        setInstruments(instruments.filter((i) => i !== inst));
        if (primaryInstrument === inst) {
          setPrimaryInstrument(instruments.filter((i) => i !== inst)[0]);
        }
      } else {
        toast('Must have at least one instrument selected', 'error');
      }
    } else {
      setInstruments([...instruments, inst]);
    }
  };

  const addSkill = (skillToAdd: string) => {
    const trimmed = skillToAdd.trim();
    if (!trimmed) return;
    if (skills.includes(trimmed)) return;
    if (skills.length >= 20) {
      toast('Maximum 20 skills allowed', 'error');
      return;
    }
    setSkills([...skills, trimmed]);
    setNewSkill('');
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const addPortfolioLink = () => {
    const trimmed = newLink.trim();
    if (!trimmed) return;
    if (portfolioLinks.length >= 10) {
      toast('Maximum 10 portfolio links allowed', 'error');
      return;
    }
    setPortfolioLinks([...portfolioLinks, trimmed]);
    setNewLink('');
  };

  const removePortfolioLink = (index: number) => {
    setPortfolioLinks(portfolioLinks.filter((_, i) => i !== index));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast('You must be signed in to save profile', 'error');
      return;
    }

    if (!displayName.trim()) {
      toast('Display name is required', 'error');
      return;
    }

    setSaving(true);
    try {
      const updatedProfile: MusicianProfile = {
        userId: user.uid,
        displayName: displayName.trim(),
        email: user.email || '',
        photoURL: user.photoURL || '',
        bio: bio.trim(),
        country: country.trim(),
        preferredLanguage: preferredLanguage.trim(),
        primaryInstrument,
        instruments,
        skills,
        experienceLevel,
        portfolioLinks,
        isAvailableForCollab,
        followersCount: profile?.followersCount || 0,
        followingCount: profile?.followingCount || 0,
        createdAt: profile?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await updateProfile(updatedProfile);
      toast('Musician profile updated successfully!', 'success');
      onClose();
    } catch (err) {
      console.error(err);
      toast('Failed to save profile. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl p-6 sm:p-8 text-zinc-100 my-8">
        <div className="flex items-center justify-between pb-5 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-900/30">
              <Music className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white">Musician Profile Setup</h2>
              <p className="text-xs text-zinc-400">
                Help other musicians discover you for studio tracks and live jams
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Stage / Display Name *
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={80}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900/80 border border-zinc-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none text-sm text-white placeholder-zinc-500 transition-all"
                placeholder="e.g. Jimi Rivers"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Primary Instrument *
              </label>
              <select
                value={primaryInstrument}
                onChange={(e) => {
                  const val = e.target.value as InstrumentType;
                  setPrimaryInstrument(val);
                  if (!instruments.includes(val)) {
                    setInstruments([...instruments, val]);
                  }
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900/80 border border-zinc-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none text-sm text-white transition-all"
              >
                {INSTRUMENT_OPTIONS.map((inst) => (
                  <option key={inst} value={inst} className="bg-zinc-900 text-white">
                    {inst}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Location & Language */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-purple-400" /> Country / Region
              </label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                maxLength={100}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900/80 border border-zinc-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none text-sm text-white placeholder-zinc-500 transition-all"
                placeholder="e.g. United Kingdom, Japan, Brazil"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Preferred Language
              </label>
              <input
                type="text"
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value)}
                maxLength={50}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900/80 border border-zinc-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none text-sm text-white placeholder-zinc-500 transition-all"
                placeholder="e.g. English, Spanish, Japanese"
              />
            </div>
          </div>

          {/* Experience & Collab Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-cyan-400" /> Experience Level
              </label>
              <div className="grid grid-cols-2 gap-2">
                {EXPERIENCE_OPTIONS.map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setExperienceLevel(lvl)}
                    className={`py-2 px-3 rounded-lg text-xs font-medium border text-center transition-all ${
                      experienceLevel === lvl
                        ? 'bg-purple-600/20 border-purple-500 text-purple-200'
                        : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAvailableForCollab}
                  onChange={(e) => setIsAvailableForCollab(e.target.checked)}
                  className="w-4 h-4 rounded text-purple-600 bg-zinc-800 border-zinc-700 focus:ring-purple-500 focus:ring-offset-zinc-900"
                />
                <div>
                  <span className="text-sm font-medium text-white block">
                    Available for Collaborations
                  </span>
                  <span className="text-xs text-zinc-400 block">
                    Show open collaboration badge to other musicians
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* All Instruments Played */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
              All Instruments You Play (Select all that apply)
            </label>
            <div className="flex flex-wrap gap-2">
              {INSTRUMENT_OPTIONS.map((inst) => {
                const isSelected = instruments.includes(inst);
                const isPrimary = primaryInstrument === inst;
                return (
                  <button
                    key={inst}
                    type="button"
                    onClick={() => toggleInstrument(inst)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? isPrimary
                          ? 'bg-purple-600 border-purple-500 text-white shadow-md shadow-purple-900/40'
                          : 'bg-purple-950/60 border-purple-500/50 text-purple-200'
                        : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                    {inst}
                    {isPrimary && <span className="text-[10px] uppercase opacity-75 font-bold">(Main)</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Skills and Techniques */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Musical Skills & Specialties
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSkill(newSkill);
                  }
                }}
                maxLength={40}
                placeholder="Add skill (e.g. Soloing, Slap bass, Polyphonic synthesis)..."
                className="flex-1 px-3.5 py-2 rounded-xl bg-zinc-900/80 border border-zinc-700 focus:border-purple-500 outline-none text-xs text-white placeholder-zinc-500"
              />
              <button
                type="button"
                onClick={() => addSkill(newSkill)}
                className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs rounded-xl font-medium transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>

            {/* Suggestions */}
            <div className="flex flex-wrap gap-1.5 mb-2">
              {SKILL_SUGGESTIONS.filter((s) => !skills.includes(s)).slice(0, 6).map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => addSkill(suggestion)}
                  className="text-[11px] px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
                >
                  + {suggestion}
                </button>
              ))}
            </div>

            {/* Selected skills */}
            <div className="flex flex-wrap gap-1.5">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs bg-cyan-950/60 border border-cyan-500/40 text-cyan-200"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Artist Bio */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Artist Bio / Musical Background
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              maxLength={1000}
              placeholder="Tell other musicians about your musical journey, favorite genres, influences, and studio setup..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900/80 border border-zinc-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none text-xs text-white placeholder-zinc-500 resize-none transition-all"
            />
            <div className="text-right text-[11px] text-zinc-500">{bio.length}/1000</div>
          </div>

          {/* Portfolio Links */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5 flex items-center gap-1.5">
              <LinkIcon className="w-3.5 h-3.5 text-indigo-400" /> Music Portfolio & Social Links
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="url"
                value={newLink}
                onChange={(e) => setNewLink(e.target.value)}
                placeholder="https://soundcloud.com/you or https://youtube.com/..."
                className="flex-1 px-3.5 py-2 rounded-xl bg-zinc-900/80 border border-zinc-700 focus:border-purple-500 outline-none text-xs text-white placeholder-zinc-500"
              />
              <button
                type="button"
                onClick={addPortfolioLink}
                className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs rounded-xl font-medium transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
            {portfolioLinks.map((link, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 mb-1.5 rounded-lg bg-zinc-900/70 border border-zinc-800 text-xs text-zinc-300"
              >
                <span className="truncate max-w-sm sm:max-w-md font-mono">{link}</span>
                <button
                  type="button"
                  onClick={() => removePortfolioLink(idx)}
                  className="text-zinc-500 hover:text-rose-400 transition-colors p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-zinc-700 text-zinc-300 hover:bg-zinc-900 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-purple-900/40 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Musician Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
