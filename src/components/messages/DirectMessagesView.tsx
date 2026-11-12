import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  User,
  Music,
  CheckCheck,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { messageService } from '../../services/messageService';
import { musicianService } from '../../services/musicianService';
import { DirectMessage, MusicianProfile } from '../../types';

export const DirectMessagesView: React.FC<{
  initialMusician?: MusicianProfile | null;
}> = ({ initialMusician }) => {
  const { user, profile, signInWithGoogle } = useAuth();
  const { toast } = useToast();

  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [activePartnerId, setActivePartnerId] = useState<string | null>(
    initialMusician?.userId || null
  );
  const [partnerProfiles, setPartnerProfiles] = useState<Record<string, MusicianProfile>>({});
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  // If initial musician is passed, seed partnerProfiles
  useEffect(() => {
    if (initialMusician) {
      setActivePartnerId(initialMusician.userId);
      setPartnerProfiles((prev) => ({
        ...prev,
        [initialMusician.userId]: initialMusician,
      }));
    }
  }, [initialMusician]);

  const loadMessages = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const allMsgs = await messageService.getMessagesForUser(user.uid);
      setMessages(allMsgs);

      // Collect distinct counterpart IDs
      const partnerIds = new Set<string>();
      allMsgs.forEach((m) => {
        if (m.senderId !== user.uid) partnerIds.add(m.senderId);
        if (m.receiverId !== user.uid) partnerIds.add(m.receiverId);
      });

      // If initialMusician is present, include it
      if (initialMusician) partnerIds.add(initialMusician.userId);

      // Fetch profiles for all partner IDs
      const loaded: Record<string, MusicianProfile> = { ...partnerProfiles };
      await Promise.all(
        Array.from(partnerIds).map(async (id) => {
          if (!loaded[id]) {
            const p = await musicianService.getMusicianProfile(id);
            if (p) loaded[id] = p;
          }
        })
      );
      setPartnerProfiles(loaded);

      // Set active partner if none selected
      if (!activePartnerId && partnerIds.size > 0) {
        setActivePartnerId(Array.from(partnerIds)[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, [user]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !activePartnerId || !inputText.trim()) return;

    setSending(true);
    try {
      const newMsg = await messageService.sendMessage({
        receiverId: activePartnerId,
        text: inputText.trim(),
        senderName: profile?.displayName || user.displayName || 'Musician',
      });

      setMessages((prev) => [...prev, newMsg]);
      setInputText('');
    } catch (err) {
      console.error(err);
      toast('Failed to send message', 'error');
    } finally {
      setSending(false);
    }
  };

  if (!user) {
    return (
      <div className="p-12 text-center rounded-3xl bg-zinc-950/60 border border-dashed border-zinc-800 max-w-lg mx-auto">
        <MessageSquare className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
        <h3 className="text-base font-bold text-white mb-2">Musician Direct Messages</h3>
        <p className="text-xs text-zinc-400 mb-6">
          Connect your Google account to communicate directly with session musicians and producers.
        </p>
        <button
          onClick={signInWithGoogle}
          className="px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-zinc-900 font-semibold text-xs shadow-lg transition-colors"
        >
          Sign In to Access Messages
        </button>
      </div>
    );
  }

  // Filter messages for active partner
  const conversation = messages.filter(
    (m) =>
      (m.senderId === user.uid && m.receiverId === activePartnerId) ||
      (m.senderId === activePartnerId && m.receiverId === user.uid)
  );

  const activePartner = activePartnerId ? partnerProfiles[activePartnerId] : null;

  // Distinct conversations for left sidebar
  const conversationPartners = Object.values(partnerProfiles);

  return (
    <div className="space-y-4 pb-8">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
          <MessageSquare className="w-8 h-8 text-purple-400" />
          Musician Messages
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Direct private communications for session coordination and collaboration ideas
        </p>
      </div>

      <div className="bg-zinc-950/80 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-12 min-h-[580px]">
        {/* Left: Conversations list */}
        <div className="md:col-span-4 border-b md:border-b-0 md:border-r border-zinc-800/80 p-4 space-y-3 bg-zinc-950/50">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 px-2">
            Conversations ({conversationPartners.length})
          </h3>

          <div className="space-y-1.5 overflow-y-auto max-h-[500px]">
            {conversationPartners.length > 0 ? (
              conversationPartners.map((partner) => {
                const isSelected = activePartnerId === partner.userId;
                return (
                  <button
                    key={partner.userId}
                    onClick={() => setActivePartnerId(partner.userId)}
                    className={`w-full p-3 rounded-2xl flex items-center gap-3 transition-all text-left ${
                      isSelected
                        ? 'bg-purple-950/60 border border-purple-500/40 text-white'
                        : 'hover:bg-zinc-900 border border-transparent text-zinc-300'
                    }`}
                  >
                    {partner.photoURL ? (
                      <img
                        src={partner.photoURL}
                        alt={partner.displayName}
                        className="w-10 h-10 rounded-xl object-cover border border-zinc-700 shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center font-bold text-white text-xs shrink-0">
                        {partner.displayName.substring(0, 2).toUpperCase()}
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-sm truncate text-white">
                        {partner.displayName}
                      </h4>
                      <p className="text-xs text-purple-300 truncate font-medium">
                        {partner.primaryInstrument}
                      </p>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-6 text-center text-xs text-zinc-500">
                No active conversations yet. Find musicians on Discover to message them.
              </div>
            )}
          </div>
        </div>

        {/* Right: Active chat window */}
        <div className="md:col-span-8 flex flex-col justify-between h-[580px] bg-zinc-900/30">
          {activePartner ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/70">
                <div className="flex items-center gap-3">
                  {activePartner.photoURL ? (
                    <img
                      src={activePartner.photoURL}
                      alt={activePartner.displayName}
                      className="w-10 h-10 rounded-xl object-cover border border-purple-500/40"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center font-bold text-white text-sm">
                      {activePartner.displayName.substring(0, 2).toUpperCase()}
                    </div>
                  )}

                  <div>
                    <h3 className="font-bold text-white text-sm">
                      {activePartner.displayName}
                    </h3>
                    <p className="text-xs text-zinc-400">
                      {activePartner.primaryInstrument} • {activePartner.country || 'Global'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-950/50 border border-emerald-500/30 text-emerald-300">
                    Live Channel
                  </span>
                </div>
              </div>

              {/* Message History */}
              <div className="flex-1 p-5 overflow-y-auto space-y-3">
                {conversation.length > 0 ? (
                  conversation.map((msg) => {
                    const isFromMe = msg.senderId === user.uid;
                    return (
                      <div
                        key={msg.messageId}
                        className={`flex flex-col ${isFromMe ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[75%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                            isFromMe
                              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-950/40'
                              : 'bg-zinc-800 text-zinc-200 border border-zinc-700/60'
                          }`}
                        >
                          {msg.text}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 mt-1 px-1">
                          <span>
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          {isFromMe && <CheckCheck className="w-3 h-3 text-purple-400" />}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-500">
                    <Sparkles className="w-8 h-8 text-purple-500/40 mb-2" />
                    <p className="text-sm font-medium text-zinc-300">
                      Start a musical conversation with {activePartner.displayName}
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">
                      Discuss song keys, tempos, track stems, and recording schedules.
                    </p>
                  </div>
                )}
              </div>

              {/* Message Input */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 border-t border-zinc-800 flex items-center gap-2 bg-zinc-950/90"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`Write a message to ${activePartner.displayName}...`}
                  maxLength={2000}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-purple-500 text-xs text-white placeholder-zinc-500 outline-none"
                />
                <button
                  type="submit"
                  disabled={sending || !inputText.trim()}
                  className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-950/40 transition-colors disabled:opacity-40"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-zinc-500 text-xs">
              Select a musician from the left to start messaging
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
