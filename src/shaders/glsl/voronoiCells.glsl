precision highp float;

uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform float uMouseInfluence;

// --- Hash helpers ---
vec2 hash2(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return fract(sin(p) * 43758.5453123);
}

// Smooth noise for seed animation
float snoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  vec2 a = hash2(i);
  vec2 b = hash2(i + vec2(1,0));
  vec2 c = hash2(i + vec2(0,1));
  vec2 d = hash2(i + vec2(1,1));
  return mix(mix(dot(a, f),           dot(b, f - vec2(1,0)), u.x),
             mix(dot(c, f - vec2(0,1)), dot(d, f - vec2(1,1)), u.x), u.y);
}

// Animated seed position for cell i,j
vec2 seedPos(vec2 cell) {
  vec2 base = hash2(cell);
  float t   = uTime * 0.3;
  // Each seed drifts via low-frequency noise
  float ox = snoise(base * 4.0 + t * vec2(0.7, 0.5)) * 0.4;
  float oy = snoise(base * 4.0 + t * vec2(-0.5, 0.9) + 3.1) * 0.4;
  return base + vec2(ox, oy) * 0.3;
}

struct VoronoiResult {
  float d1;     // distance to nearest seed
  float d2;     // distance to second nearest
  vec2  cell;   // nearest cell ID
  vec2  seed;   // nearest seed position
};

VoronoiResult voronoi(vec2 p) {
  vec2  cellID = floor(p);
  vec2  localP = fract(p);

  float d1 = 1e10, d2 = 1e10;
  vec2  nearCell = vec2(0.0);
  vec2  nearSeed = vec2(0.0);

  for (int y = -2; y <= 2; y++) {
    for (int x = -2; x <= 2; x++) {
      vec2 neighbor = vec2(float(x), float(y));
      vec2 cell     = cellID + neighbor;
      vec2 seed     = seedPos(cell) + neighbor;
      float d       = length(localP - seed);
      if (d < d1) {
        d2       = d1;
        d1       = d;
        nearCell = cell;
        nearSeed = seed + cellID; // world-space seed
      } else if (d < d2) {
        d2 = d;
      }
    }
  }

  VoronoiResult r;
  r.d1   = d1;
  r.d2   = d2;
  r.cell = nearCell;
  r.seed = nearSeed;
  return r;
}

// HSV → RGB
vec3 hsv2rgb(vec3 c) {
  vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
  return c.z * mix(vec3(1.0), rgb, c.y);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  float aspect = uResolution.x / uResolution.y;
  vec2  p  = uv;
  p.x     *= aspect;

  // Scale up to Voronoi space
  vec2 vp  = p * 6.0;

  // Mouse in Voronoi space
  vec2 mp  = uMouse;
  mp.x    *= aspect;
  vec2 mvp = mp * 6.0;

  VoronoiResult v = voronoi(vp);

  // Cell colour — unique per cell, slowly hue-rotating
  float cellHash = fract(dot(v.cell, vec2(0.3183099, 0.3678794)));
  float hue      = fract(cellHash + uTime * 0.04);
  vec3  cellCol  = hsv2rgb(vec3(hue, 0.65, 0.22));

  // Mouse hover: highlight the cell under the cursor
  VoronoiResult vm = voronoi(mvp);
  bool hovered = (v.cell == vm.cell);
  if (hovered) {
    cellCol = mix(cellCol, hsv2rgb(vec3(hue, 0.4, 0.55)), uMouseInfluence);
  }

  // Edge glow — based on distance to second nearest (d2-d1)
  float edge  = v.d2 - v.d1;
  float glow  = 1.0 - smoothstep(0.0, 0.06, edge);
  vec3  edgeC = hsv2rgb(vec3(fract(hue + 0.5), 0.9, 1.0));

  vec3 col = cellCol;
  col = mix(col, edgeC, glow * 0.9);

  // Seed dot — tiny bright center for each cell
  float seedDist = length(vp - v.seed * 6.0);
  float dot_     = 1.0 - smoothstep(0.0, 0.06, seedDist);
  col = mix(col, vec3(1.0), dot_ * 0.85);

  // Global pulsing brightness
  float pulse = 0.85 + 0.15 * sin(uTime * 1.2 + cellHash * 6.28);
  col        *= pulse;

  // Vignette
  float vig = 1.0 - 0.5 * smoothstep(0.3, 1.0, length(p - vec2(aspect * 0.5, 0.5)));
  col       *= vig;

  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
