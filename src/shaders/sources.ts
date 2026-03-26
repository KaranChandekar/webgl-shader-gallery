// All 8 fragment shaders as plain strings — no R3F, no React, just GLSL.
// Indexed 0-7 matching the artworks array order.

const liquidDistortion = `
precision highp float;
uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform float uMouseInfluence;

vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                     -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1  = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
                 + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy),
                           dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x  = 2.0 * fract(p * C.www) - 1.0;
  vec3 h  = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  vec2 shift = vec2(100.0);
  mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
  for (int i = 0; i < 3; i++) {
    v += a * snoise(p);
    p = rot * p * 2.0 + shift;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  float aspect = uResolution.x / uResolution.y;
  uv.x *= aspect;
  vec2 mouse = uMouse;
  mouse.x *= aspect;
  float t = uTime * 0.4;
  vec2 q = vec2(fbm(uv + t * 0.3), fbm(uv + vec2(1.7, 9.2)));
  vec2 r = vec2(fbm(uv + 1.0 * q + vec2(1.7, 9.2) + 0.15 * t),
                fbm(uv + 1.0 * q + vec2(8.3, 2.8) + 0.12 * t));
  float f = fbm(uv + r);
  float mouseDist = length(uv - mouse);
  float mouseWarp = uMouseInfluence * exp(-mouseDist * 3.0);
  vec2 warpDir = normalize(uv - mouse + 0.001);
  f += mouseWarp * snoise(uv * 4.0 + t) * 0.5;
  r += warpDir * mouseWarp * 0.3;
  float n = clamp((f + length(r)) * 0.5 + 0.5, 0.0, 1.0);
  vec3 col = mix(vec3(0.02, 0.08, 0.55), vec3(0.0, 0.85, 0.95), smoothstep(0.0, 0.5, n));
  col = mix(col, vec3(0.95, 0.1, 0.8), smoothstep(0.5, 1.0, n));
  float vig = 1.0 - 0.4 * smoothstep(0.4, 1.4, length(uv - vec2(aspect * 0.5, 0.5)));
  col *= vig;
  float shimmer = pow(clamp(f * 0.5 + 0.5, 0.0, 1.0), 8.0) * 0.6;
  col += shimmer * vec3(1.0, 0.95, 1.0);
  gl_FragColor = vec4(col, 1.0);
}
`;

const rayMarching = `
precision highp float;
uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform float uMouseInfluence;

float sdSphere(vec3 p, float r) { return length(p) - r; }

float smin(float a, float b, float k) {
  float res = exp2(-k * a) + exp2(-k * b);
  return -log2(res) / k;
}

float map(vec3 p) {
  float t = uTime * 0.5;
  vec3 p1 = vec3(sin(t * 1.3) * 1.2, cos(t * 0.9) * 0.7, 0.0);
  vec3 p2 = vec3(cos(t * 0.7) * 1.1, -sin(t * 1.1) * 0.8, sin(t) * 0.5);
  vec3 p3 = vec3(sin(t * 0.5) * 0.6, sin(t * 1.7) * 1.0, -cos(t * 0.8) * 0.4);
  vec3 p4 = vec3(-cos(t * 1.1) * 0.9, cos(t * 0.6) * 0.5, sin(t * 1.2) * 0.9);
  vec2 mouseOff = (uMouse - 0.5) * uMouseInfluence * 0.8;
  mat3 rotY = mat3(cos(mouseOff.x), 0.0, sin(mouseOff.x),
                   0.0, 1.0, 0.0,
                   -sin(mouseOff.x), 0.0, cos(mouseOff.x));
  mat3 rotX = mat3(1.0, 0.0, 0.0,
                   0.0, cos(mouseOff.y), -sin(mouseOff.y),
                   0.0, sin(mouseOff.y), cos(mouseOff.y));
  p = rotY * rotX * p;
  float d = sdSphere(p - p1, 0.55);
  d = smin(d, sdSphere(p - p2, 0.50), 8.0);
  d = smin(d, sdSphere(p - p3, 0.45), 8.0);
  d = smin(d, sdSphere(p - p4, 0.40), 8.0);
  return d;
}

vec3 calcNormal(vec3 p) {
  vec2 e = vec2(0.001, 0.0);
  return normalize(vec3(map(p + e.xyy) - map(p - e.xyy),
                        map(p + e.yxy) - map(p - e.yxy),
                        map(p + e.yyx) - map(p - e.yyx)));
}

float softShadow(vec3 ro, vec3 rd, float mint, float maxt, float k) {
  float res = 1.0, t = mint;
  for (int i = 0; i < 8; i++) {
    float h = map(ro + rd * t);
    if (h < 0.001) return 0.0;
    res = min(res, k * h / t);
    t += clamp(h, 0.01, 0.5);
    if (t > maxt) break;
  }
  return clamp(res, 0.0, 1.0);
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution.xy) / uResolution.y;
  vec3 ro = vec3(0.0, 0.0, 4.0);
  vec3 rd = normalize(vec3(uv, -1.5));
  vec3 col = vec3(0.0);
  float t = 0.0;
  bool hit = false;
  for (int i = 0; i < 40; i++) {
    vec3 p = ro + rd * t;
    float d = map(p);
    if (d < 0.001) { hit = true; break; }
    if (t > 12.0) break;
    t += d;
  }
  if (hit) {
    vec3 p = ro + rd * t;
    vec3 n = calcNormal(p);
    vec3 ld = normalize(vec3(1.5, 2.0, 2.5));
    vec3 ldc = normalize(vec3(-1.0, -0.5, 0.0));
    float diff = clamp(dot(n, ld), 0.0, 1.0);
    float diff2 = clamp(dot(n, ldc), 0.0, 1.0) * 0.2;
    float sha = softShadow(p + n * 0.01, ld, 0.01, 6.0, 16.0);
    vec3 h = normalize(ld - rd);
    float spec = pow(clamp(dot(n, h), 0.0, 1.0), 64.0);
    float fres = pow(1.0 - clamp(dot(-rd, n), 0.0, 1.0), 4.0);
    vec3 baseCol = vec3(0.75, 0.72, 0.78);
    vec3 ambient = vec3(0.08, 0.04, 0.18);
    vec3 rimCol = vec3(0.1, 0.95, 0.95) * fres * 1.5;
    col = ambient;
    col += baseCol * diff * sha;
    col += baseCol * diff2;
    col += vec3(1.0, 0.95, 0.9) * spec * sha * 0.8;
    col += rimCol;
  } else {
    col = mix(vec3(0.01, 0.01, 0.06), vec3(0.05, 0.02, 0.12), uv.y * 0.5 + 0.5);
    vec2 st = gl_FragCoord.xy;
    float s = fract(sin(dot(floor(st / 3.0), vec2(127.1, 311.7))) * 43758.5453);
    float sb = step(0.97, s);
    col += sb * vec3(0.6, 0.7, 1.0) * 0.5;
  }
  col = pow(clamp(col, 0.0, 1.0), vec3(0.4545));
  gl_FragColor = vec4(col, 1.0);
}
`;

const fractal = `
precision highp float;
uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform float uMouseInfluence;

vec3 hsv2rgb(vec3 c) {
  vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
  return c.z * mix(vec3(1.0), rgb, c.y);
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution.xy) / uResolution.y;
  float zoom = exp(-uTime * 0.08);
  vec2 center = vec2(-0.7269, 0.1889);
  vec2 mouseOff = (uMouse - 0.5) * uMouseInfluence * 0.4;
  center += mouseOff * zoom;
  vec2 c = uv * zoom * 2.5 + center;
  vec2 z = vec2(0.0);
  float iter = 0.0;
  const int MAX = 64;
  for (int i = 0; i < MAX; i++) {
    z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
    iter = float(i);
    if (dot(z, z) > 4.0) break;
  }
  if (dot(z, z) <= 4.0) {
    gl_FragColor = vec4(0.0, 0.0, 0.02, 1.0);
    return;
  }
  float log2z = log(dot(z, z)) * 0.5;
  float nu = log(log2z / log(2.0)) / log(2.0);
  float smooth_ = iter + 1.0 - nu;
  float t = smooth_ / float(MAX);
  float h = t * 3.0 + uTime * 0.05;
  vec3 col;
  col = hsv2rgb(vec3(fract(h), 0.9, 1.0)) * (1.0 - t);
  col += hsv2rgb(vec3(fract(h + 0.33), 0.8, 0.85)) * t * (1.0 - t) * 4.0;
  col += hsv2rgb(vec3(fract(h + 0.66), 0.7, 0.6)) * t * t;
  float edgeBright = exp(-t * 8.0) * 0.8;
  col += edgeBright * hsv2rgb(vec3(fract(h + 0.15), 1.0, 1.0));
  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;

const noiseLandscape = `
precision highp float;
uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform float uMouseInfluence;

float hash(vec2 p) {
  p = fract(p * vec2(127.1, 311.7));
  p += dot(p, p + 19.19);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1,0)), u.x),
             mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 3; i++) {
    v += a * noise(p);
    p = p * 2.1 + vec2(1.7, 9.2);
    a *= 0.48;
  }
  return v;
}

float terrain(vec2 xz) {
  return fbm(xz * 0.6 + uTime * 0.01) * 2.0 - 0.5;
}

vec3 terrainNormal(vec2 xz) {
  float eps = 0.01;
  float hL = terrain(xz - vec2(eps, 0.0));
  float hR = terrain(xz + vec2(eps, 0.0));
  float hD = terrain(xz - vec2(0.0, eps));
  float hU = terrain(xz + vec2(0.0, eps));
  return normalize(vec3(hL - hR, 2.0 * eps, hD - hU));
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  float aspect = uResolution.x / uResolution.y;
  vec2 ndc = uv * 2.0 - 1.0;
  ndc.x *= aspect;
  vec3 ro = vec3(0.0, 2.5, 4.0);
  vec3 rd = normalize(vec3(ndc.x * 0.8, ndc.y * 0.6 - 0.3, -1.0));
  float mx = (uMouse.x - 0.5) * uMouseInfluence * 1.2;
  float my = (uMouse.y - 0.5) * uMouseInfluence * 0.5;
  float cosX = cos(my); float sinX = sin(my);
  rd = vec3(rd.x, rd.y * cosX - rd.z * sinX, rd.y * sinX + rd.z * cosX);
  float cosY = cos(mx); float sinY = sin(mx);
  rd = vec3(rd.x * cosY + rd.z * sinY, rd.y, -rd.x * sinY + rd.z * cosY);
  float t = 0.0, dt = 0.05;
  bool hitTerrain = false, hitWater = false;
  vec3 hitP = ro;
  for (int i = 0; i < 80; i++) {
    vec3 p = ro + rd * t;
    float h = terrain(p.xz);
    if (p.y < h) { hitTerrain = true; hitP = p; break; }
    if (p.y < 0.0) { hitWater = true; hitP = p; break; }
    t += dt + t * 0.012;
    if (t > 40.0) break;
  }
  vec3 col;
  if (hitTerrain) {
    vec3 n = terrainNormal(hitP.xz);
    float h = hitP.y;
    float slope = 1.0 - n.y;
    vec3 green = vec3(0.18, 0.42, 0.12);
    vec3 brown = vec3(0.38, 0.26, 0.15);
    vec3 gray = vec3(0.55, 0.52, 0.50);
    vec3 snow = vec3(0.92, 0.95, 1.00);
    col = mix(green, brown, smoothstep(0.2, 0.6, h));
    col = mix(col, gray, smoothstep(0.5, 1.0, h));
    col = mix(col, snow, smoothstep(0.9, 1.3, h));
    col = mix(col, gray, smoothstep(0.3, 0.6, slope));
    vec3 ld = normalize(vec3(0.6, 1.0, 0.5));
    float diff = clamp(dot(n, ld), 0.0, 1.0);
    vec3 amb = vec3(0.3, 0.4, 0.55) * 0.4;
    col = col * (amb + diff * vec3(1.0, 0.95, 0.85));
    float fog = 1.0 - exp(-t * 0.04);
    col = mix(col, vec3(0.55, 0.72, 0.95), fog);
  } else if (hitWater) {
    vec3 n = vec3(0.0, 1.0, 0.0);
    float wt = uTime * 1.2;
    float wx = noise(hitP.xz * 3.0 + wt) - 0.5;
    float wz = noise(hitP.xz * 3.0 + wt + 7.3) - 0.5;
    n = normalize(n + vec3(wx, 0.0, wz) * 0.15);
    vec3 ld = normalize(vec3(0.6, 1.0, 0.5));
    float diff = clamp(dot(n, ld), 0.0, 1.0);
    col = mix(vec3(0.02, 0.12, 0.28), vec3(0.1, 0.4, 0.8), diff * 0.5 + 0.2);
    vec3 h2 = normalize(ld - rd);
    float spec = pow(clamp(dot(n, h2), 0.0, 1.0), 128.0);
    col += vec3(1.0, 0.98, 0.85) * spec * 0.9;
    float fog = 1.0 - exp(-t * 0.04);
    col = mix(col, vec3(0.55, 0.72, 0.95), fog);
  } else {
    float skyT = clamp(ndc.y * 0.5 + 0.5, 0.0, 1.0);
    col = mix(vec3(0.65, 0.82, 0.98), vec3(0.18, 0.32, 0.72), skyT);
    vec3 sunDir = normalize(vec3(0.6, 0.5, -1.0));
    float sun = clamp(dot(rd, sunDir), 0.0, 1.0);
    col += vec3(1.0, 0.9, 0.7) * pow(sun, 64.0);
    col += vec3(1.0, 0.7, 0.4) * pow(sun, 8.0) * 0.4;
  }
  col = pow(clamp(col, 0.0, 1.0), vec3(0.4545));
  gl_FragColor = vec4(col, 1.0);
}
`;

const plasmaWave = `
precision highp float;
uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform float uMouseInfluence;

vec3 hsv2rgb(vec3 c) {
  vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
  return c.z * mix(vec3(1.0), rgb, c.y);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  float aspect = uResolution.x / uResolution.y;
  vec2 p = uv - 0.5;
  p.x *= aspect;
  float t = uTime;
  vec2 mp = (uMouse - 0.5);
  mp.x *= aspect;
  float mDist = length(p - mp);
  float mWave = uMouseInfluence * sin(mDist * 18.0 - t * 3.0) / (mDist * 6.0 + 0.5);
  float w1 = sin(p.x * 6.0 + t * 1.3);
  float w2 = sin((p.x + p.y) * 5.0 - t * 1.7);
  float d = length(p);
  float w3 = sin(d * 12.0 - t * 2.2);
  float w4 = sin(p.y * 7.0 + sin(p.x * 3.0 + t) + t * 0.9);
  float w5 = sin(p.x * 4.0 * sin(t * 0.3) + p.y * 4.0 * cos(t * 0.4) + t);
  float w6 = sin(p.x * 14.0 * cos(t * 0.2) - p.y * 9.0 * sin(t * 0.15) + t * 2.5) * 0.4;
  float plasma = (w1 + w2 + w3 + w4 + w5 + w6) / 5.0 + mWave;
  plasma = plasma * 0.5 + 0.5;
  float hue = fract(plasma * 1.5 + t * 0.08);
  vec3 col = hsv2rgb(vec3(hue, 0.95, 1.0));
  float hue2 = fract(hue + 0.5);
  float mask = pow(abs(sin(plasma * 3.14159 * 2.0)), 6.0);
  col = mix(col, hsv2rgb(vec3(hue2, 1.0, 1.0)), mask * 0.35);
  float mouseGlow = exp(-mDist * mDist * 8.0) * uMouseInfluence;
  col = mix(col, vec3(1.0), mouseGlow * 0.7);
  gl_FragColor = vec4(col, 1.0);
}
`;

const particleFlow = `
precision highp float;
uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform float uMouseInfluence;

vec2 hash2(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}

float gnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  return mix(mix(dot(hash2(i), f),
                 dot(hash2(i + vec2(1,0)), f - vec2(1,0)), u.x),
             mix(dot(hash2(i + vec2(0,1)), f - vec2(0,1)),
                 dot(hash2(i + vec2(1,1)), f - vec2(1,1)), u.x), u.y);
}

vec2 curl(vec2 p, float t) {
  float eps = 0.001;
  float pot = gnoise(p * 2.0 + t * 0.15);
  float dpx = (gnoise((p + vec2(eps, 0.0)) * 2.0 + t * 0.15) - pot) / eps;
  float dpy = (gnoise((p + vec2(0.0, eps)) * 2.0 + t * 0.15) - pot) / eps;
  return vec2(dpy, -dpx);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  float aspect = uResolution.x / uResolution.y;
  vec2 p = uv;
  p.x *= aspect;
  float t = uTime * 0.4;
  vec2 mp = uMouse;
  mp.x *= aspect;
  vec2 dir = p - mp;
  float md = length(dir);
  vec2 vortex = uMouseInfluence * vec2(-dir.y, dir.x) / (md * md + 0.01) * 0.004;
  vec2 q = p;
  for (int i = 0; i < 8; i++) {
    vec2 v = curl(q, t) + vortex;
    q -= v * 0.04;
  }
  vec2 vel = curl(p, t) + vortex;
  float speed = length(vel);
  float stripe = sin(q.x * 30.0 + q.y * 20.0) * 0.5 + 0.5;
  float stripe2 = sin(q.x * 15.0 - q.y * 25.0 + t * 2.0) * 0.5 + 0.5;
  float pattern = stripe * stripe2;
  float particle = pow(pattern, 12.0);
  vec3 slowCol = vec3(0.02, 0.06, 0.35);
  vec3 midCol = vec3(0.0, 0.75, 0.95);
  vec3 fastCol = vec3(0.85, 0.98, 1.0);
  float s = clamp(speed * 4.0, 0.0, 1.0);
  vec3 flowCol = mix(slowCol, midCol, smoothstep(0.0, 0.5, s));
  flowCol = mix(flowCol, fastCol, smoothstep(0.5, 1.0, s));
  vec3 col = flowCol * (0.15 + 0.85 * pattern);
  col += fastCol * particle * 1.5;
  float mouseGlow = exp(-md * md * 5.0) * uMouseInfluence * 0.6;
  col = mix(col, vec3(0.4, 1.0, 1.0), mouseGlow);
  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;

const voronoiCells = `
precision highp float;
uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform float uMouseInfluence;

vec2 hash2(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return fract(sin(p) * 43758.5453123);
}

float snoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  vec2 a = hash2(i);
  vec2 b = hash2(i + vec2(1,0));
  vec2 c = hash2(i + vec2(0,1));
  vec2 d = hash2(i + vec2(1,1));
  return mix(mix(dot(a, f), dot(b, f - vec2(1,0)), u.x),
             mix(dot(c, f - vec2(0,1)), dot(d, f - vec2(1,1)), u.x), u.y);
}

vec2 seedPos(vec2 cell) {
  vec2 base = hash2(cell);
  float t = uTime * 0.3;
  float ox = snoise(base * 4.0 + t * vec2(0.7, 0.5)) * 0.4;
  float oy = snoise(base * 4.0 + t * vec2(-0.5, 0.9) + 3.1) * 0.4;
  return base + vec2(ox, oy) * 0.3;
}

vec3 hsv2rgb(vec3 c) {
  vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
  return c.z * mix(vec3(1.0), rgb, c.y);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  float aspect = uResolution.x / uResolution.y;
  vec2 p = uv;
  p.x *= aspect;
  vec2 vp = p * 6.0;
  vec2 mp = uMouse;
  mp.x *= aspect;
  vec2 mvp = mp * 6.0;

  vec2 cellID = floor(vp);
  vec2 localP = fract(vp);
  float d1 = 1e10, d2 = 1e10;
  vec2 nearCell = vec2(0.0);
  vec2 nearSeed = vec2(0.0);
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 neighbor = vec2(float(x), float(y));
      vec2 cell = cellID + neighbor;
      vec2 seed = seedPos(cell) + neighbor;
      float d = length(localP - seed);
      if (d < d1) { d2 = d1; d1 = d; nearCell = cell; nearSeed = seed + cellID; }
      else if (d < d2) { d2 = d; }
    }
  }

  // Mouse cell
  vec2 mcellID = floor(mvp);
  vec2 mlocalP = fract(mvp);
  float md1 = 1e10;
  vec2 mnearCell = vec2(0.0);
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 neighbor = vec2(float(x), float(y));
      vec2 cell = mcellID + neighbor;
      vec2 seed = seedPos(cell) + neighbor;
      float d = length(mlocalP - seed);
      if (d < md1) { md1 = d; mnearCell = cell; }
    }
  }

  float cellHash = fract(dot(nearCell, vec2(0.3183099, 0.3678794)));
  float hue = fract(cellHash + uTime * 0.04);
  vec3 cellCol = hsv2rgb(vec3(hue, 0.65, 0.22));
  bool hovered = (nearCell == mnearCell);
  if (hovered) {
    cellCol = mix(cellCol, hsv2rgb(vec3(hue, 0.4, 0.55)), uMouseInfluence);
  }
  float edge = d2 - d1;
  float glow = 1.0 - smoothstep(0.0, 0.06, edge);
  vec3 edgeC = hsv2rgb(vec3(fract(hue + 0.5), 0.9, 1.0));
  vec3 col = cellCol;
  col = mix(col, edgeC, glow * 0.9);
  float pulse = 0.85 + 0.15 * sin(uTime * 1.2 + cellHash * 6.28);
  col *= pulse;
  float vig = 1.0 - 0.5 * smoothstep(0.3, 1.0, length(p - vec2(aspect * 0.5, 0.5)));
  col *= vig;
  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;

const gradientOrb = `
precision highp float;
uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform float uMouseInfluence;

mat3 rotY(float a) {
  float c = cos(a), s = sin(a);
  return mat3(c, 0.0, s, 0.0, 1.0, 0.0, -s, 0.0, c);
}
mat3 rotX(float a) {
  float c = cos(a), s = sin(a);
  return mat3(1.0, 0.0, 0.0, 0.0, c, -s, 0.0, s, c);
}

vec3 hsv2rgb(vec3 c) {
  vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
  return c.z * mix(vec3(1.0), rgb, c.y);
}

float bump(vec3 p) {
  float lat = asin(p.y / length(p));
  float lon = atan(p.z, p.x) + uTime * 0.4;
  return 0.015 * (sin(lon * 8.0) * cos(lat * 6.0) + sin(lat * 10.0) * 0.5);
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution.xy) / uResolution.y;
  vec3 ro = vec3(0.0, 0.0, 3.5);
  vec3 rd = normalize(vec3(uv, -1.8));
  float mx = (uMouse.x - 0.5) * uMouseInfluence * 1.6;
  float my = (uMouse.y - 0.5) * uMouseInfluence * 1.0;
  float R = 1.0;
  vec3 sc = vec3(0.0);
  vec3 oc = ro - sc;
  float b = dot(oc, rd);
  float c_ = dot(oc, oc) - R * R;
  float dis = b * b - c_;
  vec3 col = vec3(0.0);
  if (dis >= 0.0) {
    float t = -b - sqrt(dis);
    if (t < 0.0) t = -b + sqrt(dis);
    vec3 p = ro + rd * t;
    vec3 n = normalize(p - sc);
    float rotAngle = uTime * 0.5;
    n = rotY(rotAngle + mx) * rotX(my) * n;
    float u_s = atan(n.z, n.x) / (2.0 * 3.14159265) + 0.5;
    float v_s = asin(clamp(n.y, -1.0, 1.0)) / 3.14159265 + 0.5;
    float hue = mix(0.72, 0.55, v_s);
    hue = mix(hue, 0.50, u_s * 0.3);
    hue = fract(hue + 0.05 * sin(uTime * 0.2));
    vec3 baseCol = hsv2rgb(vec3(hue, 0.85, 0.9));
    float bumpVal = bump(n);
    vec3 bn = normalize(n + vec3(bumpVal));
    vec3 ld = normalize(vec3(1.2, 1.5, 1.8));
    float diff = clamp(dot(bn, ld), 0.0, 1.0);
    vec3 h_ = normalize(ld - rd);
    float spec = pow(clamp(dot(bn, h_), 0.0, 1.0), 128.0);
    float rim = pow(1.0 - clamp(dot(-rd, n), 0.0, 1.0), 3.5);
    float ao = 0.5 + 0.5 * n.y;
    vec3 ambient = vec3(0.04, 0.02, 0.10) * ao;
    col = ambient;
    col += baseCol * diff * 0.9;
    col += vec3(0.9, 0.95, 1.0) * spec * 1.2;
    col += vec3(0.1, 0.8, 1.0) * rim * 0.8;
    vec3 ld2 = normalize(vec3(-0.8, -0.3, 0.5));
    float diff2 = clamp(dot(bn, ld2), 0.0, 1.0) * 0.25;
    col += baseCol * diff2 * vec3(1.0, 0.85, 0.7);
  } else {
    float bg = length(uv);
    col = mix(vec3(0.02, 0.01, 0.06), vec3(0.0), smoothstep(0.4, 1.4, bg));
    float nebula = exp(-bg * bg * 2.0) * 0.15;
    col += vec3(0.3, 0.1, 0.6) * nebula;
  }
  col = col / (col + 0.8);
  col = pow(clamp(col, 0.0, 1.0), vec3(0.4545));
  gl_FragColor = vec4(col, 1.0);
}
`;

export const SHADER_SOURCES: string[] = [
  liquidDistortion,
  rayMarching,
  fractal,
  noiseLandscape,
  plasmaWave,
  particleFlow,
  voronoiCells,
  gradientOrb,
];
