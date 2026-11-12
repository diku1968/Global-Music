import React, { useState, useEffect } from 'react';
import { X, Send, Music, Sparkles } from 'lucide-react';
import { MusicianProfile, Project } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { invitationService } from '../../services/invitationService';
import { projectService } from '../../services/projectService';

export const SendInviteModal: React.FC<{
  musician: MusicianProfile | null;
  onClose: () => void;
}> = ({ musician, onClose }) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const [userProjects, setUserProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('new_idea');
  const [projectTitle, setProjectTitle] = useState<string>('');
  const [instrument, setInstrument] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (user) {
      projectService.getUserProjects(user.uid).then((projs) => {
        setUserProjects(projs);
        if (projs.length > 0) {
          setSelectedProjectId(projs[0].projectId);
          setProjectTitle(projs[0].title);
        }
      });
    }
  }, [user]);

  useEffect(() => {
    if (musician) {
      setInstrument(musician.primaryInstrument);
      setMessage(
        `Hi ${musician.displayName}, I love your work on ${musician.primaryInstrument}. I'd love to invite you to collaborate on a new track with me!`
      );
    }
  }, [musician]);

  if (!musician) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast('Please sign in to send collaboration invitations', 'error');
      return;
    }

    setSending(true);
    try {
      const activeTitle =
        selectedProjectId === 'new_idea'
          ? projectTitle.trim() || 'New Music Collab'
          : userProjects.find((p) => p.projectId === selectedProjectId)?.title ||
            'Music Project';

      await invitationService.sendInvitation({
        receiverId: musician.userId,
        senderName: profile?.displayName || user.displayName || 'Independent Musician',
        projectId: selectedProjectId,
        projectTitle: activeTitle,
        instrument: instrument.trim() || musician.primaryInstrument,
        message: message.trim(),
      });

      toast(`Invitation sent to ${musician.displayName}!`, 'success');
      onClose();
    } catch (err) {
      console.error(err);
      toast('Failed to send invitation. Please try again.', 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl p-6 sm:p-7 text-zinc-100">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-purple-600/30 border border-purple-500/50 flex items-center justify-center text-purple-300">
            <Send className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              Invite {musician.displayName} to Jam
            </h3>
            <p className="text-xs text-zinc-400">
              Primary Instrument: {musician.primaryInstrument} ({musician.country || 'Global'})
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Project Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Collaboration Project
            </label>
            {userProjects.length > 0 ? (
              <select
                value={selectedProjectId}
                onChange={(e) => {
                  setSelectedProjectId(e.target.value);
                  if (e.target.value !== 'new_idea') {
                    const p = userProjects.find((x) => x.projectId === e.target.value);
                    if (p) setProjectTitle(p.title);
                  }
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-sm text-white focus:border-purple-500 outline-none"
              >
                <option value="new_idea">+ Start a New Project Collaboration</option>
                {userProjects.map((p) => (
                  <option key={p.projectId} value={p.projectId}>
                    {p.title} ({p.genre || 'Music'} - {p.bpm} BPM)
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                placeholder="Song Title / Project Name (e.g. Midnight Grooves)"
                maxLength={120}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-sm text-white placeholder-zinc-500 focus:border-purple-500 outline-none"
              />
            )}
          </div>

          {selectedProjectId === 'new_idea' && userProjects.length > 0 && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                New Song Title
              </label>
              <input
                type="text"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                placeholder="e.g. Electric Horizons"
                maxLength={120}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-sm text-white placeholder-zinc-500 focus:border-purple-500 outline-none"
              />
            </div>
          )}

          {/* Instrument Needed */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Instrument or Role Requested
            </label>
            <input
              type="text"
              value={instrument}
              onChange={(e) => setInstrument(e.target.value)}
              placeholder="e.g. Lead Guitar, Synth Bass, Drums, Vocal Track"
              maxLength={60}
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-sm text-white placeholder-zinc-500 focus:border-purple-500 outline-none"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Invitation Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder="Tell them about the vibe, tempo, and what you are looking for..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white placeholder-zinc-500 focus:border-purple-500 outline-none resize-none"
            />
            <div className="text-right text-[11px] text-zinc-500">{message.length}/500</div>
          </div>

          <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-zinc-700 text-zinc-300 hover:bg-zinc-900 text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={sending}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-purple-900/40 flex items-center gap-2 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              {sending ? 'Sending...' : 'Send Collaboration Invitation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
