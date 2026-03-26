precision highp float;

uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform float uMouseInfluence;

// --- Gradient noise (for curl) ---
vec2 hash2(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}

float gnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  return mix(mix(dot(hash2(i + vec2(0,0)), f - vec2(0,0)),
                 dot(hash2(i + vec2(1,0)), f - vec2(1,0)), u.x),
             mix(dot(hash2(i + vec2(0,1)), f - vec2(0,1)),
                 dot(hash2(i + vec2(1,1)), f - vec2(1,1)), u.x), u.y);
}

// Curl of a 2D scalar potential — gives divergence-free flow
vec2 curl(vec2 p, float t) {
  float eps = 0.001;
  // Potential: layered noise
  float p1 = gnoise(p * 2.0 + t * 0.15);
  float p2 = gnoise(p * 4.0 - t * 0.1 + 3.7);
  float pot = p1 * 0.6 + p2 * 0.4;

  float dpx = (gnoise((p + vec2(eps, 0.0)) * 2.0 + t * 0.15) * 0.6 +
               gnoise((p + vec2(eps, 0.0)) * 4.0 - t * 0.1 + 3.7) * 0.4
              - pot) / eps;
  float dpy = (gnoise((p + vec2(0.0, eps)) * 2.0 + t * 0.15) * 0.6 +
               gnoise((p + vec2(0.0, eps)) * 4.0 - t * 0.1 + 3.7) * 0.4
              - pot) / eps;
  return vec2(dpy, -dpx); // curl: (dF/dy, -dF/dx)
}

void main() {
  vec2 uv  = gl_FragCoord.xy / uResolution.xy;
  float aspect = uResolution.x / uResolution.y;
  vec2  p   = uv;
  p.x      *= aspect;

  float t   = uTime * 0.4;

  // Mouse adds a vortex
  vec2  mp  = uMouse;
  mp.x     *= aspect;
  vec2  dir = p - mp;
  float md  = length(dir);
  vec2  vortex = uMouseInfluence * vec2(-dir.y, dir.x) / (md * md + 0.01) * 0.004;

  // Advect sample position backward along flow to find "where did this
  // streamline come from" — gives a texture-like flow appearance
  vec2 q = p;
  for (int i = 0; i < 20; i++) {
    vec2 v = curl(q, t) + vortex;
    q -= v * 0.04;
  }

  // Speed of flow at original position (for colour)
  vec2  vel   = curl(p, t) + vortex;
  float speed = length(vel);

  // Visualise streamlines using sin-based stripe along advected coordinate
  float stripe   = sin(q.x * 30.0 + q.y * 20.0) * 0.5 + 0.5;
  float stripe2  = sin(q.x * 15.0 - q.y * 25.0 + t * 2.0) * 0.5 + 0.5;
  float pattern  = stripe * stripe2;

  // Bright particle dots along streamlines
  float particle = pow(pattern, 12.0);

  // Speed → colour: dark blue → cyan → white
  vec3 slowCol = vec3(0.02, 0.06, 0.35);
  vec3 midCol  = vec3(0.0,  0.75, 0.95);
  vec3 fastCol = vec3(0.85, 0.98, 1.0);
  float s      = clamp(speed * 4.0, 0.0, 1.0);
  vec3 flowCol = mix(slowCol, midCol,  smoothstep(0.0, 0.5, s));
  flowCol      = mix(flowCol, fastCol, smoothstep(0.5, 1.0, s));

  vec3 col     = flowCol * (0.15 + 0.85 * pattern);
  col         += fastCol * particle * 1.5;

  // Faint glow at mouse position
  float mouseGlow = exp(-md * md * 5.0) * uMouseInfluence * 0.6;
  col = mix(col, vec3(0.4, 1.0, 1.0), mouseGlow);

  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
