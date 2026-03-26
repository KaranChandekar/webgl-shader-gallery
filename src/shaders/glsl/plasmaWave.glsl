precision highp float;

uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform float uMouseInfluence;

// HSV → RGB
vec3 hsv2rgb(vec3 c) {
  vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0,
                   0.0, 1.0);
  return c.z * mix(vec3(1.0), rgb, c.y);
}

void main() {
  vec2 uv     = gl_FragCoord.xy / uResolution.xy;
  float aspect = uResolution.x / uResolution.y;
  vec2  p      = uv - 0.5;
  p.x         *= aspect;

  float t = uTime;

  // Mouse adds an extra interference source
  vec2  mp     = (uMouse - 0.5);
  mp.x        *= aspect;
  float mDist  = length(p - mp);
  float mWave  = uMouseInfluence * sin(mDist * 18.0 - t * 3.0) / (mDist * 6.0 + 0.5);

  // Wave 1 — horizontal sweep
  float w1 = sin(p.x * 6.0 + t * 1.3);
  // Wave 2 — diagonal
  float w2 = sin((p.x + p.y) * 5.0 - t * 1.7);
  // Wave 3 — radial
  float d  = length(p);
  float w3 = sin(d * 12.0 - t * 2.2);
  // Wave 4 — vertical with phase drift
  float w4 = sin(p.y * 7.0 + sin(p.x * 3.0 + t) + t * 0.9);
  // Wave 5 — Lissajous-style
  float w5 = sin(p.x * 4.0 * sin(t * 0.3) + p.y * 4.0 * cos(t * 0.4) + t);
  // Wave 6 — high-frequency ripple
  float w6 = sin(p.x * 14.0 * cos(t * 0.2) - p.y * 9.0 * sin(t * 0.15) + t * 2.5) * 0.4;

  float plasma = (w1 + w2 + w3 + w4 + w5 + w6) / 5.0 + mWave;
  plasma        = plasma * 0.5 + 0.5; // → [0, 1]

  // Map to HSV — fast hue cycling for rainbow effect
  float hue = fract(plasma * 1.5 + t * 0.08);
  vec3  col = hsv2rgb(vec3(hue, 0.95, 1.0));

  // Secondary complementary colour layer for depth
  float hue2 = fract(hue + 0.5);
  float mask = pow(abs(sin(plasma * 3.14159 * 2.0)), 6.0);
  col = mix(col, hsv2rgb(vec3(hue2, 1.0, 1.0)), mask * 0.35);

  // Bright hot-spot near mouse
  float mouseGlow = exp(-mDist * mDist * 8.0) * uMouseInfluence;
  col = mix(col, vec3(1.0, 1.0, 1.0), mouseGlow * 0.7);

  gl_FragColor = vec4(col, 1.0);
}
