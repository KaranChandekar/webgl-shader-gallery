export interface ArtworkData {
  id: string;
  title: string;
  description: string;
  technique: string;
  accentColor: string;
  codeSnippet: string;
}

export const artworks: ArtworkData[] = [
  {
    id: "liquid-distortion",
    title: "Liquid Distortion",
    description:
      "A mesmerizing fluid simulation that warps space using layered noise functions. Watch as invisible currents bend and twist the color field into organic, ever-changing forms.",
    technique: "Noise-based fluid simulation",
    accentColor: "#06b6d4",
    codeSnippet: `vec2 distort(vec2 uv, float t) {
  float n = snoise(vec3(uv * 2.0, t * 0.3));
  float m = snoise(vec3(uv * 2.0 + 5.2, t * 0.3));
  return uv + vec2(n, m) * 0.15;
}`,
  },
  {
    id: "ray-marching-spheres",
    title: "Ray Marching Spheres",
    description:
      "Geometric forms sculpted entirely from mathematics. Rays pierce through a signed distance field, revealing smooth metaball surfaces that merge and separate like soap bubbles.",
    technique: "Distance field ray marching",
    accentColor: "#a855f7",
    codeSnippet: `float map(vec3 p) {
  float d = length(p) - 1.0;
  d = smin(d, length(p - vec3(1.5, 0.0, 0.0)) - 0.8, 0.5);
  return d;
}

vec3 rayMarch(vec3 ro, vec3 rd) {
  float t = 0.0;
  for (int i = 0; i < 64; i++) {
    float d = map(ro + rd * t);
    if (d < 0.001) break;
    t += d;
  }
  return ro + rd * t;
}`,
  },
  {
    id: "fractal-explorer",
    title: "Fractal Explorer",
    description:
      "Dive into the infinite complexity of the Mandelbrot set. Each pixel encodes an escape-time iteration, painting the boundary between order and chaos with vivid color gradients.",
    technique: "Mandelbrot set exploration",
    accentColor: "#f97316",
    codeSnippet: `vec2 mandelbrot(vec2 c) {
  vec2 z = vec2(0.0);
  for (int i = 0; i < 256; i++) {
    if (dot(z, z) > 4.0) return vec2(float(i), dot(z, z));
    z = vec2(z.x*z.x - z.y*z.y, 2.0*z.x*z.y) + c;
  }
  return vec2(256.0, 0.0);
}`,
  },
  {
    id: "noise-landscape",
    title: "Noise Landscape",
    description:
      "Rolling terrain rises and falls across the viewport, generated entirely from fractal Brownian motion. Layers of octave noise stack to form ridgelines and valleys with geological realism.",
    technique: "Procedural terrain generation",
    accentColor: "#22c55e",
    codeSnippet: `float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;
  for (int i = 0; i < 6; i++) {
    value += amplitude * snoise(p * frequency);
    amplitude *= 0.5;
    frequency *= 2.0;
  }
  return value;
}`,
  },
  {
    id: "plasma-wave",
    title: "Plasma Wave",
    description:
      "Interference patterns born from the superposition of sinusoidal waves. Frequencies beat against each other to produce a pulsing, iridescent plasma that never quite repeats.",
    technique: "Sinusoidal interference patterns",
    accentColor: "#ec4899",
    codeSnippet: `float plasma(vec2 uv, float t) {
  float v = sin(uv.x * 10.0 + t);
  v += sin(uv.y * 10.0 + t * 1.3);
  v += sin((uv.x + uv.y) * 7.0 + t * 0.7);
  float cx = uv.x + 0.5 * sin(t * 0.5);
  float cy = uv.y + 0.5 * cos(t * 0.3);
  v += sin(sqrt(cx*cx + cy*cy) * 12.0 + t);
  return v * 0.5 + 0.5;
}`,
  },
  {
    id: "particle-flow-field",
    title: "Particle Flow Field",
    description:
      "Thousands of massless particles trace the invisible contours of a curl noise vector field. Streams weave around each other like starlings in murmuration, guided by pure mathematics.",
    technique: "Curl noise flow visualization",
    accentColor: "#3b82f6",
    codeSnippet: `vec2 curlNoise(vec2 p, float t) {
  float eps = 0.001;
  float n1 = snoise(vec3(p.x, p.y + eps, t));
  float n2 = snoise(vec3(p.x, p.y - eps, t));
  float n3 = snoise(vec3(p.x + eps, p.y, t));
  float n4 = snoise(vec3(p.x - eps, p.y, t));
  return vec2(n1 - n2, n4 - n3) / (2.0 * eps);
}`,
  },
  {
    id: "voronoi-cells",
    title: "Voronoi Cells",
    description:
      "A living mosaic of cells partitioned by proximity to scattered seed points. The seeds drift slowly through space, causing boundaries to shift and merge in an endless cellular ballet.",
    technique: "Procedural cell generation",
    accentColor: "#84cc16",
    codeSnippet: `vec2 voronoi(vec2 p) {
  vec2 ip = floor(p);
  vec2 fp = fract(p);
  float minDist = 8.0;
  vec2 minPoint = vec2(0.0);
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 neighbor = vec2(float(x), float(y));
      vec2 point = hash2(ip + neighbor);
      vec2 diff = neighbor + point - fp;
      float d = dot(diff, diff);
      if (d < minDist) { minDist = d; minPoint = point; }
    }
  }
  return vec2(sqrt(minDist), minPoint.x);
}`,
  },
  {
    id: "gradient-orb",
    title: "Gradient Orb",
    description:
      "A luminous sphere whose surface catches spectral light as it slowly rotates. A physically-inspired BRDF model blends diffuse gradients with sharp specular highlights for a jewel-like finish.",
    technique: "Rotating specular sphere",
    accentColor: "#8b5cf6",
    codeSnippet: `vec3 shadeSphere(vec3 normal, vec3 viewDir, vec3 lightDir) {
  float diff = max(dot(normal, lightDir), 0.0);
  vec3 halfVec = normalize(lightDir + viewDir);
  float spec = pow(max(dot(normal, halfVec), 0.0), 64.0);
  vec3 baseColor = mix(vec3(0.1, 0.0, 0.4), vec3(0.6, 0.2, 1.0), diff);
  return baseColor + vec3(1.0) * spec * 0.8;
}`,
  },
];
