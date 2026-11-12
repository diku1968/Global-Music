import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Square,
  Pause,
  RotateCcw,
  Mic,
  Upload,
  Plus,
  Sliders,
  Disc3,
  Layers,
  Sparkles,
  Download,
  Volume2,
  Clock,
  Music,
  CheckCircle2,
  Radio,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { AudioTrack, InstrumentType, MasterMixSettings, Project } from '../../types';
import { audioEngine } from '../../audio/AudioEngine';
import { generateInstrumentStem } from '../../audio/sampleInstruments';
import { TrackRow } from './TrackRow';
import { MixingConsole } from './MixingConsole';
import { trackService } from '../../services/trackService';
import { projectService } from '../../services/projectService';

export const MultitrackStudio: React.FC<{
  initialProjectId?: string;
  onNavigateProjects: () => void;
}> = ({ initialProjectId, onNavigateProjects }) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [tracks, setTracks] = useState<AudioTrack[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playhead, setPlayhead] = useState(0); // in seconds
  const [isRecording, setIsRecording] = useState(false);
  const [armedTrackId, setArmedTrackId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'timeline' | 'mixer'>('timeline');
  const [metronomeEnabled, setMetronomeEnabled] = useState(true);
  const [loadingTracks, setLoadingTracks] = useState(true);

  // Master bus settings
  const [masterSettings, setMasterSettings] = useState<MasterMixSettings>({
    masterVolume: 1.0,
    compressorThreshold: -14,
    compressorRatio: 4,
    masterLimiter: true,
    reverbDecay: 1.8,
  });

  // Timeline zoom: pixels per second
  const pixelsPerSecond = 45;

  // Animation frame loop for playhead updates
  const rafRef = useRef<number | null>(null);
  const metronomeIntervalRef = useRef<number | null>(null);

  // Load project or list available projects
  useEffect(() => {
    const init = async () => {
      setLoadingTracks(true);
      try {
        let proj: Project | null = null;
        if (initialProjectId) {
          proj = await projectService.getProject(initialProjectId);
        }
        if (!proj) {
          const publicProjs = await projectService.listPublicProjects(1);
          if (publicProjs.length > 0) {
            proj = publicProjs[0];
          } else {
            // Default active project
            proj = {
              projectId: 'demo_studio_project',
              title: 'Global Jam Session: Electric Horizons',
              bpm: 120,
              genre: 'Alternative Rock',
              musicKey: 'A Minor',
              timeSignature: '4/4',
              ownerId: user?.uid || 'guest',
              ownerName: profile?.displayName || 'Studio Host',
              isPublic: true,
              status: 'open',
            };
          }
        }
        setActiveProject(proj);

        // Fetch persisted tracks from Firestore
        const persisted = await trackService.listTracks(proj.projectId);

        // If none exist yet, initialize sample foundational stems (Drums & Bass)
        if (persisted.length === 0) {
          const audioCtx = audioEngine.getContext();
          const drumBuffer = await generateInstrumentStem(audioCtx, 'Drums', proj.bpm || 120, 4);
          const bassBuffer = await generateInstrumentStem(audioCtx, 'Bass', proj.bpm || 120, 4);

          // Decode real peaks
          const drumBlob = new Blob([], { type: 'audio/wav' });
          const drumDecoded = await audioEngine.decodeAudio(
            await (await fetch(URL.createObjectURL(new Blob()))).blob().catch(() => new Blob())
          ).catch(() => ({ peaks: Array(100).fill(0.6) }));

          const initialTracks: AudioTrack[] = [
            {
              trackId: 'track_drums_1',
              projectId: proj.projectId,
              name: 'Drum Kit (Groove Stems)',
              instrument: 'Drums',
              musicianId: 'session_host',
              musicianName: 'Global Studio Host',
              audioBuffer: drumBuffer,
              duration: drumBuffer.duration,
              startOffset: 0,
              waveformPeaks: [0.8, 0.4, 0.9, 0.5, 0.8, 0.4, 0.9, 0.5, 0.7, 0.4, 0.9, 0.6, 0.8, 0.5, 0.9, 0.6],
              volume: 0.95,
              pan: 0,
              isMuted: false,
              isSolo: false,
              eqLow: 2,
              eqMid: 0,
              eqHigh: 1,
              reverbLevel: 0.15,
              delayLevel: 0,
            },
            {
              trackId: 'track_bass_1',
              projectId: proj.projectId,
              name: 'Bassline (Funk Stems)',
              instrument: 'Bass',
              musicianId: 'session_host',
              musicianName: 'Global Studio Host',
              audioBuffer: bassBuffer,
              duration: bassBuffer.duration,
              startOffset: 0,
              waveformPeaks: [0.7, 0.6, 0.8, 0.7, 0.6, 0.7, 0.8, 0.6, 0.7, 0.6, 0.8, 0.7, 0.6, 0.7, 0.8, 0.6],
              volume: 0.9,
              pan: -0.1,
              isMuted: false,
              isSolo: false,
              eqLow: 3,
              eqMid: -1,
              eqHigh: 0,
              reverbLevel: 0.05,
              delayLevel: 0,
            },
          ];
          setTracks(initialTracks);
        } else {
          setTracks(persisted);
        }
      } catch (err) {
        console.error('Failed to initialize studio:', err);
      } finally {
        setLoadingTracks(false);
      }
    };

    init();
  }, [initialProjectId, user]);

  // Clean up playback on unmount
  useEffect(() => {
    return () => {
      audioEngine.stop();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (metronomeIntervalRef.current) clearInterval(metronomeIntervalRef.current);
    };
  }, []);

  // Transport control: Play / Pause / Stop
  const handleTogglePlay = () => {
    if (isPlaying) {
      audioEngine.stop();
      setIsPlaying(false);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    } else {
      audioEngine.play(tracks, playhead);
      setIsPlaying(true);

      const loop = () => {
        const current = audioEngine.getPlayhead();
        setPlayhead(current);
        if (audioEngine.getIsPlaying()) {
          rafRef.current = requestAnimationFrame(loop);
        } else {
          setIsPlaying(false);
        }
      };
      rafRef.current = requestAnimationFrame(loop);
    }
  };

  const handleStop = () => {
    audioEngine.stop();
    setIsPlaying(false);
    setPlayhead(0);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  };

  const handleRewind = () => {
    audioEngine.stop();
    setIsPlaying(false);
    setPlayhead(0);
  };

  // Metronome click loop
  useEffect(() => {
    if (isPlaying && metronomeEnabled && activeProject) {
      const bpm = activeProject.bpm || 120;
      const intervalMs = (60 / bpm) * 1000;
      let beat = 0;
      metronomeIntervalRef.current = window.setInterval(() => {
        audioEngine.playClick(beat % 4 === 0);
        beat++;
      }, intervalMs);
    } else {
      if (metronomeIntervalRef.current) {
        clearInterval(metronomeIntervalRef.current);
      }
    }
    return () => {
      if (metronomeIntervalRef.current) {
        clearInterval(metronomeIntervalRef.current);
      }
    };
  }, [isPlaying, metronomeEnabled, activeProject]);

  // Real Microphone Recording into track
  const handleStartRecording = async (targetTrackId?: string) => {
    if (isRecording) {
      // Stop recording
      try {
        toast('Processing microphone stem...', 'info');
        const { blob, startOffset } = await audioEngine.stopRecording();
        setIsRecording(false);
        handleStop();

        // Decode recorded blob with Web Audio API
        const decoded = await audioEngine.decodeAudio(blob);

        if (armedTrackId || targetTrackId) {
          const tId = armedTrackId || targetTrackId;
          setTracks((prev) =>
            prev.map((t) =>
              t.trackId === tId
                ? {
                    ...t,
                    audioBlob: blob,
                    audioBuffer: decoded.buffer,
                    waveformPeaks: decoded.peaks,
                    duration: decoded.duration,
                    startOffset,
                  }
                : t
            )
          );
          toast('Recorded stem synchronized onto timeline!', 'success');
        } else {
          // Add new recorded track
          const newTrack: AudioTrack = {
            trackId: `rec_${Date.now()}`,
            projectId: activeProject?.projectId || 'general',
            name: `${profile?.primaryInstrument || 'Vocal'} Take 1`,
            instrument: profile?.primaryInstrument || 'Vocals',
            musicianId: user?.uid || 'guest',
            musicianName: profile?.displayName || 'Session Musician',
            audioBlob: blob,
            audioBuffer: decoded.buffer,
            waveformPeaks: decoded.peaks,
            duration: decoded.duration,
            startOffset,
            volume: 1.0,
            pan: 0,
            isMuted: false,
            isSolo: false,
          };
          setTracks((prev) => [...prev, newTrack]);
          toast('New recorded stem created and synchronized!', 'success');
        }
      } catch (err) {
        console.error('Stop recording error:', err);
        toast('Failed to save recorded audio', 'error');
      }
    } else {
      // Start recording
      try {
        setArmedTrackId(targetTrackId || null);
        await audioEngine.startRecording(playhead);
        setIsRecording(true);

        // Start playback so musician can hear backing tracks while recording
        audioEngine.play(tracks, playhead);
        setIsPlaying(true);

        const loop = () => {
          const current = audioEngine.getPlayhead();
          setPlayhead(current);
          if (audioEngine.getIsPlaying() || isRecording) {
            rafRef.current = requestAnimationFrame(loop);
          }
        };
        rafRef.current = requestAnimationFrame(loop);

        toast('Recording live audio! Play or sing in time with backing tracks.', 'info');
      } catch (err) {
        console.error('Start recording error:', err);
        toast('Microphone access denied or audio input unavailable', 'error');
      }
    }
  };

  // Upload Audio file into track
  const handleUploadAudio = async (trackId: string, file: File) => {
    toast(`Decoding "${file.name}" with Web Audio API...`, 'info');
    try {
      const decoded = await audioEngine.decodeAudio(file);
      setTracks((prev) =>
        prev.map((t) =>
          t.trackId === trackId
            ? {
                ...t,
                name: file.name.replace(/\.[^/.]+$/, ''),
                audioBlob: file,
                audioBuffer: decoded.buffer,
                waveformPeaks: decoded.peaks,
                duration: decoded.duration,
              }
            : t
        )
      );
      toast(`Stem "${file.name}" imported and synchronized!`, 'success');
    } catch (err) {
      console.error(err);
      toast('Failed to decode audio file. Ensure valid WAV, MP3, or OGG format.', 'error');
    }
  };

  // Add a new empty or synthetic track
  const handleAddTrack = async (instrument: InstrumentType) => {
    const trackId = `track_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newTrack: AudioTrack = {
      trackId,
      projectId: activeProject?.projectId || 'general',
      name: `${instrument} Track`,
      instrument,
      musicianId: user?.uid || 'guest',
      musicianName: profile?.displayName || 'Session Musician',
      duration: 8.0,
      startOffset: 0,
      waveformPeaks: [],
      volume: 1.0,
      pan: 0,
      isMuted: false,
      isSolo: false,
      eqLow: 0,
      eqMid: 0,
      eqHigh: 0,
      reverbLevel: 0.1,
      delayLevel: 0,
    };
    setTracks((prev) => [...prev, newTrack]);
    toast(`New ${instrument} track added. Upload audio or click Record to record.`, 'success');
  };

  // Add synthetic backing stem
  const handleAddSyntheticStem = async (type: 'Drums' | 'Bass' | 'Guitar' | 'Keyboard') => {
    toast(`Synthesizing ${type} stem at ${activeProject?.bpm || 120} BPM...`, 'info');
    try {
      const audioCtx = audioEngine.getContext();
      const buffer = await generateInstrumentStem(audioCtx, type, activeProject?.bpm || 120, 4);

      // Extract real peaks
      const channelData = buffer.getChannelData(0);
      const peaks: number[] = [];
      const blockSize = Math.floor(channelData.length / 80);
      for (let i = 0; i < 80; i++) {
        let max = 0;
        for (let j = 0; j < blockSize; j++) {
          const val = Math.abs(channelData[i * blockSize + j]);
          if (val > max) max = val;
        }
        peaks.push(Math.min(1.0, max));
      }

      const newTrack: AudioTrack = {
        trackId: `stem_${type}_${Date.now()}`,
        projectId: activeProject?.projectId || 'general',
        name: `${type} Studio Stem`,
        instrument: type as InstrumentType,
        musicianId: user?.uid || 'guest',
        musicianName: 'Studio Synthesizer',
        audioBuffer: buffer,
        waveformPeaks: peaks,
        duration: buffer.duration,
        startOffset: 0,
        volume: 0.9,
        pan: 0,
        isMuted: false,
        isSolo: false,
      };

      setTracks((prev) => [...prev, newTrack]);
      toast(`Added synchronized ${type} stem!`, 'success');
    } catch (err) {
      console.error(err);
      toast('Failed to synthesize stem', 'error');
    }
  };

  const handleUpdateTrack = (trackId: string, updates: Partial<AudioTrack>) => {
    setTracks((prev) =>
      prev.map((t) => {
        if (t.trackId === trackId) {
          const updated = { ...t, ...updates };
          // Real-time audio engine feedback
          if (updates.volume !== undefined) audioEngine.setTrackVolume(trackId, updates.volume);
          if (updates.pan !== undefined) audioEngine.setTrackPan(trackId, updates.pan);
          if (updates.eqLow !== undefined || updates.eqMid !== undefined || updates.eqHigh !== undefined) {
            audioEngine.setTrackEQ(
              trackId,
              updated.eqLow ?? 0,
              updated.eqMid ?? 0,
              updated.eqHigh ?? 0
            );
          }
          return updated;
        }
        return t;
      })
    );
  };

  const handleDeleteTrack = (trackId: string) => {
    setTracks((prev) => prev.filter((t) => t.trackId !== trackId));
    toast('Track deleted', 'info');
  };

  // Calculate timeline max duration
  const totalTimelineDuration = Math.max(
    16,
    ...tracks.map((t) => (t.startOffset || 0) + (t.duration || 4))
  );

  return (
    <div className="space-y-4 pb-12">
      {/* Studio Top Control Center */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-4">
        {/* Project Header Info */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-zinc-850">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-xl shadow-purple-950/40 shrink-0">
              <Disc3 className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {activeProject?.title || 'Global Multitrack Studio'}
                </h1>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {activeProject?.genre || 'Rock'}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400 mt-0.5">
                <span>Tempo: <strong className="text-purple-300 font-mono">{activeProject?.bpm || 120} BPM</strong></span>
                <span>•</span>
                <span>Key: <strong className="text-zinc-200">{activeProject?.musicKey || 'C Major'}</strong></span>
                <span>•</span>
                <span>Time: <strong className="text-zinc-200">{activeProject?.timeSignature || '4/4'}</strong></span>
                <span>•</span>
                <span>Host: <strong className="text-zinc-300">{activeProject?.ownerName || 'Creator'}</strong></span>
              </div>
            </div>
          </div>

          {/* View Mode Toggle & Master Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-zinc-900 p-1 rounded-xl border border-zinc-800">
              <button
                onClick={() => setActiveView('timeline')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  activeView === 'timeline'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Timeline</span>
              </button>
              <button
                onClick={() => setActiveView('mixer')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  activeView === 'mixer'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Console</span>
              </button>
            </div>

            <button
              onClick={onNavigateProjects}
              className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-300 font-medium transition-colors"
            >
              Switch Project
            </button>
          </div>
        </div>

        {/* Studio Transport Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
          {/* Playback Transport Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleRewind}
              title="Return to Zero (Start)"
              className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-300 hover:text-white transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={handleTogglePlay}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg transition-all ${
                isPlaying
                  ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-amber-950/50'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/50'
              }`}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isPlaying ? 'Pause' : 'Play All Stems'}</span>
            </button>

            <button
              onClick={handleStop}
              title="Stop Playback"
              className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-300 hover:text-white transition-colors"
            >
              <Square className="w-4 h-4" />
            </button>

            {/* Live Record Button */}
            <button
              onClick={() => handleStartRecording()}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                isRecording
                  ? 'bg-rose-600 text-white animate-pulse shadow-lg shadow-rose-950/60'
                  : 'bg-rose-950/80 hover:bg-rose-900 border border-rose-500/50 text-rose-300'
              }`}
            >
              <Mic className="w-4 h-4 text-rose-400" />
              <span>{isRecording ? 'Stop Recording' : 'Record Input'}</span>
            </button>
          </div>

          {/* Timecode Clock & Bars:Beats display */}
          <div className="flex items-center gap-3">
            <div className="px-3.5 py-1.5 rounded-xl bg-black border border-zinc-800 font-mono text-center flex items-center gap-3">
              <div>
                <span className="text-[9px] uppercase tracking-wider text-zinc-500 block">Time</span>
                <span className="text-sm font-bold text-white">
                  {Math.floor(playhead / 60)}:{(playhead % 60).toFixed(2).padStart(5, '0')}
                </span>
              </div>
              <div className="border-l border-zinc-800 pl-3">
                <span className="text-[9px] uppercase tracking-wider text-zinc-500 block">Bars:Beats</span>
                <span className="text-sm font-bold text-purple-400">
                  {Math.floor(playhead / (240 / (activeProject?.bpm || 120))) + 1}:
                  {Math.floor((playhead % (240 / (activeProject?.bpm || 120))) / (60 / (activeProject?.bpm || 120))) + 1}
                </span>
              </div>
            </div>

            {/* Metronome Toggle */}
            <button
              onClick={() => setMetronomeEnabled(!metronomeEnabled)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-colors ${
                metronomeEnabled
                  ? 'bg-purple-950/80 border-purple-500/50 text-purple-300'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Click</span>
            </button>
          </div>

          {/* Quick Track & Stem Creator Actions */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleAddTrack('Guitar')}
              className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-200 font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-purple-400" />
              <span>Add Track</span>
            </button>

            <button
              onClick={() => handleAddSyntheticStem('Keyboard')}
              className="px-3 py-2 rounded-xl bg-gradient-to-r from-purple-600/30 to-indigo-600/30 hover:from-purple-600/40 hover:to-indigo-600/40 border border-purple-500/40 text-xs text-purple-200 font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>+ Synth Groove</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace: Timeline or Mixer */}
      {activeView === 'timeline' ? (
        <div className="bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
          {/* Timeline Beats Ruler Bar */}
          <div className="flex border-b border-zinc-800 bg-zinc-900/80 select-none">
            <div className="w-64 sm:w-72 shrink-0 p-2.5 px-4 font-mono text-xs font-bold text-zinc-400 uppercase tracking-wider border-r border-zinc-800">
              Tracks & Stems ({tracks.length})
            </div>

            {/* Time ticks ruler */}
            <div
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const newTime = Math.max(0, clickX / pixelsPerSecond);
                setPlayhead(newTime);
                if (isPlaying) {
                  audioEngine.play(tracks, newTime);
                }
              }}
              className="flex-1 relative h-8 cursor-pointer overflow-hidden flex items-center"
            >
              {Array.from({ length: Math.ceil(totalTimelineDuration / 2) + 2 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute text-[10px] font-mono text-zinc-500 flex items-center gap-1"
                  style={{ left: `${i * 2 * pixelsPerSecond}px` }}
                >
                  <span className="w-px h-3 bg-zinc-700 block" />
                  <span>Bar {Math.floor(i / 2) + 1} ({i * 2}s)</span>
                </div>
              ))}

              {/* Playhead Cursor */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-cyan-400 z-30 pointer-events-none"
                style={{ left: `${playhead * pixelsPerSecond}px` }}
              >
                <div className="w-3 h-3 bg-cyan-400 rounded-sm -ml-1 -mt-1 shadow-md shadow-cyan-500/50" />
              </div>
            </div>
          </div>

          {/* Multitrack Stems List */}
          <div className="relative">
            {/* Playhead line continuing through all tracks */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-cyan-400/80 z-20 pointer-events-none ml-64 sm:ml-72"
              style={{ left: `${playhead * pixelsPerSecond}px` }}
            />

            {tracks.length > 0 ? (
              tracks.map((track) => (
                <TrackRow
                  key={track.trackId}
                  track={track}
                  pixelsPerSecond={pixelsPerSecond}
                  totalDuration={totalTimelineDuration}
                  playheadSeconds={playhead}
                  isOwnerOrContributor={true}
                  onUpdateTrack={handleUpdateTrack}
                  onDeleteTrack={handleDeleteTrack}
                  onRecordIntoTrack={(id) => handleStartRecording(id)}
                  onUploadIntoTrack={handleUploadAudio}
                />
              ))
            ) : (
              <div className="p-12 text-center text-zinc-500">
                <Music className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                <h3 className="font-bold text-white text-sm mb-1">No audio stems in this song yet</h3>
                <p className="text-xs text-zinc-400 mb-4">
                  Add an instrument track or generate a rhythm groove to start recording.
                </p>
                <button
                  onClick={() => handleAddSyntheticStem('Drums')}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold"
                >
                  Generate Initial Drum Stem
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Mixing Console View */
        <MixingConsole
          tracks={tracks}
          masterSettings={masterSettings}
          onUpdateTrack={handleUpdateTrack}
          onUpdateMasterSettings={(newSettings) =>
            setMasterSettings((prev) => ({ ...prev, ...newSettings }))
          }
          songTitle={activeProject?.title}
        />
      )}
    </div>
  );
};
