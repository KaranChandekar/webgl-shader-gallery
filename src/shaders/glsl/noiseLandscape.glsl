precision highp float;

uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform float uMouseInfluence;

// --- Hash / noise ---
float hash(vec2 p) {
  p = fract(p * vec2(127.1, 311.7));
  p += dot(p, p + 19.19);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i + vec2(0,0)), hash(i + vec2(1,0)), u.x),
             mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), u.x), u.y);
}

// fBm terrain height — 4 octaves for the ray-march loop
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p  = p * 2.1 + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return v;
}

// Cheap fBm — 2 octaves, used only for normal estimation
float fbmLow(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 2; i++) {
    v += a * noise(p);
    p  = p * 2.1 + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return v;
}

// Terrain SDF height at world xz
float terrain(vec2 xz) {
  return fbm(xz * 0.6 + uTime * 0.01) * 2.0 - 0.5;
}

// Cheaper terrain sample for normal finite-differences
float terrainLow(vec2 xz) {
  return fbmLow(xz * 0.6 + uTime * 0.01) * 2.0 - 0.5;
}

// Estimated normal via finite differences (uses cheaper fbmLow)
vec3 terrainNormal(vec2 xz) {
  float eps = 0.02;
  float hL  = terrainLow(xz - vec2(eps, 0.0));
  float hR  = terrainLow(xz + vec2(eps, 0.0));
  float hD  = terrainLow(xz - vec2(0.0, eps));
  float hU  = terrainLow(xz + vec2(0.0, eps));
  return normalize(vec3(hL - hR, 2.0 * eps, hD - hU));
}

void main() {
  vec2 uv  = gl_FragCoord.xy / uResolution.xy;
  float aspect = uResolution.x / uResolution.y;
  vec2  ndc = uv * 2.0 - 1.0;
  ndc.x *= aspect;

  // Camera — slightly tilted downward
  vec3 ro  = vec3(0.0, 2.5, 4.0);
  vec3 rd  = normalize(vec3(ndc.x * 0.8, ndc.y * 0.6 - 0.3, -1.0));

  // Mouse tilts view
  float mx = (uMouse.x - 0.5) * uMouseInfluence * 1.2;
  float my = (uMouse.y - 0.5) * uMouseInfluence * 0.5;
  float cosX = cos(my); float sinX = sin(my);
  rd = vec3(rd.x, rd.y * cosX - rd.z * sinX, rd.y * sinX + rd.z * cosX);
  float cosY = cos(mx); float sinY = sin(mx);
  rd = vec3(rd.x * cosY + rd.z * sinY, rd.y, -rd.x * sinY + rd.z * cosY);

  // Ray-march the terrain
  float t = 0.0, dt = 0.08;
  bool  hitTerrain = false, hitWater = false;
  vec3  hitP = ro;

  for (int i = 0; i < 96; i++) {
    vec3 p  = ro + rd * t;
    // Early sky-out: terrain height is bounded above by ~1.5; if the
    // ray is already past 2.0 going up it can never hit terrain or water.
    if (p.y > 2.0 && rd.y > 0.0) break;
    float h = terrain(p.xz);
    if (p.y < h) { hitTerrain = true; hitP = p; break; }
    if (p.y < 0.0) { hitWater  = true; hitP = p; break; }
    t += dt + t * 0.02;
    if (t > 30.0) break;
  }

  vec3 col;

  if (hitTerrain) {
    vec3  n     = terrainNormal(hitP.xz);
    float h     = hitP.y;
    float slope = 1.0 - n.y;

    // Base terrain colour by height
    vec3 green  = vec3(0.18, 0.42, 0.12);
    vec3 brown  = vec3(0.38, 0.26, 0.15);
    vec3 gray   = vec3(0.55, 0.52, 0.50);
    vec3 snow   = vec3(0.92, 0.95, 1.00);

    col  = mix(green, brown, smoothstep(0.2,  0.6, h));
    col  = mix(col,   gray,  smoothstep(0.5,  1.0, h));
    col  = mix(col,   snow,  smoothstep(0.9,  1.3, h));
    // Rocky slopes override colour
    col  = mix(col,   gray,  smoothstep(0.3,  0.6, slope));

    // Diffuse lighting
    vec3  ld   = normalize(vec3(0.6, 1.0, 0.5));
    float diff = clamp(dot(n, ld), 0.0, 1.0);
    vec3  amb  = vec3(0.3, 0.4, 0.55) * 0.4;
    col  = col * (amb + diff * vec3(1.0, 0.95, 0.85));

    // Fog
    float fog = 1.0 - exp(-t * 0.04);
    vec3  skyFog = vec3(0.55, 0.72, 0.95);
    col = mix(col, skyFog, fog);

  } else if (hitWater) {
    vec3  n    = vec3(0.0, 1.0, 0.0);
    // Animated water normal
    float wt   = uTime * 1.2;
    float wx   = noise(hitP.xz * 3.0 + wt) - 0.5;
    float wz   = noise(hitP.xz * 3.0 + wt + 7.3) - 0.5;
    n = normalize(n + vec3(wx, 0.0, wz) * 0.15);

    vec3  ld   = normalize(vec3(0.6, 1.0, 0.5));
    float diff = clamp(dot(n, ld), 0.0, 1.0);
    vec3  sky  = vec3(0.1, 0.4, 0.8);
    vec3  deep = vec3(0.02, 0.12, 0.28);
    col  = mix(deep, sky, diff * 0.5 + 0.2);

    // Specular on water
    vec3  h2   = normalize(ld - rd);
    float spec = pow(clamp(dot(n, h2), 0.0, 1.0), 128.0);
    col += vec3(1.0, 0.98, 0.85) * spec * 0.9;

    float fog  = 1.0 - exp(-t * 0.04);
    col = mix(col, vec3(0.55, 0.72, 0.95), fog);

  } else {
    // Sky — gradient + sun halo
    float skyT = clamp(ndc.y * 0.5 + 0.5, 0.0, 1.0);
    col = mix(vec3(0.65, 0.82, 0.98), vec3(0.18, 0.32, 0.72), skyT);
    vec3  sunDir = normalize(vec3(0.6, 0.5, -1.0));
    float sun    = clamp(dot(rd, sunDir), 0.0, 1.0);
    col += vec3(1.0, 0.9, 0.7) * pow(sun, 64.0);
    col += vec3(1.0, 0.7, 0.4) * pow(sun, 8.0) * 0.4;
  }

  // Parallax haze layers (2 cloud planes)
  for (int ci = 0; ci < 2; ci++) {
    float cloudH = 2.5 + float(ci) * 1.2;
    if (rd.y > 0.001) {
      float tc     = (cloudH - ro.y) / rd.y;
      vec2  cp     = (ro + rd * tc).xz;
      float clouds = smoothstep(0.55, 0.75,
                       noise(cp * 0.4 + uTime * 0.015 * float(ci + 1)));
      col = mix(col, vec3(1.0, 0.99, 0.97), clouds * 0.35 * exp(-float(ci) * 0.5));
    }
  }

  col = pow(clamp(col, 0.0, 1.0), vec3(0.4545));
  gl_FragColor = vec4(col, 1.0);
}
