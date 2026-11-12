import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  Sliders,
  Trash2,
  Upload,
  Mic,
  Disc3,
  MoveHorizontal,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Music,
} from 'lucide-react';
import { AudioTrack, InstrumentType } from '../../types';
import { WaveformCanvas } from './WaveformCanvas';

export const TrackRow: React.FC<{
  track: AudioTrack;
  pixelsPerSecond: number;
  totalDuration: number;
  playheadSeconds: number;
  isOwnerOrContributor: boolean;
  onUpdateTrack: (trackId: string, updates: Partial<AudioTrack>) => void;
  onDeleteTrack: (trackId: string) => void;
  onRecordIntoTrack: (trackId: string) => void;
  onUploadIntoTrack: (trackId: string, file: File) => void;
}> = ({
  track,
  pixelsPerSecond,
  totalDuration,
  playheadSeconds,
  isOwnerOrContributor,
  onUpdateTrack,
  onDeleteTrack,
  onRecordIntoTrack,
  onUploadIntoTrack,
}) => {
  const [showFx, setShowFx] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [trackName, setTrackName] = useState(track.name);

  const handleNameBlur = () => {
    setIsEditingName(false);
    if (trackName.trim() && trackName !== track.name) {
      onUpdateTrack(track.trackId, { name: trackName.trim() });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUploadIntoTrack(track.trackId, e.target.files[0]);
    }
  };

  const trackWidthPixels = Math.max(120, (track.duration || 4) * pixelsPerSecond);
  const trackOffsetPixels = (track.startOffset || 0) * pixelsPerSecond;

  return (
    <div className="flex border-b border-zinc-800/80 bg-zinc-950/60 hover:bg-zinc-900/40 transition-colors group">
      {/* Track Control Strip (Left Pane) */}
      <div className="w-64 sm:w-72 shrink-0 p-3 bg-zinc-950 border-r border-zinc-800 flex flex-col justify-between gap-2.5">
        <div>
          {/* Header row: Instrument badge + Name + Actions */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0" />
              {isEditingName ? (
                <input
                  type="text"
                  value={trackName}
                  onChange={(e) => setTrackName(e.target.value)}
                  onBlur={handleNameBlur}
                  onKeyDown={(e) => e.key === 'Enter' && handleNameBlur()}
                  autoFocus
                  className="bg-zinc-900 border border-purple-500 px-1.5 py-0.5 rounded text-xs text-white outline-none w-32"
                />
              ) : (
                <h4
                  onClick={() => setIsEditingName(true)}
                  title="Click to rename track"
                  className="text-xs font-bold text-white truncate cursor-pointer hover:text-purple-300 transition-colors"
                >
                  {track.name}
                </h4>
              )}
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowFx(!showFx)}
                title="Track DSP & Effects Rack"
                className={`p-1 rounded-md text-[10px] font-bold transition-colors ${
                  showFx
                    ? 'bg-purple-600 text-white'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => onDeleteTrack(track.trackId)}
                title="Delete Track"
                className="p-1 rounded-md text-zinc-500 hover:text-rose-400 hover:bg-zinc-900 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Musician attribution & instrument tag */}
          <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-1">
            <span className="text-purple-300 font-medium truncate max-w-[120px]">
              {track.instrument}
            </span>
            <span className="text-[10px] text-zinc-500 truncate max-w-[100px]">
              By {track.musicianName || 'Session Musician'}
            </span>
          </div>
        </div>

        {/* Mixer Faders: Volume, Pan, Mute, Solo */}
        <div className="space-y-2 pt-1 border-t border-zinc-900">
          <div className="flex items-center gap-2">
            {/* Mute & Solo buttons */}
            <button
              onClick={() => onUpdateTrack(track.trackId, { isMuted: !track.isMuted })}
              className={`w-6 h-6 rounded font-bold text-[10px] flex items-center justify-center transition-colors ${
                track.isMuted
                  ? 'bg-rose-600 text-white font-black'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white'
              }`}
            >
              M
            </button>

            <button
              onClick={() => onUpdateTrack(track.trackId, { isSolo: !track.isSolo })}
              className={`w-6 h-6 rounded font-bold text-[10px] flex items-center justify-center transition-colors ${
                track.isSolo
                  ? 'bg-amber-500 text-black font-black'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white'
              }`}
            >
              S
            </button>

            {/* Volume Slider */}
            <div className="flex-1 flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
              <input
                type="range"
                min="0"
                max="1.5"
                step="0.02"
                value={track.volume ?? 1.0}
                onChange={(e) =>
                  onUpdateTrack(track.trackId, { volume: parseFloat(e.target.value) })
                }
                className="w-full accent-purple-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
              />
              <span className="font-mono text-[10px] text-zinc-400 w-7 text-right">
                {Math.round((track.volume ?? 1.0) * 100)}%
              </span>
            </div>
          </div>

          {/* Pan Slider */}
          <div className="flex items-center justify-between text-[10px] text-zinc-400 gap-2">
            <span className="text-[10px] font-mono text-zinc-500">Pan</span>
            <input
              type="range"
              min="-1"
              max="1"
              step="0.05"
              value={track.pan ?? 0}
              onChange={(e) =>
                onUpdateTrack(track.trackId, { pan: parseFloat(e.target.value) })
              }
              className="flex-1 accent-indigo-500 h-1 bg-zinc-800 rounded cursor-pointer"
            />
            <span className="font-mono text-[10px] text-zinc-400 w-8 text-right">
              {(track.pan ?? 0) === 0
                ? 'C'
                : (track.pan ?? 0) < 0
                ? `L${Math.round(Math.abs(track.pan || 0) * 100)}`
                : `R${Math.round((track.pan || 0) * 100)}`}
            </span>
          </div>

          {/* Expanded FX Panel (EQ & Sends) */}
          {showFx && (
            <div className="mt-2 p-2.5 rounded-xl bg-zinc-900/90 border border-purple-500/30 space-y-2 text-[10px]">
              <span className="font-bold uppercase tracking-wider text-purple-300 block">
                3-Band Studio Equalizer
              </span>
              <div className="grid grid-cols-3 gap-1.5 text-center">
                <div>
                  <span className="text-zinc-500 block">Low (220Hz)</span>
                  <input
                    type="range"
                    min="-12"
                    max="12"
                    step="1"
                    value={track.eqLow ?? 0}
                    onChange={(e) =>
                      onUpdateTrack(track.trackId, { eqLow: parseFloat(e.target.value) })
                    }
                    className="w-full accent-purple-500 h-1"
                  />
                  <span className="font-mono text-zinc-300">{track.eqLow ?? 0}dB</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Mid (1.2k)</span>
                  <input
                    type="range"
                    min="-12"
                    max="12"
                    step="1"
                    value={track.eqMid ?? 0}
                    onChange={(e) =>
                      onUpdateTrack(track.trackId, { eqMid: parseFloat(e.target.value) })
                    }
                    className="w-full accent-purple-500 h-1"
                  />
                  <span className="font-mono text-zinc-300">{track.eqMid ?? 0}dB</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">High (4.5k)</span>
                  <input
                    type="range"
                    min="-12"
                    max="12"
                    step="1"
                    value={track.eqHigh ?? 0}
                    onChange={(e) =>
                      onUpdateTrack(track.trackId, { eqHigh: parseFloat(e.target.value) })
                    }
                    className="w-full accent-purple-500 h-1"
                  />
                  <span className="font-mono text-zinc-300">{track.eqHigh ?? 0}dB</span>
                </div>
              </div>

              {/* Effects Sends */}
              <div className="pt-2 border-t border-zinc-800 grid grid-cols-2 gap-2">
                <div>
                  <span className="text-zinc-500 block">Reverb Send</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={track.reverbLevel ?? 0}
                    onChange={(e) =>
                      onUpdateTrack(track.trackId, { reverbLevel: parseFloat(e.target.value) })
                    }
                    className="w-full accent-cyan-500 h-1"
                  />
                </div>
                <div>
                  <span className="text-zinc-500 block">Delay Send</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={track.delayLevel ?? 0}
                    onChange={(e) =>
                      onUpdateTrack(track.trackId, { delayLevel: parseFloat(e.target.value) })
                    }
                    className="w-full accent-cyan-500 h-1"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action triggers: Upload file or record into this track */}
        <div className="flex items-center gap-1.5 pt-1.5 border-t border-zinc-900">
          <label className="flex-1 py-1 px-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[10px] text-zinc-300 hover:text-white flex items-center justify-center gap-1 cursor-pointer transition-colors">
            <Upload className="w-3 h-3 text-purple-400" />
            <span>Upload Stem</span>
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          <button
            onClick={() => onRecordIntoTrack(track.trackId)}
            className="py-1 px-2 rounded-lg bg-rose-950/70 hover:bg-rose-900 border border-rose-500/40 text-[10px] text-rose-300 font-semibold flex items-center gap-1 transition-colors"
          >
            <Mic className="w-3 h-3 text-rose-400" />
            <span>Record</span>
          </button>
        </div>
      </div>

      {/* Track Timeline Area (Right Pane) */}
      <div className="flex-1 relative min-h-[110px] flex items-center px-2 overflow-hidden bg-zinc-950/40">
        {/* Track Stem Block positioned at exact startOffset */}
        <div
          className={`absolute h-20 rounded-xl border transition-shadow flex flex-col justify-between p-2 shadow-lg ${
            track.isMuted
              ? 'bg-zinc-900/60 border-zinc-800 opacity-50'
              : 'bg-zinc-900/90 border-purple-500/40 shadow-purple-950/20'
          }`}
          style={{
            left: `${trackOffsetPixels}px`,
            width: `${trackWidthPixels}px`,
          }}
        >
          {/* Stem top details */}
          <div className="flex items-center justify-between text-[10px] pointer-events-none select-none">
            <span className="font-bold text-white truncate max-w-[120px]">
              {track.name}
            </span>
            <div className="flex items-center gap-1.5 font-mono text-zinc-400">
              <span>{(track.duration || 0).toFixed(1)}s</span>
              <span>•</span>
              <span className="text-purple-300">Offset: +{(track.startOffset || 0).toFixed(2)}s</span>
            </div>
          </div>

          {/* Real waveform canvas */}
          <div className="flex-1 my-1">
            <WaveformCanvas
              peaks={track.waveformPeaks}
              duration={track.duration || 4}
              instrument={track.instrument}
              isMuted={track.isMuted}
              width={trackWidthPixels}
              height={36}
            />
          </div>

          {/* Timeline Offset Fine-tuner */}
          <div className="flex items-center justify-between text-[9px] text-zinc-500 pt-1 border-t border-zinc-800/60">
            <div className="flex items-center gap-1">
              <MoveHorizontal className="w-3 h-3 text-zinc-400" />
              <span>Shift Position:</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() =>
                  onUpdateTrack(track.trackId, {
                    startOffset: Math.max(0, (track.startOffset || 0) - 0.25),
                  })
                }
                className="px-1.5 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
              >
                -0.25s
              </button>
              <button
                onClick={() =>
                  onUpdateTrack(track.trackId, {
                    startOffset: (track.startOffset || 0) + 0.25,
                  })
                }
                className="px-1.5 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
              >
                +0.25s
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
