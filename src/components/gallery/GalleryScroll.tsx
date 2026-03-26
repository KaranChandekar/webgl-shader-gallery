'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import ShaderCanvas from './ShaderCanvas';
import ArtworkInfo from './ArtworkInfo';
import ScrollIndicator from '../ui/ScrollIndicator';
import { artworks } from '@/data/artworkConfig';
import type { ArtworkData } from '@/data/artworkConfig';

export default function GalleryScroll() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });
  const [infoArtwork, setInfoArtwork] = useState<ArtworkData | null>(null);
  const [infoPanelOpen, setInfoPanelOpen] = useState(false);

  const handleInfoClick = useCallback((artwork: ArtworkData) => {
    setInfoArtwork(artwork);
    setInfoPanelOpen(true);
  }, []);

  const handleInfoClose = useCallback(() => {
    setInfoPanelOpen(false);
  }, []);

  // Track scroll position
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleScroll = () => {
      const scrollTop = el.scrollTop;
      const sectionHeight = el.clientHeight;
      const index = Math.round(scrollTop / sectionHeight);
      setActiveIndex(Math.min(Math.max(0, index), artworks.length - 1));
    };

    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  // Track mouse
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setMouse({
      x: e.clientX / window.innerWidth,
      y: 1 - e.clientY / window.innerHeight,
    });
  }, []);

  return (
    <div onMouseMove={handleMouseMove}>
      {/* Single WebGL canvas — renders only the active shader */}
      <ShaderCanvas activeIndex={activeIndex} mouse={mouse} />

      {/* Scroll sections — transparent overlays for snap + titles */}
      <div
        ref={scrollRef}
        style={{
          position: 'relative',
          zIndex: 1,
          overflowY: 'auto',
          height: '100vh',
          scrollSnapType: 'y mandatory',
        }}
      >
        {artworks.map((artwork, index) => (
          <section
            key={artwork.id}
            style={{
              height: '100vh',
              scrollSnapAlign: 'start',
              position: 'relative',
              // Transparent — the canvas behind shows through
            }}
          >
            <button
              onClick={() => handleInfoClick(artwork)}
              style={{
                position: 'absolute',
                bottom: '2rem',
                left: '2rem',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                textAlign: 'left',
                zIndex: 10,
                opacity: index === activeIndex ? 1 : 0,
                transition: 'opacity 0.4s ease',
                pointerEvents: index === activeIndex ? 'auto' : 'none',
              }}
              aria-label={`More info about ${artwork.title}`}
            >
              <span
                style={{
                  fontFamily: 'monospace',
                  fontSize: '0.85rem',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: artwork.accentColor,
                  textShadow: `0 0 12px ${artwork.accentColor}88`,
                }}
              >
                {artwork.title}
              </span>
              <span
                style={{
                  display: 'block',
                  marginTop: '0.25rem',
                  fontFamily: 'monospace',
                  fontSize: '0.65rem',
                  letterSpacing: '0.08em',
                  color: '#ffffff66',
                }}
              >
                click for details →
              </span>
            </button>
          </section>
        ))}
      </div>

      <ScrollIndicator
        currentIndex={activeIndex}
        total={artworks.length}
        accentColor={artworks[activeIndex]?.accentColor ?? '#06b6d4'}
      />

      <ArtworkInfo
        artwork={infoArtwork}
        isOpen={infoPanelOpen}
        onClose={handleInfoClose}
      />
    </div>
  );
}
