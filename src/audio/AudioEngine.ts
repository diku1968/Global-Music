/**
 * Global Music Jam - Web Audio Multitrack Engine
 * Real Web Audio API implementation: DSP graph, timeline synchronization,
 * true waveform peak extraction, multitrack mixing, and offline mixdown rendering.
 */

import { AudioTrack, MasterMixSettings } from '../types';

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private masterCompressor: DynamicsCompressorNode | null = null;
  private reverbConvolver: ConvolverNode | null = null;
  private delayNode: DelayNode | null = null;
  private delayFeedbackGain: GainNode | null = null;

  // Active track playback nodes
  private activeSources: Map<
    string,
    {
      source: AudioBufferSourceNode;
      gain: GainNode;
      panner: StereoPannerNode;
      eqLow: BiquadFilterNode;
      eqMid: BiquadFilterNode;
      eqHigh: BiquadFilterNode;
    }
  > = new Map();

  private isPlaying = false;
  private playbackStartTime = 0;
  private playheadOffsetAtStart = 0;

  // Metronome
  private metronomeTimer: number | null = null;

  // Recording
  private mediaStream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private recordingStartPlayhead = 0;

  constructor() {
    // Lazy initialize upon user gesture
  }

  public getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.setupMasterBus();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  private setupMasterBus() {
    if (!this.ctx) return;

    // Master Compressor
    this.masterCompressor = this.ctx.createDynamicsCompressor();
    this.masterCompressor.threshold.setValueAtTime(-14, this.ctx.currentTime);
    this.masterCompressor.knee.setValueAtTime(20, this.ctx.currentTime);
    this.masterCompressor.ratio.setValueAtTime(4, this.ctx.currentTime);
    this.masterCompressor.attack.setValueAtTime(0.005, this.ctx.currentTime);
    this.masterCompressor.release.setValueAtTime(0.15, this.ctx.currentTime);

    // Master Gain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);

    // Reverb Impulse Convolver
    this.reverbConvolver = this.ctx.createConvolver();
    this.reverbConvolver.buffer = this.createStudioImpulseResponse(this.ctx, 1.8, 2.0);

    // Master Delay
    this.delayNode = this.ctx.createDelay(2.0);
    this.delayNode.delayTime.setValueAtTime(0.35, this.ctx.currentTime);
    this.delayFeedbackGain = this.ctx.createGain();
    this.delayFeedbackGain.gain.setValueAtTime(0.35, this.ctx.currentTime);

    this.delayNode.connect(this.delayFeedbackGain);
    this.delayFeedbackGain.connect(this.delayNode);

    // Route Delay & Reverb to Master
    this.delayNode.connect(this.masterCompressor);
    this.reverbConvolver.connect(this.masterCompressor);

    // Master Compressor -> Master Gain -> Destination
    this.masterCompressor.connect(this.masterGain);
    this.masterGain.connect(this.ctx.destination);
  }

  /**
   * Generates a stereo studio room impulse response for genuine convolution reverb
   */
  private createStudioImpulseResponse(ctx: BaseAudioContext, duration: number, decay: number): AudioBuffer {
    const sampleRate = ctx.sampleRate;
    const length = sampleRate * duration;
    const impulse = ctx.createBuffer(2, length, sampleRate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
      const n = length - i;
      const factor = Math.pow(n / length, decay);
      left[i] = (Math.random() * 2 - 1) * factor;
      right[i] = (Math.random() * 2 - 1) * factor;
    }
    return impulse;
  }

  /**
   * Decodes an audio file and calculates true PCM peak min/max values for waveforms
   */
  public async decodeAudio(blob: Blob): Promise<{
    buffer: AudioBuffer;
    peaks: number[];
    duration: number;
  }> {
    const ctx = this.getContext();
    const arrayBuffer = await blob.arrayBuffer();
    const buffer = await ctx.decodeAudioData(arrayBuffer);

    // Extract true peak envelope (120 bins)
    const channelData = buffer.getChannelData(0);
    const numBins = 120;
    const blockSize = Math.floor(channelData.length / numBins);
    const peaks: number[] = [];

    for (let i = 0; i < numBins; i++) {
      let max = 0;
      const start = i * blockSize;
      for (let j = 0; j < blockSize; j++) {
        const val = Math.abs(channelData[start + j]);
        if (val > max) max = val;
      }
      peaks.push(Math.min(1.0, max));
    }

    return {
      buffer,
      peaks,
      duration: buffer.duration,
    };
  }

  /**
   * Plays all active tracks with sample-accurate startOffsets on the shared timeline
   */
  public play(tracks: AudioTrack[], startPlayhead = 0) {
    this.stop();
    const ctx = this.getContext();

    this.isPlaying = true;
    this.playbackStartTime = ctx.currentTime;
    this.playheadOffsetAtStart = Math.max(0, startPlayhead);

    // Determine solo tracks
    const hasSolo = tracks.some((t) => t.isSolo);

    tracks.forEach((track) => {
      if (!track.audioBuffer) return;
      if (track.isMuted) return;
      if (hasSolo && !track.isSolo) return;

      const trackOffset = track.startOffset || 0;
      const trackDuration = track.duration || track.audioBuffer.duration;
      const trackEnd = trackOffset + trackDuration;

      // Check if track is still relevant for current playhead
      if (trackEnd <= this.playheadOffsetAtStart) return;

      // Create Source
      const source = ctx.createBufferSource();
      source.buffer = track.audioBuffer;

      // Create 3-Band EQ
      const eqLow = ctx.createBiquadFilter();
      eqLow.type = 'lowshelf';
      eqLow.frequency.setValueAtTime(220, ctx.currentTime);
      eqLow.gain.setValueAtTime(track.eqLow || 0, ctx.currentTime);

      const eqMid = ctx.createBiquadFilter();
      eqMid.type = 'peaking';
      eqMid.frequency.setValueAtTime(1200, ctx.currentTime);
      eqMid.Q.setValueAtTime(1.0, ctx.currentTime);
      eqMid.gain.setValueAtTime(track.eqMid || 0, ctx.currentTime);

      const eqHigh = ctx.createBiquadFilter();
      eqHigh.type = 'highshelf';
      eqHigh.frequency.setValueAtTime(4500, ctx.currentTime);
      eqHigh.gain.setValueAtTime(track.eqHigh || 0, ctx.currentTime);

      // Stereo Panner
      const panner = ctx.createStereoPanner();
      panner.pan.setValueAtTime(Math.max(-1, Math.min(1, track.pan || 0)), ctx.currentTime);

      // Track Gain
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(track.volume ?? 1.0, ctx.currentTime);

      // Wire Track DSP: Source -> EQLow -> EQMid -> EQHigh -> Panner -> Gain
      source.connect(eqLow);
      eqLow.connect(eqMid);
      eqMid.connect(eqHigh);
      eqHigh.connect(panner);
      panner.connect(gain);

      // Connect to Master Compressor
      if (this.masterCompressor) {
        gain.connect(this.masterCompressor);
      }

      // Reverb Send
      if (this.reverbConvolver && track.reverbLevel && track.reverbLevel > 0) {
        const reverbSend = ctx.createGain();
        reverbSend.gain.setValueAtTime(track.reverbLevel * 0.7, ctx.currentTime);
        gain.connect(reverbSend);
        reverbSend.connect(this.reverbConvolver);
      }

      // Delay Send
      if (this.delayNode && track.delayLevel && track.delayLevel > 0) {
        const delaySend = ctx.createGain();
        delaySend.gain.setValueAtTime(track.delayLevel * 0.6, ctx.currentTime);
        gain.connect(delaySend);
        delaySend.connect(this.delayNode);
      }

      // Compute scheduling
      if (trackOffset >= this.playheadOffsetAtStart) {
        // Track starts in the future relative to playhead
        const delayUntilStart = trackOffset - this.playheadOffsetAtStart;
        source.start(ctx.currentTime + delayUntilStart, 0);
      } else {
        // Track is already partially elapsed at current playhead
        const offsetIntoTrack = this.playheadOffsetAtStart - trackOffset;
        source.start(ctx.currentTime, offsetIntoTrack);
      }

      this.activeSources.set(track.trackId, {
        source,
        gain,
        panner,
        eqLow,
        eqMid,
        eqHigh,
      });
    });
  }

  /**
   * Dynamically adjust track volume in real time
   */
  public setTrackVolume(trackId: string, volume: number) {
    const node = this.activeSources.get(trackId);
    if (node && this.ctx) {
      node.gain.gain.setTargetAtTime(Math.max(0, volume), this.ctx.currentTime, 0.05);
    }
  }

  /**
   * Dynamically adjust track pan in real time
   */
  public setTrackPan(trackId: string, pan: number) {
    const node = this.activeSources.get(trackId);
    if (node && this.ctx) {
      node.panner.pan.setTargetAtTime(Math.max(-1, Math.min(1, pan)), this.ctx.currentTime, 0.05);
    }
  }

  /**
   * Dynamically adjust track EQ in real time
   */
  public setTrackEQ(trackId: string, low: number, mid: number, high: number) {
    const node = this.activeSources.get(trackId);
    if (node && this.ctx) {
      node.eqLow.gain.setTargetAtTime(low, this.ctx.currentTime, 0.05);
      node.eqMid.gain.setTargetAtTime(mid, this.ctx.currentTime, 0.05);
      node.eqHigh.gain.setTargetAtTime(high, this.ctx.currentTime, 0.05);
    }
  }

  /**
   * Set Master Volume
   */
  public setMasterVolume(vol: number) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(Math.max(0, vol), this.ctx.currentTime, 0.05);
    }
  }

  /**
   * Stops all active audio source nodes
   */
  public stop() {
    this.activeSources.forEach(({ source }) => {
      try {
        source.stop();
        source.disconnect();
      } catch {
        // already stopped
      }
    });
    this.activeSources.clear();
    this.isPlaying = false;
  }

  /**
   * Returns current playhead position in seconds
   */
  public getPlayhead(): number {
    if (!this.isPlaying || !this.ctx) {
      return this.playheadOffsetAtStart;
    }
    return this.playheadOffsetAtStart + (this.ctx.currentTime - this.playbackStartTime);
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  /**
   * Real Microphone Audio Recording with MediaRecorder
   */
  public async startRecording(currentPlayhead: number): Promise<void> {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      },
    });

    this.mediaStream = stream;
    this.recordedChunks = [];
    this.recordingStartPlayhead = currentPlayhead;

    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : 'audio/webm';

    this.mediaRecorder = new MediaRecorder(stream, { mimeType });

    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        this.recordedChunks.push(e.data);
      }
    };

    this.mediaRecorder.start(50);
  }

  public async stopRecording(): Promise<{ blob: Blob; startOffset: number }> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('MediaRecorder not initialized'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, { type: 'audio/webm' });
        if (this.mediaStream) {
          this.mediaStream.getTracks().forEach((track) => track.stop());
        }
        resolve({
          blob,
          startOffset: this.recordingStartPlayhead,
        });
      };

      this.mediaRecorder.stop();
    });
  }

  /**
   * Offline Audio Context Master Mixdown & WAV Export Engine
   * Renders the complete multitrack arrangement with all DSP effects to a stereo WAV file
   */
  public async exportMixdownWav(
    tracks: AudioTrack[],
    masterSettings?: MasterMixSettings
  ): Promise<Blob> {
    const sampleRate = 44100;

    // Calculate total song length
    let totalDuration = 5;
    tracks.forEach((t) => {
      const end = (t.startOffset || 0) + (t.duration || 0);
      if (end > totalDuration) totalDuration = end;
    });

    // Add 2 seconds for reverb tail
    const renderDuration = Math.ceil(totalDuration + 2.0);
    const offlineCtx = new OfflineAudioContext(2, sampleRate * renderDuration, sampleRate);

    // Offline Master Compressor
    const offlineCompressor = offlineCtx.createDynamicsCompressor();
    offlineCompressor.threshold.setValueAtTime(
      masterSettings?.compressorThreshold ?? -14,
      0
    );
    offlineCompressor.ratio.setValueAtTime(masterSettings?.compressorRatio ?? 4, 0);

    // Offline Master Gain
    const offlineMasterGain = offlineCtx.createGain();
    offlineMasterGain.gain.setValueAtTime(masterSettings?.masterVolume ?? 1.0, 0);

    // Offline Reverb Convolver
    const offlineReverb = offlineCtx.createConvolver();
    offlineReverb.buffer = this.createStudioImpulseResponse(offlineCtx, masterSettings?.reverbDecay || 1.8, 2.0);

    // Offline Delay
    const offlineDelay = offlineCtx.createDelay(2.0);
    offlineDelay.delayTime.setValueAtTime(0.35, 0);
    const offlineDelayFeedback = offlineCtx.createGain();
    offlineDelayFeedback.gain.setValueAtTime(0.35, 0);
    offlineDelay.connect(offlineDelayFeedback);
    offlineDelayFeedback.connect(offlineDelay);

    // Connect effects to compressor
    offlineDelay.connect(offlineCompressor);
    offlineReverb.connect(offlineCompressor);

    offlineCompressor.connect(offlineMasterGain);
    offlineMasterGain.connect(offlineCtx.destination);

    const hasSolo = tracks.some((t) => t.isSolo);

    // Route every track in offline context
    for (const track of tracks) {
      if (!track.audioBuffer) continue;
      if (track.isMuted) continue;
      if (hasSolo && !track.isSolo) continue;

      const source = offlineCtx.createBufferSource();
      source.buffer = track.audioBuffer;

      // EQ
      const eqLow = offlineCtx.createBiquadFilter();
      eqLow.type = 'lowshelf';
      eqLow.frequency.setValueAtTime(220, 0);
      eqLow.gain.setValueAtTime(track.eqLow || 0, 0);

      const eqMid = offlineCtx.createBiquadFilter();
      eqMid.type = 'peaking';
      eqMid.frequency.setValueAtTime(1200, 0);
      eqMid.gain.setValueAtTime(track.eqMid || 0, 0);

      const eqHigh = offlineCtx.createBiquadFilter();
      eqHigh.type = 'highshelf';
      eqHigh.frequency.setValueAtTime(4500, 0);
      eqHigh.gain.setValueAtTime(track.eqHigh || 0, 0);

      const panner = offlineCtx.createStereoPanner();
      panner.pan.setValueAtTime(track.pan || 0, 0);

      const gain = offlineCtx.createGain();
      gain.gain.setValueAtTime(track.volume ?? 1.0, 0);

      source.connect(eqLow);
      eqLow.connect(eqMid);
      eqMid.connect(eqHigh);
      eqHigh.connect(panner);
      panner.connect(gain);

      gain.connect(offlineCompressor);

      if (track.reverbLevel && track.reverbLevel > 0) {
        const send = offlineCtx.createGain();
        send.gain.setValueAtTime(track.reverbLevel * 0.7, 0);
        gain.connect(send);
        send.connect(offlineReverb);
      }

      if (track.delayLevel && track.delayLevel > 0) {
        const send = offlineCtx.createGain();
        send.gain.setValueAtTime(track.delayLevel * 0.6, 0);
        gain.connect(send);
        send.connect(offlineDelay);
      }

      source.start(track.startOffset || 0);
    }

    // Render offline
    const renderedBuffer = await offlineCtx.startRendering();

    // Encode to WAV Blob
    return this.bufferToWavBlob(renderedBuffer);
  }

  /**
   * Encodes an AudioBuffer into standard 16-bit PCM WAV (RIFF header)
   */
  private bufferToWavBlob(buffer: AudioBuffer): Blob {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;
    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;

    const dataLength = buffer.length * blockAlign;
    const bufferLength = 44 + dataLength;

    const arrayBuffer = new ArrayBuffer(bufferLength);
    const view = new DataView(arrayBuffer);

    // RIFF chunk descriptor
    this.writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataLength, true);
    this.writeString(view, 8, 'WAVE');

    // fmt sub-chunk
    this.writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
    view.setUint16(20, format, true); // AudioFormat
    view.setUint16(22, numChannels, true); // NumChannels
    view.setUint32(24, sampleRate, true); // SampleRate
    view.setUint32(28, sampleRate * blockAlign, true); // ByteRate
    view.setUint16(32, blockAlign, true); // BlockAlign
    view.setUint16(34, bitDepth, true); // BitsPerSample

    // data sub-chunk
    this.writeString(view, 36, 'data');
    view.setUint32(40, dataLength, true);

    // Interleave left and right channels
    const channels: Float32Array[] = [];
    for (let i = 0; i < numChannels; i++) {
      channels.push(buffer.getChannelData(i));
    }

    let offset = 44;
    for (let i = 0; i < buffer.length; i++) {
      for (let ch = 0; ch < numChannels; ch++) {
        let sample = channels[ch][i];
        // Clip
        sample = Math.max(-1, Math.min(1, sample));
        // Scale to 16-bit signed integer
        const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
        view.setInt16(offset, intSample, true);
        offset += 2;
      }
    }

    return new Blob([view], { type: 'audio/wav' });
  }

  private writeString(view: DataView, offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  /**
   * Metronome click sound
   */
  public playClick(highPitch = false) {
    const ctx = this.getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(highPitch ? 1200 : 800, ctx.currentTime);

    gain.gain.setValueAtTime(0.6, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.09);
  }
}

// Global Singleton AudioEngine
export const audioEngine = new AudioEngine();
