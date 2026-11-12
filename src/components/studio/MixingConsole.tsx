import React, { useState } from 'react';
import {
  Sliders,
  Volume2,
  VolumeX,
  Download,
  Disc3,
  Layers,
  Sparkles,
  Music,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { AudioTrack, MasterMixSettings } from '../../types';
import { audioEngine } from '../../audio/AudioEngine';
import { useToast } from '../../context/ToastContext';

export const MixingConsole: React.FC<{
  tracks: AudioTrack[];
  masterSettings: MasterMixSettings;
  onUpdateTrack: (trackId: string, updates: Partial<AudioTrack>) => void;
  onUpdateMasterSettings: (settings: Partial<MasterMixSettings>) => void;
  songTitle?: string;
}> = ({
  tracks,
  masterSettings,
  onUpdateTrack,
  onUpdateMasterSettings,
  songTitle = 'Global_Music_Jam',
}) => {
  const { toast } = useToast();
  const [exporting, setExporting] = useState(false);

  const handleExportMixdown = async () => {
    if (tracks.length === 0 || !tracks.some((t) => t.audioBuffer)) {
      toast('Please add or record audio stems into tracks before exporting', 'error');
      return;
    }

    setExporting(true);
    try {
      toast('Rendering offline master mixdown with DSP filters & convolution reverb...', 'info');
      const wavBlob = await audioEngine.exportMixdownWav(tracks, masterSettings);

      // Download file
      const url = URL.createObjectURL(wavBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${songTitle.replace(/\s+/g, '_')}_Master_Mixdown.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast('Master mixdown WAV exported and downloaded successfully!', 'success');
    } catch (err) {
      console.error('Mixdown export error:', err);
      toast('Failed to render audio mixdown', 'error');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Console Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-950 border border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/40 text-purple-400 flex items-center justify-center">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Studio Mixing & Mastering Console</h2>
            <p className="text-xs text-zinc-400">
              Parametric EQ, Convolution Reverb, Stereo Delay, and Offline Master WAV Render
            </p>
          </div>
        </div>

        <button
          onClick={handleExportMixdown}
          disabled={exporting}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>{exporting ? 'Rendering Master...' : 'Export Master Mixdown (WAV)'}</span>
        </button>
      </div>

      {/* Mixing Desk Grid */}
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
        {/* Track Channel Strips */}
        {tracks.map((track) => (
          <div
            key={track.trackId}
            className={`w-44 shrink-0 rounded-2xl border p-4 flex flex-col justify-between gap-4 ${
              track.isMuted
                ? 'bg-zinc-950/40 border-zinc-900 opacity-60'
                : 'bg-zinc-950 border-zinc-800 shadow-xl'
            }`}
          >
            {/* Strip Header */}
            <div className="text-center pb-2 border-b border-zinc-900">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 block truncate">
                {track.instrument}
              </span>
              <h3 className="font-bold text-white text-xs truncate mt-0.5">{track.name}</h3>
            </div>

            {/* EQ Section */}
            <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2 text-[10px]">
              <span className="font-semibold text-zinc-400 block text-center uppercase tracking-wider text-[9px]">
                3-Band EQ
              </span>
              <div>
                <div className="flex justify-between text-zinc-500">
                  <span>High</span>
                  <span>{track.eqHigh ?? 0}dB</span>
                </div>
                <input
                  type="range"
                  min="-12"
                  max="12"
                  step="1"
                  value={track.eqHigh ?? 0}
                  onChange={(e) =>
                    onUpdateTrack(track.trackId, { eqHigh: parseFloat(e.target.value) })
                  }
                  className="w-full accent-purple-500 h-1 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-zinc-500">
                  <span>Mid</span>
                  <span>{track.eqMid ?? 0}dB</span>
                </div>
                <input
                  type="range"
                  min="-12"
                  max="12"
                  step="1"
                  value={track.eqMid ?? 0}
                  onChange={(e) =>
                    onUpdateTrack(track.trackId, { eqMid: parseFloat(e.target.value) })
                  }
                  className="w-full accent-purple-500 h-1 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-zinc-500">
                  <span>Low</span>
                  <span>{track.eqLow ?? 0}dB</span>
                </div>
                <input
                  type="range"
                  min="-12"
                  max="12"
                  step="1"
                  value={track.eqLow ?? 0}
                  onChange={(e) =>
                    onUpdateTrack(track.trackId, { eqLow: parseFloat(e.target.value) })
                  }
                  className="w-full accent-purple-500 h-1 cursor-pointer"
                />
              </div>
            </div>

            {/* Effects Sends */}
            <div className="space-y-2 text-[10px] text-zinc-400">
              <div className="flex items-center justify-between">
                <span>Reverb</span>
                <span className="font-mono text-cyan-400">
                  {Math.round((track.reverbLevel ?? 0) * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={track.reverbLevel ?? 0}
                onChange={(e) =>
                  onUpdateTrack(track.trackId, { reverbLevel: parseFloat(e.target.value) })
                }
                className="w-full accent-cyan-500 h-1 cursor-pointer"
              />

              <div className="flex items-center justify-between">
                <span>Delay</span>
                <span className="font-mono text-cyan-400">
                  {Math.round((track.delayLevel ?? 0) * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={track.delayLevel ?? 0}
                onChange={(e) =>
                  onUpdateTrack(track.trackId, { delayLevel: parseFloat(e.target.value) })
                }
                className="w-full accent-cyan-500 h-1 cursor-pointer"
              />
            </div>

            {/* Pan Knob */}
            <div className="text-center pt-2 border-t border-zinc-900">
              <div className="flex justify-between text-[10px] text-zinc-400 mb-1">
                <span>Pan</span>
                <span className="font-mono">
                  {(track.pan ?? 0) === 0
                    ? 'Center'
                    : (track.pan ?? 0) < 0
                    ? `L${Math.round(Math.abs(track.pan || 0) * 100)}`
                    : `R${Math.round((track.pan || 0) * 100)}`}
                </span>
              </div>
              <input
                type="range"
                min="-1"
                max="1"
                step="0.05"
                value={track.pan ?? 0}
                onChange={(e) =>
                  onUpdateTrack(track.trackId, { pan: parseFloat(e.target.value) })
                }
                className="w-full accent-indigo-500 h-1.5 cursor-pointer"
              />
            </div>

            {/* Vertical Volume Fader */}
            <div className="flex items-center justify-center gap-2 py-2">
              <div className="h-36 flex items-center justify-center">
                <input
                  type="range"
                  min="0"
                  max="1.5"
                  step="0.02"
                  value={track.volume ?? 1.0}
                  onChange={(e) =>
                    onUpdateTrack(track.trackId, { volume: parseFloat(e.target.value) })
                  }
                  className="accent-purple-500 cursor-pointer h-2 bg-zinc-800 rounded-lg -rotate-90 w-32 origin-center"
                />
              </div>
            </div>

            {/* Mute and Solo */}
            <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-zinc-900">
              <button
                onClick={() => onUpdateTrack(track.trackId, { isMuted: !track.isMuted })}
                className={`py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  track.isMuted
                    ? 'bg-rose-600 text-white'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white'
                }`}
              >
                Mute
              </button>

              <button
                onClick={() => onUpdateTrack(track.trackId, { isSolo: !track.isSolo })}
                className={`py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  track.isSolo
                    ? 'bg-amber-500 text-black'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white'
                }`}
              >
                Solo
              </button>
            </div>
          </div>
        ))}

        {/* Master Bus Channel Strip */}
        <div className="w-56 shrink-0 rounded-2xl border-2 border-purple-500/50 bg-gradient-to-b from-purple-950/40 via-zinc-950 to-zinc-950 p-4 flex flex-col justify-between gap-4 shadow-2xl">
          <div className="text-center pb-2 border-b border-purple-500/30">
            <span className="text-[10px] font-black uppercase tracking-widest text-purple-300 block">
              Master Bus
            </span>
            <h3 className="font-black text-white text-sm mt-0.5">Stereo Master Out</h3>
          </div>

          {/* Master Dynamics Compressor */}
          <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2 text-[10px]">
            <span className="font-bold uppercase tracking-wider text-purple-300 block text-center">
              Master Compressor
            </span>
            <div>
              <div className="flex justify-between text-zinc-400">
                <span>Threshold</span>
                <span>{masterSettings.compressorThreshold}dB</span>
              </div>
              <input
                type="range"
                min="-40"
                max="0"
                step="1"
                value={masterSettings.compressorThreshold}
                onChange={(e) =>
                  onUpdateMasterSettings({ compressorThreshold: parseFloat(e.target.value) })
                }
                className="w-full accent-purple-500 h-1 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-zinc-400">
                <span>Ratio</span>
                <span>{masterSettings.compressorRatio}:1</span>
              </div>
              <input
                type="range"
                min="1"
                max="12"
                step="0.5"
                value={masterSettings.compressorRatio}
                onChange={(e) =>
                  onUpdateMasterSettings({ compressorRatio: parseFloat(e.target.value) })
                }
                className="w-full accent-purple-500 h-1 cursor-pointer"
              />
            </div>
          </div>

          {/* Master Reverb Decay */}
          <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2 text-[10px]">
            <div className="flex justify-between text-zinc-400">
              <span className="font-bold uppercase tracking-wider text-cyan-300">
                Room Decay
              </span>
              <span className="font-mono text-cyan-300">
                {masterSettings.reverbDecay.toFixed(1)}s
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="5.0"
              step="0.2"
              value={masterSettings.reverbDecay}
              onChange={(e) =>
                onUpdateMasterSettings({ reverbDecay: parseFloat(e.target.value) })
              }
              className="w-full accent-cyan-500 h-1 cursor-pointer"
            />
          </div>

          {/* Master Fader */}
          <div className="flex flex-col items-center justify-center py-2">
            <span className="text-xs font-mono text-purple-300 mb-1">
              {Math.round(masterSettings.masterVolume * 100)}%
            </span>
            <div className="h-36 flex items-center justify-center">
              <input
                type="range"
                min="0"
                max="1.5"
                step="0.02"
                value={masterSettings.masterVolume}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  onUpdateMasterSettings({ masterVolume: val });
                  audioEngine.setMasterVolume(val);
                }}
                className="accent-purple-400 cursor-pointer h-2 bg-zinc-800 rounded-lg -rotate-90 w-32 origin-center"
              />
            </div>
          </div>

          {/* Export Button */}
          <button
            onClick={handleExportMixdown}
            disabled={exporting}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Mixdown</span>
          </button>
        </div>
      </div>
    </div>
  );
};
