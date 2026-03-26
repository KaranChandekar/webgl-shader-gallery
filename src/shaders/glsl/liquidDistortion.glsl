precision highp float;

uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform float uMouseInfluence;

// --- Simplex noise helpers ---
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

// Fractal Brownian Motion — 6 octaves
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  vec2  shift = vec2(100.0);
  mat2  rot   = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
  for (int i = 0; i < 6; i++) {
    v += a * snoise(p);
    p  = rot * p * 2.0 + shift;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  float aspect = uResolution.x / uResolution.y;
  uv.x *= aspect;

  // Mouse in same aspect-corrected space
  vec2 mouse = uMouse;
  mouse.x *= aspect;

  float t = uTime * 0.4;

  // Domain warp: distort UV with nested fBm
  vec2 q = vec2(fbm(uv + t * 0.3),
                fbm(uv + vec2(1.7, 9.2)));

  vec2 r = vec2(fbm(uv + 1.0 * q + vec2(1.7, 9.2) + 0.15 * t),
                fbm(uv + 1.0 * q + vec2(8.3, 2.8) + 0.12 * t));

  float f = fbm(uv + r);

  // Mouse distortion: pull field toward cursor
  float mouseDist = length(uv - mouse);
  float mouseWarp = uMouseInfluence * exp(-mouseDist * 3.0);
  vec2  warpDir   = normalize(uv - mouse + 0.001);
  f += mouseWarp * snoise(uv * 4.0 + t) * 0.5;
  r  += warpDir * mouseWarp * 0.3;

  // Colour gradient: Blue → Cyan → Magenta based on distortion magnitude
  float n = clamp((f + length(r)) * 0.5 + 0.5, 0.0, 1.0);

  vec3 col = mix(vec3(0.02, 0.08, 0.55),   // deep blue
                 vec3(0.0,  0.85, 0.95),   // cyan
                 smoothstep(0.0, 0.5, n));
  col      = mix(col,
                 vec3(0.95, 0.1,  0.8),    // magenta
                 smoothstep(0.5, 1.0, n));

  // Subtle vignette
  float vig = 1.0 - 0.4 * smoothstep(0.4, 1.4, length(uv - vec2(aspect * 0.5, 0.5)));
  col *= vig;

  // Specular shimmer on high-distortion regions
  float shimmer = pow(clamp(f * 0.5 + 0.5, 0.0, 1.0), 8.0) * 0.6;
  col += shimmer * vec3(1.0, 0.95, 1.0);

  gl_FragColor = vec4(col, 1.0);
}
