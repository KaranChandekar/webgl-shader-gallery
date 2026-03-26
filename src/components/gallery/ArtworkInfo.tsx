'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ArtworkData } from '@/data/artworkConfig';

interface ArtworkInfoProps {
  artwork: ArtworkData | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ArtworkInfo({ artwork, isOpen, onClose }: ArtworkInfoProps) {
  // Close panel on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && artwork && (
        <>
          {/* Semi-transparent backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.55)',
              zIndex: 40,
              cursor: 'pointer',
            }}
            aria-hidden="true"
          />

          {/* Slide-in panel */}
          <motion.aside
            key="panel"
            role="dialog"
            aria-modal="true"
            aria-label={`Details for ${artwork.title}`}
            initial={{ x: '100%' }}
            animate={{ x: '0%' }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: 'min(480px, 92vw)',
              background: '#111111',
              borderLeft: '1px solid #2a2a2a',
              zIndex: 50,
              overflowY: 'auto',
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
            }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              aria-label="Close info panel"
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'transparent',
                border: '1px solid #333',
                borderRadius: '4px',
                color: '#aaa',
                cursor: 'pointer',
                fontSize: '1rem',
                lineHeight: 1,
                padding: '0.35rem 0.6rem',
                transition: 'color 0.15s, border-color 0.15s',
              }}
            >
              ✕
            </button>

            {/* Title */}
            <div>
              <p
                style={{
                  fontFamily: 'monospace',
                  fontSize: '0.65rem',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: artwork.accentColor,
                  marginBottom: '0.5rem',
                }}
              >
                Artwork
              </p>
              <h2
                style={{
                  fontFamily: 'monospace',
                  fontSize: '1.4rem',
                  fontWeight: 700,
                  color: '#f0f0f0',
                  margin: 0,
                  lineHeight: 1.2,
                }}
              >
                {artwork.title}
              </h2>
            </div>

            {/* Description */}
            <div>
              <h3
                style={{
                  fontFamily: 'monospace',
                  fontSize: '0.65rem',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: '#666',
                  marginBottom: '0.5rem',
                }}
              >
                About
              </h3>
              <p
                style={{
                  fontFamily: 'sans-serif',
                  fontSize: '0.9rem',
                  lineHeight: 1.7,
                  color: '#bbb',
                  margin: 0,
                }}
              >
                {artwork.description}
              </p>
            </div>

            {/* Technique */}
            <div>
              <h3
                style={{
                  fontFamily: 'monospace',
                  fontSize: '0.65rem',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: '#666',
                  marginBottom: '0.5rem',
                }}
              >
                Technique
              </h3>
              <p
                style={{
                  fontFamily: 'monospace',
                  fontSize: '0.82rem',
                  color: artwork.accentColor,
                  margin: 0,
                  padding: '0.5rem 0.75rem',
                  background: '#1a1a1a',
                  borderRadius: '4px',
                  borderLeft: `2px solid ${artwork.accentColor}`,
                }}
              >
                {artwork.technique}
              </p>
            </div>

            {/* Code snippet */}
            <div>
              <h3
                style={{
                  fontFamily: 'monospace',
                  fontSize: '0.65rem',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: '#666',
                  marginBottom: '0.5rem',
                }}
              >
                GLSL Snippet
              </h3>
              <pre
                style={{
                  margin: 0,
                  background: '#0a0a0a',
                  border: '1px solid #222',
                  borderRadius: '6px',
                  padding: '1rem',
                  overflowX: 'auto',
                }}
              >
                <code
                  style={{
                    fontFamily: '"JetBrains Mono", "Fira Code", "Cascadia Code", monospace',
                    fontSize: '0.75rem',
                    lineHeight: 1.65,
                    color: '#d4d4d4',
                    whiteSpace: 'pre',
                  }}
                >
                  {artwork.codeSnippet}
                </code>
              </pre>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
