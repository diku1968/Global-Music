export type InstrumentType =
  | 'Guitar'
  | 'Bass'
  | 'Drums'
  | 'Keyboard'
  | 'Piano'
  | 'Vocals'
  | 'Violin'
  | 'Flute'
  | 'Percussion'
  | 'Producer'
  | 'Saxophone'
  | 'Other';

export type ExperienceLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Professional';

export interface MusicianProfile {
  userId: string;
  displayName: string;
  email?: string;
  photoURL?: string;
  bio?: string;
  country?: string;
  preferredLanguage?: string;
  primaryInstrument: InstrumentType;
  instruments?: InstrumentType[];
  skills?: string[];
  experienceLevel?: ExperienceLevel;
  portfolioLinks?: string[];
  followersCount?: number;
  followingCount?: number;
  isAvailableForCollab?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Project {
  projectId: string;
  title: string;
  description?: string;
  genre?: string;
  bpm: number;
  musicKey?: string;
  timeSignature?: string;
  ownerId: string;
  ownerName?: string;
  requiredInstruments?: InstrumentType[];
  isPublic?: boolean;
  status?: 'open' | 'in_progress' | 'completed';
  trackCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CollaborationInvitation {
  invitationId: string;
  senderId: string;
  senderName?: string;
  receiverId: string;
  projectId?: string;
  projectTitle?: string;
  instrument?: string;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt?: string;
}

export interface DirectMessage {
  messageId: string;
  senderId: string;
  senderName?: string;
  receiverId: string;
  text: string;
  createdAt: string;
  read?: boolean;
}

export interface FollowRecord {
  followerId: string;
  targetUserId: string;
  createdAt?: string;
}

export interface AudioTrack {
  trackId: string;
  projectId: string;
  name: string;
  instrument: InstrumentType;
  musicianId: string;
  musicianName?: string;
  audioBlob?: Blob;
  audioBuffer?: AudioBuffer;
  audioUrl?: string;
  waveformPeaks?: number[]; // Real extracted peak amplitudes for visualization
  duration: number; // in seconds
  startOffset: number; // in seconds relative to timeline origin
  volume: number; // 0.0 to 1.5
  pan: number; // -1.0 to 1.0
  isMuted: boolean;
  isSolo: boolean;
  eqLow?: number; // dB, default 0
  eqMid?: number; // dB, default 0
  eqHigh?: number; // dB, default 0
  reverbLevel?: number; // 0 to 1
  delayLevel?: number; // 0 to 1
  createdAt?: string;
  updatedAt?: string;
}

export interface MasterMixSettings {
  masterVolume: number; // 0 to 1.5
  compressorThreshold: number; // -60 to 0 dB
  compressorRatio: number; // 1 to 20
  masterLimiter: boolean;
  reverbDecay: number; // seconds
}

export type NavTab = 'home' | 'discover' | 'projects' | 'studio' | 'livejam' | 'messages' | 'profile';

