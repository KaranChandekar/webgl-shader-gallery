# WebGL Shader Art Gallery - Claude Code Prompt

You are building an immersive virtual art gallery showcasing cutting-edge WebGL shader effects. This is a creative coding project that combines real-time 3D graphics with artistic design.

## Objectives

1. **Shader Artworks** (8 total, each full-viewport):
   - Liquid Distortion: Mouse-reactive fluid simulation
   - Ray Marching Spheres: Soft shadows and reflections
   - Fractal Explorer: Interactive Mandelbrot/Julia zoom
   - Noise Landscape: Procedural terrain scrolling
   - Plasma Wave: Sinusoidal interference patterns
   - Particle Flow Field: Curl noise particle animation
   - Voronoi Cells: Animated procedural cells
   - Gradient Orb: Rotating specular sphere

2. **Gallery Navigation**:
   - Vertical smooth scroll (one artwork per viewport height)
   - Mouse position reactive to all shaders
   - Click artwork to reveal info panel (right slide-in)
   - Fullscreen mode (Esc to exit)
   - Scroll indicator bar (right side)

3. **Interactive Features**:
   - Info panel: Title, description, shader technique explanation, code snippet
   - FPS counter (top-right, shows performance)
   - Dark theme gallery aesthetic
   - Smooth transitions between artworks
   - Mouse coordinates sent to all shaders as uniform

4. **Performance & Optimization**:
   - 60 FPS target on desktop, 30 FPS acceptable on mobile
   - Adaptive quality based on device
   - Lazy load shaders as user scrolls
   - LOD (Level of Detail) for complex shaders
   - Memory management: Dispose unused Three.js resources

## Technical Requirements

### Stack
- **Next.js 15** with TypeScript
- **Three.js** + React Three Fiber for WebGL rendering
- **GLSL** custom fragment shaders
- **GSAP + ScrollTrigger** for scroll-based animations
- **Framer Motion** for UI transitions
- **Tailwind CSS** with dark mode
- **Shiki** for code syntax highlighting

### Core Shader Features

**Uniforms Available to All Shaders**:
```glsl
uniform float uTime;           // Elapsed time (seconds)
uniform vec2 uMouse;           // Normalized mouse position
uniform vec2 uResolution;      // Canvas resolution
uniform float uMouseInfluence;  // Strength of mouse interaction
```

**Shader Implementations**:

1. **Liquid Distortion**:
   - Ashima simplex noise (MIT) for natural turbulence
   - Layered noise octaves (2-4 on mobile, 6-8 on desktop)
   - Mouse creates distortion vortex at cursor position
   - Color gradient: Blue → Cyan → Magenta based on distortion
   - Smooth animation via sin/cos wave modulation

2. **Ray Marching Spheres**:
   - Distance field ray marching (Sphere SDF: `length(p) - radius`)
   - Soft shadow marching: Secondary ray sample march
   - Specular lighting with Fresnel effect
   - Ambient occlusion: Count march iterations for shadow
   - Smooth blending: `smin()` function for multiple objects

3. **Fractal Explorer**:
   - Mandelbrot formula: `z = z*z + c` iterated per pixel
   - Smooth coloring: Escape-time iterations + escape distance for banding prevention
   - Mouse zoom: Click to zoom, smooth animation to new center
   - Max iterations: 100-256 (adjustable for performance)
   - Color palette: HSV space for smooth hue cycling

4. **Noise Landscape**:
   - Fractal Brownian motion (fBm): Multiple noise octaves combined
   - Height map: Noise value determines pixel Y-offset visually
   - Lighting: Normal vectors computed via finite differences
   - Parallax scrolling: Multiple layers at different heights
   - Water effect: Special coloring in valleys

5. **Plasma Wave**:
   - Multiple sin/cos waves at different frequencies and phases
   - Wave interference: `sin(freq1*x + time) + cos(freq2*y + time)`
   - HSV color mapping: Hue cycles with time, saturation and value from brightness
   - Simple math: Runs at 120 FPS easily
   - Hypnotic effect: Subtle frequency modulation over time

6. **Particle Flow Field**:
   - Curl noise: 3D derivative of Perlin noise (divergence-free field)
   - Particles follow flow: `pos += curlNoise(pos) * deltaTime`
   - Trail rendering: Fade opacity over particle age
   - Color by velocity: Blue → Cyan → White gradient
   - Mouse vortex: Temporary flow disturbance at cursor

7. **Voronoi Cells**:
   - Procedural cells: Distance to nearest seed point determines cell
   - Seed points: Hash-based pseudo-random from grid position
   - Outlines: `abs(distance_to_nearest - distance_to_second_nearest)`
   - Smooth animation: Seed points move via noise functions
   - Mouse interaction: Highlight cell under cursor

8. **Gradient Orb**:
   - 3D sphere: Ray march or mesh geometry with proper normals
   - Gradient coloring: UV-based color mapping (purple → blue → cyan)
   - Specular highlights: Follow light direction, Blinn-Phong model
   - Rim lighting: Brightening at grazing angles, adds cyan glow
   - Rotation: Spin animation driven by `uTime * rotationSpeed`

### Gallery Component Architecture

**GalleryScroll Component**:
- Single page vertical scroll container
- Manages scroll position and transitions
- Coordinates shader component loading/unloading
- Uses GSAP ScrollTrigger for scroll events

**Artwork Component**:
- Wraps each Three.js/React Three Fiber canvas
- Passes mouse position to shader uniforms
- Manages shader lifecycle (create on mount, dispose on unmount)
- Sends uTime via useFrame hook

**ArtworkInfo Panel**:
- Slides in from right on title click
- Content: Title, description, shader explanation, code snippet
- Close: Click background, swipe left, or X button
- Syntax highlighted code using Shiki

**FPS Counter**:
- Tracks frame times using requestAnimationFrame
- Displays current FPS and 1-second average
- Color-coded: Green (60), Yellow (30-59), Red (<30)
- Toggle visibility with Cmd+Shift+F

**ScrollIndicator**:
- Vertical bar on right side
- Draggable to jump to position
- Shows current artwork number/title

### Styling & Theme

**Dark Gallery Aesthetic**:
- Background: `#0d0d0d` (almost black)
- Text: `#ffffff` (pure white)
- Accents: Vary per artwork (cyan, magenta, lime)
- Info panel: Dark semi-transparent backdrop
- Smooth transitions: 300-500ms for all UI animations

**Responsive Design**:
- Desktop: Full resolution, 8 noise octaves, 256 iterations
- Tablet: Medium resolution (1280x720), 4 octaves, 128 iterations
- Mobile: Low resolution (1024x576), 2-3 octaves, 64-100 iterations

### Performance Targets

- **60 FPS on Desktop**: Most shaders achieve this consistently
- **30 FPS on Mobile**: Acceptable baseline with quality reduction
- **First Paint**: < 2s
- **Time to Interactive**: < 4s
- **Smooth scroll**: No jank, consistent frame rate

## File Organization

```
08-webgl-shader-gallery/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── gallery/
│   │   │   ├── GalleryScroll.tsx
│   │   │   ├── Artwork.tsx
│   │   │   ├── ArtworkInfo.tsx
│   │   │   ├── FpsCounter.tsx
│   │   │   └── ScrollIndicator.tsx
│   │   ├── shaders/
│   │   │   ├── LiquidDistortion.tsx
│   │   │   ├── RayMarchingSpheres.tsx
│   │   │   ├── FractalExplorer.tsx
│   │   │   ├── NoiseLandscape.tsx
│   │   │   ├── PlasmaWave.tsx
│   │   │   ├── ParticleFlow.tsx
│   │   │   ├── VoronoiCells.tsx
│   │   │   └── GradientOrb.tsx
│   │   └── layout/
│   │       └── PageLayout.tsx
│   ├── shaders/
│   │   ├── glsl/
│   │   │   ├── liquidDistortion.glsl
│   │   │   ├── rayMarching.glsl
│   │   │   ├── ... (6 more)
│   │   ├── lib/
│   │   │   ├── simplexNoise.glsl
│   │   │   └── common.glsl
│   │   └── utils.ts
│   ├── lib/
│   │   ├── hooks.ts (useMousePosition, useScroll)
│   │   └── utils.ts
│   └── data/
│       └── artworkConfig.ts
└── public/
    └── fonts/
```

## Development Priorities

### Phase 1: Setup & First Shader
1. Next.js + Three.js + React Three Fiber setup
2. Implement GalleryScroll component with smooth scroll
3. Create first shader (Liquid Distortion) with mouse tracking
4. Test 60 FPS performance

### Phase 2: Core Gallery Infrastructure
1. Implement Artwork wrapper component
2. Add ArtworkInfo panel with slide-in animation
3. Create FPS counter and scroll indicator
4. Add responsive quality scaling

### Phase 3: Remaining Shaders (6-7)
1. Ray Marching (most complex, implement second)
2. Fractal Explorer with zoom
3. Noise Landscape with parallax
4. Plasma Wave
5. Particle Flow
6. Voronoi Cells
7. Gradient Orb

### Phase 4: Polish & Optimization
1. Performance audit (Lighthouse, GPU profiling)
2. Mobile testing and optimization
3. Shader code display and syntax highlighting
4. Deploy to Vercel

## Key Implementation Patterns

### Mouse Position Hook
```typescript
export function useMousePosition() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouse({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return mouse;
}
```

### Shader Material Creation
```typescript
const material = new THREE.ShaderMaterial({
  fragmentShader,
  vertexShader,
  uniforms: {
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2() },
    uResolution: { value: new THREE.Vector2(width, height) },
  },
});

// Update in animation loop
useFrame(() => {
  material.uniforms.uTime.value += 0.016;
  material.uniforms.uMouse.value.copy(mousePos);
});
```

### Shader Code Snippet Display
```typescript
import { highlight } from 'shiki';

const highlighted = await highlight(shaderCode, {
  lang: 'glsl',
  theme: 'nord',
});
```

## Testing & Validation

- Test all shaders on Chrome, Firefox, Safari
- Profile GPU usage (DevTools GPU timeline)
- Test on actual mobile devices (iPhone, Android)
- Verify 60 FPS desktop, 30 FPS mobile
- Scroll smoothness testing (no jank)
- Cross-browser shader compilation

## Success Criteria

✓ 8 artworks with unique, visually striking shaders
✓ Smooth 60 FPS on desktop, 30 FPS on mobile
✓ Interactive mouse control for all shaders
✓ Info panel with shader technique explanation
✓ FPS counter showing real-time performance
✓ Fullscreen mode working correctly
✓ Mobile responsive with quality scaling
✓ Lighthouse score: 85+ on Performance
✓ Shaders load asynchronously (no blocking)
✓ Deployed and publicly accessible
