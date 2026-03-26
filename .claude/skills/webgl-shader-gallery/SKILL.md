---
name: webgl-shader-gallery
description: Build a virtual art gallery showcasing real-time WebGL shader effects — liquid distortions, ray marching, fractals, noise landscapes — navigable through smooth scroll with mouse-reactive interactions. Use this skill when building creative coding showcases, shader art galleries, WebGL experiments, or generative art websites. Trigger when the user mentions shader gallery, WebGL art, GLSL shaders, generative art gallery, creative coding showcase, ray marching, noise shader, or fragment shader art.
---

# WebGL Shader Art Gallery

## Overview
Create an immersive virtual art gallery featuring real-time WebGL shader effects. Each artwork is a full-viewport GLSL fragment shader with interactive mouse controls, smooth scroll transitions, and detailed technical breakdowns. This skill builds creative coding showcases that demonstrate advanced shader techniques.

## Technology Stack
- **Framework**: Next.js 15 with TypeScript
- **3D Graphics**: Three.js with React Three Fiber (@react-three/fiber)
- **Shaders**: GLSL (fragment shaders with custom uniforms)
- **Animations**: GSAP with ScrollTrigger, Framer Motion
- **Styling**: Tailwind CSS with CSS custom properties
- **Audio** (optional): Tone.js for reactive sound
- **Fonts**: Space Mono (Google Fonts), Inter
- **Build Tools**: Turbopack, SWC

## Project Structure
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
│   │   │   ├── FullscreenButton.tsx
│   │   │   └── FpsCounter.tsx
│   │   ├── shaders/
│   │   │   ├── LiquidDistortion.tsx
│   │   │   ├── RayMarchingSpheres.tsx
│   │   │   ├── FractalExplorer.tsx
│   │   │   ├── NoiseLandscape.tsx
│   │   │   ├── PlasmaWave.tsx
│   │   │   ├── ParticleFlow.tsx
│   │   │   ├── VoronoiCells.tsx
│   │   │   └── GradientOrb.tsx
│   │   ├── ui/
│   │   │   ├── ScrollIndicator.tsx
│   │   │   ├── ArtworkTitle.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   └── layout/
│   │       └── PageLayout.tsx
│   ├── shaders/
│   │   ├── glsl/
│   │   │   ├── liquidDistortion.glsl
│   │   │   ├── rayMarching.glsl
│   │   │   ├── fractal.glsl
│   │   │   ├── noiseLandscape.glsl
│   │   │   ├── plasmaWave.glsl
│   │   │   ├── particleFlow.glsl
│   │   │   ├── voronoiCells.glsl
│   │   │   └── gradientOrb.glsl
│   │   ├── lib/
│   │   │   ├── simplexNoise.glsl
│   │   │   ├── common.glsl (utility functions)
│   │   │   └── constants.glsl
│   │   └── utils.ts (shader compilation, uniforms)
│   ├── lib/
│   │   ├── animations.ts
│   │   ├── hooks.ts
│   │   └── utils.ts
│   ├── data/
│   │   └── artworkConfig.ts (metadata, descriptions)
│   └── styles/
│       ├── globals.css
│       └── theme.css
├── public/
│   └── fonts/ (Space Mono, Inter)
├── tailwind.config.ts
├── next.config.ts
└── tsconfig.json
```

## Shader Artwork Specifications

### 1. Liquid Distortion
**Technique**: Noise-based fluid simulation with mouse reactivity

**Key Features**:
- Multiple octaves of Perlin noise for turbulence
- Mouse position controls distortion center and magnitude
- Sinusoidal waves layered for organic flow
- Color gradient based on distortion intensity
- Real-time responsiveness (60 FPS)

**GLSL Uniforms**:
```glsl
uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform float uMouseInfluence;
uniform float uDistortionAmount;
uniform float uSpeed;
```

**Color Palette**:
- Base: Deep blue (#0f172a)
- Gradient: Cyan → Magenta → Yellow transitions
- Influence: Mouse position creates warm glow

**Technique Explanation**:
Uses Ashima simplex noise functions layered at different scales (octaves) to create smooth, natural-looking distortion. The mouse uniform creates a radial distortion field that follows the cursor. Color is mapped based on the noise value, creating a smooth gradient effect.

**Performance**: Optimized for 60 FPS on modern GPUs; uses single pass fragment shader

---

### 2. Ray Marching Spheres
**Technique**: Distance field ray marching with soft shadows and reflections

**Key Features**:
- Multiple sphere objects with distance field blending
- Soft shadow calculation via shadow marching
- Specular reflection with Fresnel effect
- Ambient occlusion approximation
- Interactive camera orbit around scene

**GLSL Uniforms**:
```glsl
uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uCameraPos;
uniform vec3 uLightPos;
uniform float uAmbientOcclusion;
uniform float uShadowSoftness;
```

**Color Palette**:
- Metallic: Silver (#e0e0e0) with specular highlights
- Shadows: Deep purple (#2d1b4e)
- Rim light: Cyan accent
- Background: Dark navy gradient

**Distance Functions**:
- Sphere: `length(p) - radius`
- Smooth blend: `smin(d1, d2, smoothing)`
- Scene union: Combine multiple object distances

**Technique Explanation**:
Ray marching iteratively steps a ray from the camera through 3D space. At each step, the distance to the nearest surface is calculated using signed distance functions (SDF). Shadows are computed via shadow marching (secondary ray sampling). Reflections use environment mapping or recursive ray casting.

**Performance**: Lower resolution on mobile (1024x576); LOD reduces marching steps at distance

---

### 3. Fractal Explorer
**Technique**: Mandelbrot or Julia set real-time exploration with zoom

**Key Features**:
- Smooth iteration count coloring (escape-time algorithm)
- Mouse position selects Julia set parameters or zoom center
- Zoom animation on click (smooth animation property)
- Escape-time iterations with smooth escape estimation
- Color palette cycling

**GLSL Uniforms**:
```glsl
uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uCenter;
uniform float uZoom;
uniform vec2 uJuliaParameter;
uniform int uMaxIterations;
uniform float uColorCycle;
```

**Color Mapping**:
- Linear gradient through HSV color space
- Color palette: Fire (red → yellow → white) or Cool (blue → cyan → white)
- Smooth coloring: `smoothstep()` for banding prevention

**Mandelbrot Formula**:
```glsl
z = z*z + c  // z: complex number, c: pixel coordinate
```

**Technique Explanation**:
Each pixel represents a complex number. The function z → z² + c is iterated, and the number of iterations before escaping (|z| > 2) determines the pixel color. Smooth coloring uses the escape distance to interpolate between colors. Interactive zoom centers on mouse click.

**Performance**: Single-pass shader; iteration count adjustable for performance (100-256 iterations)

---

### 4. Noise Landscape
**Technique**: Generative terrain using Perlin/simplex noise with parallax scrolling

**Key Features**:
- Multiple noise octaves (fractal Brownian motion)
- Procedural landscape height map
- Lighting based on slope (normal vectors)
- Parallax scrolling (layers at different depths)
- Smooth animation of uTime for continuous scrolling
- Watercolor effect in valleys

**GLSL Uniforms**:
```glsl
uniform float uTime;
uniform vec2 uResolution;
uniform float uScale;
uniform int uOctaves;
uniform float uLacunarity;  // frequency multiplier
uniform float uPersistence; // amplitude multiplier
uniform vec3 uLightDir;
```

**Color Palette**:
- Sky: Blue gradient (top to bottom)
- Terrain: Green → Brown → Gray (height-based)
- Water: Cyan with shimmer
- Shadows: Deep purple

**Normal Calculation**:
```glsl
vec3 getNormal(vec2 p) {
  vec3 n1 = vec3(noise(p + vec2(eps, 0)), 0, -eps);
  vec3 n2 = vec3(0, noise(p + vec2(0, eps)), -eps);
  return normalize(cross(n1, n2));
}
```

**Technique Explanation**:
Uses fractal Brownian motion (fBm) to combine multiple noise frequencies, creating natural-looking terrain with detail at all scales. Normals are calculated via finite differences to create lighting. Parallax scrolling simulates depth by rendering multiple layers at different Y-offsets.

**Performance**: 2-4 octaves on mobile; more on desktop (8 octaves possible)

---

### 5. Plasma Wave
**Technique**: Sinusoidal wave interference patterns with color cycling

**Key Features**:
- Multiple sine/cosine waves at different frequencies
- Wave interference creates moving patterns
- HSV color space for smooth hue cycling
- Time-dependent phase shifts
- Adjustable amplitude and frequency
- Hypnotic, almost organic movement

**GLSL Uniforms**:
```glsl
uniform float uTime;
uniform vec2 uResolution;
uniform float uAmplitude1;
uniform float uFrequency1;
uniform float uAmplitude2;
uniform float uFrequency2;
uniform float uSpeed;
```

**Mathematical Foundation**:
```glsl
float wave = sin(uv.x * freq1 + uTime * speed) +
             cos(uv.y * freq2 + uTime * speed * 0.7);
float brightness = 0.5 + 0.5 * sin(wave);
vec3 color = hsv2rgb(vec3(brightness + uTime * 0.1, 1.0, brightness));
```

**Color Palette**:
- Hue range: Full spectrum (0° to 360° HSV hue)
- Saturation: Full (1.0)
- Value: Brightness modulated by wave
- Result: Vibrant, rainbow interference pattern

**Technique Explanation**:
Multiple sine waves are layered, creating interference patterns where peaks and troughs interact. The result is converted to HSV color space where hue cycling is simple (add uTime to H). This creates a continuously shifting, mesmerizing color pattern.

**Performance**: Simple math operations; runs at 120 FPS easily

---

### 6. Particle Flow Field
**Technique**: Curl noise-driven particle paths with flow visualization

**Key Features**:
- Curl noise (derivative of Perlin noise) creates divergence-free flow
- Particles follow 3D vector field
- Particle trails with fading (temporal coherence)
- Color based on velocity magnitude
- Interactive mouse influence (creates vortex)
- Optional particle collision handling

**GLSL Uniforms** (multiple render passes):
```glsl
// Compute shader or multi-pass simulation
uniform float uTime;
uniform vec2 uMouse;
uniform float uMouseInfluence;
uniform vec3 uNoiseScale;
uniform float uSpeed;
```

**Particle Rendering**:
- Draw as small circles (billboards)
- Opacity fade based on age (linear or exponential)
- Color gradient: Blue → Cyan → White (velocity-based)

**Curl Noise Calculation**:
```glsl
vec3 curlNoise(vec3 p) {
  float eps = 0.0001;
  float n1_y = perlin(p + vec3(0, eps, 0));
  float n1_z = perlin(p + vec3(0, 0, eps));
  // ... compute partial derivatives
  return curl;
}
```

**Technique Explanation**:
Curl noise (2D vector field derived from 3D noise) ensures particles flow along divergence-free paths (no accumulation). Particles are updated via Euler integration: `pos += curlNoise(pos) * dt`. Trails fade over time, creating a motion-blur effect. Mouse position adds a temporary vortex field.

**Performance**: Can simulate 10K+ particles on GPU; multiple render passes

---

### 7. Voronoi Cells
**Technique**: Animated Voronoi diagram with distance coloring and cell outlines

**Key Features**:
- Procedural Voronoi cell generation from noise-based seed points
- Distance to nearest cell boundary creates outlines
- Cell color based on seed point hash
- Smooth animation of seed points over time
- Interactive cell coloring (mouse hover highlights cell)
- Depth sorting for 3D effect

**GLSL Uniforms**:
```glsl
uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;
uniform float uScale;
uniform float uLineWidth;
uniform vec3 uLineColor;
```

**Voronoi Calculation**:
```glsl
vec3 voronoi(vec2 uv) {
  vec2 gridId = floor(uv);
  float minDist = 1e10;
  vec2 closestSeed;

  for(int x = -1; x <= 1; x++) {
    for(int y = -1; y <= 1; y++) {
      vec2 neighbor = gridId + vec2(x, y);
      vec2 seed = fract(sin(neighbor * 127.1) * 43758.5453);
      float dist = distance(uv, neighbor + seed);
      if(dist < minDist) {
        minDist = dist;
        closestSeed = seed;
      }
    }
  }

  return vec3(closestSeed, minDist);
}
```

**Color Palette**:
- Cell fills: Pastel colors from seed hash (HSV with low saturation)
- Outlines: Dark gray or white depending on distance
- Mouse hover: Highlight cell with bright accent

**Technique Explanation**:
Voronoi cells are computed by comparing distance to all nearby seed points. The nearest seed determines the cell color. Distance to cell boundary (second-nearest minus nearest) creates outlines. Seed points animate via noise functions, creating flowing cell deformations.

**Performance**: Single-pass shader; distance calculations are O(n²) for n seeds (use limited neighborhood search)

---

### 8. Gradient Orb
**Technique**: Rotating gradient sphere with rim lighting and specular highlights

**Key Features**:
- 3D sphere with animated normal mapping
- Smooth gradient across surface (u/v mapping)
- Specular highlights following light direction
- Rim lighting effect (grazing angle brightening)
- Rotating animation (uTime dependent)
- Smooth reflection/refraction hints

**GLSL Uniforms**:
```glsl
uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uLightDir;
uniform float uShininess;
uniform float uRimPower;
uniform float uRotationSpeed;
```

**Sphere Rendering**:
- Generate sphere geometry in vertex shader or use SDF ray marching
- Map UV coordinates to gradient colors
- Calculate lighting in fragment shader

**Normal Mapping**:
```glsl
vec3 normal = normalize(vertexNormal);
normal.xz = rotate(normal.xz, uTime * uRotationSpeed);
```

**Rim Lighting Calculation**:
```glsl
vec3 viewDir = normalize(cameraPos - vertexPos);
float rimLight = pow(1.0 - abs(dot(viewDir, normal)), uRimPower);
color += rimLight * rimColor;
```

**Color Palette**:
- Primary gradient: Purple → Blue → Cyan (HSV hue shift)
- Specular: White with bloom
- Rim: Bright cyan/magenta
- Environment: Dark background for contrast

**Technique Explanation**:
A sphere is rendered with smooth UV-based coloring. Normals are rotated over time for animation. Rim lighting brightens edges where the surface is nearly perpendicular to the view, creating a glowing halo effect. Specular highlights follow the light position.

**Performance**: Single-pass sphere rendering; ~60 FPS on all devices

---

## Gallery Navigation & Interaction

### Scroll Behavior
- **Vertical scroll**: Each artwork is one full viewport height
- **Smooth scroll**: GSAP ScrollSmoother or Lenis for buttery-smooth scrolling
- **Scroll trigger**: GSAP ScrollTrigger for section-based animations
- **Momentum**: Inertial scrolling on mobile

### Mouse Interactions
- **Mouse position uniform**: All shaders receive `uniform vec2 uMouse` (normalized -1 to 1 or 0 to 1)
- **Mouse tracking**: `useMousePosition()` hook sends position to Three.js uniforms
- **Reactive distortion**: Most shaders react to cursor proximity
- **Click feedback**: Optional ripple or color shift on click

### Info Panel
- **Side panel**: Slides in from right on artwork title click
- **Content**:
  - Title and artist (you)
  - Description of artwork and concept
  - Technical explanation (shader technique used)
  - GLSL code snippet with syntax highlighting
  - Color palette preview
- **Animation**: Framer Motion slide + fade, Z-index management
- **Close**: Click background, swipe, or X button

### Fullscreen Mode
- **Expand button**: Icon in top-right corner
- **Behavior**: Artwork fills entire screen, removes UI chrome
- **Exit**: Esc key or click button again
- **Animation**: Smooth scale/fade transition

### FPS Counter
- **Position**: Top-right corner (small, unobtrusive)
- **Display**: Current FPS, average over 1 second
- **Color**: Green (60 FPS), yellow (30-59 FPS), red (< 30 FPS)
- **Toggle**: Keyboard shortcut (Cmd+Shift+F) to show/hide
- **Implementation**: requestAnimationFrame loop with timestamp tracking

### Scroll Indicator
- **Position**: Right side, center
- **Style**: Vertical bar showing scroll position
- **Interaction**: Draggable to scroll to position
- **Labels**: Artwork number and title

## Performance Optimization

### Mobile Considerations
- **Resolution scaling**: Render at 1024x576 on mobile (upscale with bicubic filtering)
- **Iteration count**: Reduce fractal iterations by 50% on mobile
- **Octave count**: Use 2-3 octaves of noise instead of 8
- **Particle count**: Reduce particle flow field to 5K particles
- **Shader precision**: Use `lowp` and `mediump` where possible

### Desktop Optimization
- **Adaptive quality**: Detect GPU capability, adjust quality
- **VSYNC**: Enable frame rate limiting to 60 FPS
- **Memory**: Use texture pooling for multi-pass shaders
- **Compilation**: Precompile shaders at build time

### Code-Splitting
- Lazy load shader components as user scrolls near them
- Pre-load next 2 shaders in viewport
- Dispose Three.js resources on scroll away

## Shader Code Organization

### Common Utilities (shared GLSL library)
```glsl
// lib/common.glsl
#define PI 3.14159265359
#define TWO_PI 6.28318530718

// Coordinate transformation
vec2 normalize_uv(vec2 uv) {
  return (uv - 0.5) * 2.0;
}

// Color conversion
vec3 hsv2rgb(vec3 c) {
  vec3 rgb = clamp(abs(mod(c.x*6.0+vec3(0.,4.,2.),6.)-3.)-1., 0., 1.);
  return c.z * mix(vec3(1.), rgb, c.y);
}

// Noise functions (Ashima simplex)
#include ../lib/simplexNoise.glsl
```

### Per-Shader Files (in shaders/glsl/)
```glsl
// liquidDistortion.glsl
#include ../lib/common.glsl

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = fragCoord / uResolution.xy;
  // ... implementation
  fragColor = vec4(color, 1.0);
}
```

## Shader Compilation & Uniforms

### Utility Function
```typescript
// lib/shaders.ts
export function createShaderMaterial(
  fragmentShader: string,
  uniforms: Record<string, THREE.IUniform>,
  vertexShader?: string
) {
  return new THREE.ShaderMaterial({
    fragmentShader,
    vertexShader: vertexShader || THREE.ShaderLib.basic.vertexShader,
    uniforms: {
      ...THREE.UniformsLib.common,
      ...uniforms,
    },
  });
}
```

### Uniform Updates on Scroll/Mouse
```typescript
useFrame(() => {
  if (shaderRef.current) {
    shaderRef.current.material.uniforms.uTime.value += 0.016;
    shaderRef.current.material.uniforms.uMouse.value.set(
      mousePos.x / window.innerWidth,
      mousePos.y / window.innerHeight
    );
  }
});
```

## Accessibility Considerations

- **Prefers-reduced-motion**: Disable animations if user preference set
- **Performance mode**: Option to reduce shader complexity for low-end devices
- **Description**: Text description of each artwork available
- **Keyboard navigation**: Arrow keys to scroll, Esc to close info panel
- **Focus management**: Info panel receives focus when opened

## Color Palettes Per Artwork

1. **Liquid Distortion**: Cyan, Magenta, Yellow, Deep Blue
2. **Ray Marching**: Silver, Purple, Cyan, Dark Navy
3. **Fractal**: Fire (Red, Yellow, White) or Cool (Blue, Cyan, White)
4. **Landscape**: Sky Blue, Green, Brown, Purple, Cyan
5. **Plasma**: Rainbow (HSV full spectrum)
6. **Particle Flow**: Blue, Cyan, White gradient
7. **Voronoi**: Pastels (various hues, low saturation)
8. **Gradient Orb**: Purple, Blue, Cyan, Magenta

## Deployment & Hosting

- **Vercel**: One-click deploy with WebGL acceleration
- **CDN**: Shaders and assets served from Vercel Edge
- **Build time**: ~1 minute with precompiled shaders
- **Bundle size**: ~200KB JS + shader assets

## Resources & References

- **The Book of Shaders**: thebookofshaders.com (Perlin noise, fractals)
- **Shadertoy**: View implementations of similar effects
- **Ashima Noise**: MIT-licensed simplex noise library
- **Three.js Documentation**: WebGL abstractions and patterns
- **WebGL Fundamentals**: wglfw.org for deep dive into rendering

## Future Enhancements

- User-created shader submission/gallery
- Real-time shader code editor (modify and see changes)
- Audio reactivity (frequency analysis driving shader uniforms)
- VR mode (stereoscopic rendering)
- Screenshot/export functionality
- Shader animation keyframing
- Social sharing with custom parameters in URL
