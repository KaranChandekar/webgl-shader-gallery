'use client';

import { useEffect, useRef, useState } from 'react';

export default function FpsCounter() {
  const [fps, setFps] = useState<number>(0);
  const [visible, setVisible] = useState(true);

  // RAF-based 1-second rolling average
  const frameTimesRef = useRef<number[]>([]);
  const lastTimeRef = useRef<number>(performance.now());
  const rafIdRef = useRef<number>(0);

  useEffect(() => {
    const tick = (now: number) => {
      const delta = now - lastTimeRef.current;
      lastTimeRef.current = now;

      frameTimesRef.current.push(delta);

      // Drop frames older than 1 second
      const cutoff = now - 1000;
      let i = 0;
      while (i < frameTimesRef.current.length) {
        // accumulate from the back; simpler: sum-based approach
        i++;
      }
      // Keep only the last second of frame deltas by tracking timestamps
      // Simpler approach: keep a rolling window by total elapsed
      const times = frameTimesRef.current;
      let total = 0;
      let count = 0;
      for (let j = times.length - 1; j >= 0; j--) {
        total += times[j];
        count++;
        if (total >= 1000) break;
      }
      // Trim array to avoid unbounded growth
      if (times.length > 120) {
        frameTimesRef.current = times.slice(-120);
      }

      setFps(Math.round((count / Math.min(total, 1000)) * 1000));

      rafIdRef.current = requestAnimationFrame(tick);
    };

    rafIdRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafIdRef.current);
  }, []);

  // Toggle visibility with F key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      // Ignore when typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'f' || e.key === 'F') {
        setVisible((v) => !v);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  if (!visible) return null;

  const color =
    fps >= 50 ? '#22c55e' :
    fps >= 30 ? '#eab308' :
    '#ef4444';

  return (
    <div
      aria-label={`FPS: ${fps}`}
      style={{
        position: 'fixed',
        top: '1rem',
        right: '1rem',
        zIndex: 100,
        fontFamily: 'monospace',
        fontSize: '0.7rem',
        letterSpacing: '0.08em',
        color,
        background: 'rgba(0,0,0,0.55)',
        padding: '0.25rem 0.5rem',
        borderRadius: '4px',
        border: `1px solid ${color}44`,
        userSelect: 'none',
        pointerEvents: 'none',
        minWidth: '4.5rem',
        textAlign: 'right',
      }}
    >
      {fps} <span style={{ color: '#ffffff55' }}>fps</span>
    </div>
  );
}
