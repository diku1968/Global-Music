import React, { useRef, useEffect } from 'react';

const INSTRUMENT_WAVEFORM_COLORS: Record<string, { stroke: string; fill: string }> = {
  Guitar: { stroke: '#f97316', fill: 'rgba(249, 115, 22, 0.35)' },
  Bass: { stroke: '#3b82f6', fill: 'rgba(59, 130, 246, 0.35)' },
  Drums: { stroke: '#ef4444', fill: 'rgba(239, 68, 68, 0.35)' },
  Keyboard: { stroke: '#10b981', fill: 'rgba(16, 185, 129, 0.35)' },
  Piano: { stroke: '#06b6d4', fill: 'rgba(6, 182, 212, 0.35)' },
  Vocals: { stroke: '#a855f7', fill: 'rgba(168, 85, 247, 0.35)' },
  Violin: { stroke: '#eab308', fill: 'rgba(234, 179, 8, 0.35)' },
  Other: { stroke: '#8b5cf6', fill: 'rgba(139, 92, 246, 0.35)' },
};

export const WaveformCanvas: React.FC<{
  peaks?: number[];
  duration: number;
  instrument: string;
  isMuted: boolean;
  width?: number;
  height?: number;
}> = ({ peaks = [], duration, instrument, isMuted, width = 600, height = 56 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    const colors =
      INSTRUMENT_WAVEFORM_COLORS[instrument] || INSTRUMENT_WAVEFORM_COLORS.Other;

    const strokeColor = isMuted ? '#52525b' : colors.stroke;
    const fillColor = isMuted ? 'rgba(82, 82, 91, 0.2)' : colors.fill;

    const centerY = height / 2;

    if (!peaks || peaks.length === 0) {
      // Empty / standby state line
      ctx.beginPath();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.moveTo(0, centerY);
      ctx.lineTo(width, centerY);
      ctx.stroke();
      ctx.setLineDash([]);
      return;
    }

    const barWidth = width / peaks.length;
    const padding = 1;

    for (let i = 0; i < peaks.length; i++) {
      const peak = peaks[i];
      const barHeight = Math.max(2, peak * (height * 0.85));
      const x = i * barWidth;
      const y = centerY - barHeight / 2;

      ctx.fillStyle = fillColor;
      ctx.fillRect(x + padding, y, barWidth - padding * 2, barHeight);

      ctx.fillStyle = strokeColor;
      ctx.fillRect(x + padding, y, barWidth - padding * 2, 1.5);
      ctx.fillRect(x + padding, y + barHeight - 1.5, barWidth - padding * 2, 1.5);
    }

    // Center baseline
    ctx.beginPath();
    ctx.strokeStyle = isMuted ? '#3f3f46' : 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();
  }, [peaks, duration, instrument, isMuted, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="w-full h-full block rounded-lg select-none pointer-events-none"
    />
  );
};
