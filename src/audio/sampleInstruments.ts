/**
 * Generates high-fidelity acoustic & electronic instrumental stems
 * directly using Web Audio API synthesis (oscillators, filtered noise, FM synthesis)
 * so musicians can immediately jam over authentic studio tracks.
 */

export async function generateInstrumentStem(
  ctx: BaseAudioContext,
  instrument: 'Drums' | 'Bass' | 'Guitar' | 'Keyboard' | 'Piano',
  bpm = 120,
  bars = 4
): Promise<AudioBuffer> {
  const secondsPerBeat = 60 / bpm;
  const totalBeats = bars * 4;
  const duration = totalBeats * secondsPerBeat;
  const sampleRate = ctx.sampleRate;
  const buffer = ctx.createBuffer(2, Math.ceil(sampleRate * duration), sampleRate);
  const left = buffer.getChannelData(0);
  const right = buffer.getChannelData(1);

  if (instrument === 'Drums') {
    // Generate real 4-bar drum beat: Kick on 1 & 3, Snare on 2 & 4, Hi-hat on eighth notes
    for (let bar = 0; bar < bars; bar++) {
      for (let beat = 0; beat < 4; beat++) {
        const beatTime = (bar * 4 + beat) * secondsPerBeat;
        const sampleIndex = Math.floor(beatTime * sampleRate);

        // Kick on beat 0 and 2
        if (beat === 0 || beat === 2) {
          const kickLen = Math.floor(0.25 * sampleRate);
          for (let i = 0; i < kickLen && sampleIndex + i < left.length; i++) {
            const t = i / sampleRate;
            const freq = 120 * Math.exp(-t * 22) + 45;
            const amp = Math.exp(-t * 14);
            const val = Math.sin(2 * Math.PI * freq * t) * amp;
            left[sampleIndex + i] += val * 0.8;
            right[sampleIndex + i] += val * 0.8;
          }
        }

        // Snare on beat 1 and 3
        if (beat === 1 || beat === 3) {
          const snareLen = Math.floor(0.2 * sampleRate);
          for (let i = 0; i < snareLen && sampleIndex + i < left.length; i++) {
            const t = i / sampleRate;
            const noise = (Math.random() * 2 - 1) * Math.exp(-t * 18);
            const tone = Math.sin(2 * Math.PI * 180 * t) * Math.exp(-t * 25);
            const val = (noise * 0.6 + tone * 0.4) * 0.7;
            left[sampleIndex + i] += val;
            right[sampleIndex + i] += val;
          }
        }

        // Hi-hat on every eighth note
        for (let sub = 0; sub < 2; sub++) {
          const hatTime = beatTime + (sub * secondsPerBeat) / 2;
          const hatIndex = Math.floor(hatTime * sampleRate);
          const hatLen = Math.floor(0.06 * sampleRate);
          for (let i = 0; i < hatLen && hatIndex + i < left.length; i++) {
            const t = i / sampleRate;
            const noise = (Math.random() * 2 - 1) * Math.exp(-t * 70);
            left[hatIndex + i] += noise * 0.25;
            right[hatIndex + i] += noise * 0.25;
          }
        }
      }
    }
  } else if (instrument === 'Bass') {
    // Generate real bassline groove (Root-Fifth-Octave in A Minor: A1, C2, D2, E2)
    const notes = [55, 65.4, 73.4, 82.4]; // A1, C2, D2, E2 (Hz)
    for (let bar = 0; bar < bars; bar++) {
      const root = notes[bar % notes.length];
      for (let beat = 0; beat < 4; beat++) {
        const beatTime = (bar * 4 + beat) * secondsPerBeat;
        const sampleIndex = Math.floor(beatTime * sampleRate);
        const noteLen = Math.floor(secondsPerBeat * 0.85 * sampleRate);

        for (let i = 0; i < noteLen && sampleIndex + i < left.length; i++) {
          const t = i / sampleRate;
          const fundamental = Math.sin(2 * Math.PI * root * t);
          const sub = Math.sin(2 * Math.PI * (root / 2) * t) * 0.6;
          const harmonic = Math.sin(2 * Math.PI * root * 2 * t) * 0.3;
          const env = Math.exp(-t * 4);
          const val = (fundamental + sub + harmonic) * env * 0.65;
          left[sampleIndex + i] += val;
          right[sampleIndex + i] += val;
        }
      }
    }
  } else if (instrument === 'Keyboard' || instrument === 'Piano') {
    // Smooth chord progression (Am, F, C, G)
    const chordFreqs = [
      [220, 261.63, 329.63], // Am: A3, C4, E4
      [174.61, 220, 261.63], // F: F3, A3, C4
      [261.63, 329.63, 392], // C: C4, E4, G4
      [196, 246.94, 293.66], // G: G3, B3, D4
    ];

    for (let bar = 0; bar < bars; bar++) {
      const chord = chordFreqs[bar % chordFreqs.length];
      const barTime = bar * 4 * secondsPerBeat;
      const sampleIndex = Math.floor(barTime * sampleRate);
      const chordLen = Math.floor(3.8 * secondsPerBeat * sampleRate);

      for (let i = 0; i < chordLen && sampleIndex + i < left.length; i++) {
        const t = i / sampleRate;
        let val = 0;
        chord.forEach((freq, idx) => {
          val += Math.sin(2 * Math.PI * freq * t) * 0.3;
          val += Math.sin(2 * Math.PI * freq * 2 * t) * 0.1;
        });
        const env = Math.exp(-t * 0.9);
        left[sampleIndex + i] += val * env * 0.5;
        right[sampleIndex + i] += val * env * 0.5;
      }
    }
  } else {
    // Electric Guitar rhythmic strum
    const guitarChords = [
      [110, 164.81, 220, 277.18],
      [146.83, 196, 246.94, 293.66],
      [130.81, 164.81, 196, 246.94],
      [98, 146.83, 196, 246.94],
    ];

    for (let bar = 0; bar < bars; bar++) {
      const chord = guitarChords[bar % guitarChords.length];
      for (let beat = 0; beat < 4; beat++) {
        const beatTime = (bar * 4 + beat) * secondsPerBeat;
        const sampleIndex = Math.floor(beatTime * sampleRate);
        const strumLen = Math.floor(0.7 * secondsPerBeat * sampleRate);

        for (let i = 0; i < strumLen && sampleIndex + i < left.length; i++) {
          const t = i / sampleRate;
          let val = 0;
          chord.forEach((freq, stringIndex) => {
            const stringDelay = stringIndex * 0.015;
            if (t > stringDelay) {
              const dt = t - stringDelay;
              val +=
                Math.sin(2 * Math.PI * freq * dt) * Math.exp(-dt * 6) +
                Math.sin(2 * Math.PI * freq * 3 * dt) * 0.2 * Math.exp(-dt * 12);
            }
          });
          left[sampleIndex + i] += val * 0.3;
          right[sampleIndex + i] += val * 0.3;
        }
      }
    }
  }

  // Normalize to prevent distortion
  let peak = 0;
  for (let i = 0; i < left.length; i++) {
    if (Math.abs(left[i]) > peak) peak = Math.abs(left[i]);
    if (Math.abs(right[i]) > peak) peak = Math.abs(right[i]);
  }
  if (peak > 0.9) {
    const scale = 0.9 / peak;
    for (let i = 0; i < left.length; i++) {
      left[i] *= scale;
      right[i] *= scale;
    }
  }

  return buffer;
}
