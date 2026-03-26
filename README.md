# Shader Gallery — WebGL Art Collection

An immersive virtual art gallery showcasing 8 real-time WebGL shader effects with interactive mouse controls, smooth scroll-snap navigation, and detailed technical breakdowns.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![Three.js](https://img.shields.io/badge/Three.js-WebGL-049EF4?logo=three.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss)

## Artworks

| # | Shader | Technique | Accent |
|---|--------|-----------|--------|
| 1 | **Liquid Distortion** | Domain-warped fBm noise with mouse vortex | Cyan |
| 2 | **Ray Marching Spheres** | SDF ray marching, soft shadows, Fresnel rim | Purple |
| 3 | **Fractal Explorer** | Mandelbrot set with smooth escape-time coloring | Orange |
| 4 | **Noise Landscape** | fBm terrain, finite-difference normals, water | Green |
| 5 | **Plasma Wave** | Multi-wave sinusoidal interference, HSV cycling | Pink |
| 6 | **Particle Flow Field** | Curl noise advection, streamline visualization | Blue |
| 7 | **Voronoi Cells** | Animated seed points, edge glow, cell highlighting | Lime |
| 8 | **Gradient Orb** | Analytic ray-sphere, Blinn-Phong, Fresnel rim | Violet |

## Features

- **Single-canvas architecture** — One WebGL context, shader-swapping on scroll for optimal GPU performance
- **Mouse-reactive shaders** — All artworks respond to cursor position via `uMouse` uniform
- **Scroll-snap navigation** — Smooth vertical scrolling with one artwork per viewport
- **Info panel** — Slide-in panel with technique explanation and GLSL code snippets
- **FPS counter** — Real-time performance monitor (toggle with `F` key)
- **Scroll indicator** — Visual progress bar with section dots
- **Dark gallery aesthetic** — `#0d0d0d` background, monospace typography, accent glow effects

## Tech Stack

- **Next.js 16** with TypeScript and Turbopack
- **Three.js** (raw WebGL — no React Three Fiber) for single-context rendering
- **GLSL** custom fragment shaders with shared uniforms
- **Framer Motion** for UI panel animations
- **Tailwind CSS** for styling

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the gallery.

## Architecture

```
src/
├── shaders/
│   ├── sources.ts          # All 8 fragment shaders as strings
│   ├── glsl/               # Standalone .glsl files (reference)
│   └── lib/                # Shared GLSL utilities (noise, common)
├── components/
│   ├── gallery/
│   │   ├── ShaderCanvas.tsx # Single Three.js canvas + rAF loop
│   │   ├── GalleryScroll.tsx# Scroll container + section management
│   │   ├── ArtworkInfo.tsx  # Slide-in info panel
│   │   └── FpsCounter.tsx   # Performance monitor
│   └── ui/
│       └── ScrollIndicator.tsx
└── data/
    └── artworkConfig.ts     # Artwork metadata and descriptions
```

## Performance

The single-canvas approach ensures only **one shader runs at any time**:
- Materials are created lazily and cached for reuse
- `requestAnimationFrame` loop with `performance.now()` (no `THREE.Clock`)
- `dpr: 1`, no antialiasing for maximum frame rate
- Shaders optimized with reduced loop iterations for smooth 60fps

## License

MIT
