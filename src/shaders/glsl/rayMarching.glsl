precision highp float;

uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform float uMouseInfluence;

// --- SDF primitives ---
float sdSphere(vec3 p, float r) { return length(p) - r; }

// Smooth minimum (exponential)
float smin(float a, float b, float k) {
  float res = exp2(-k * a) + exp2(-k * b);
  return -log2(res) / k;
}

// Scene SDF — blend multiple spheres
float map(vec3 p) {
  float t = uTime * 0.5;

  vec3 p1 = vec3(sin(t * 1.3) * 1.2,  cos(t * 0.9) * 0.7,  0.0);
  vec3 p2 = vec3(cos(t * 0.7) * 1.1, -sin(t * 1.1) * 0.8,  sin(t) * 0.5);
  vec3 p3 = vec3(sin(t * 0.5) * 0.6,  sin(t * 1.7) * 1.0, -cos(t * 0.8) * 0.4);
  vec3 p4 = vec3(-cos(t * 1.1) * 0.9, cos(t * 0.6) * 0.5,  sin(t * 1.2) * 0.9);

  // Mouse tilts the whole scene slightly
  vec2 mouseOff = (uMouse - 0.5) * uMouseInfluence * 0.8;
  mat3 rotY = mat3(cos(mouseOff.x), 0.0, sin(mouseOff.x),
                   0.0,             1.0, 0.0,
                  -sin(mouseOff.x), 0.0, cos(mouseOff.x));
  mat3 rotX = mat3(1.0, 0.0,           0.0,
                   0.0, cos(mouseOff.y), -sin(mouseOff.y),
                   0.0, sin(mouseOff.y),  cos(mouseOff.y));
  p = rotY * rotX * p;

  float d = sdSphere(p - p1, 0.55);
  d = smin(d, sdSphere(p - p2, 0.50), 8.0);
  d = smin(d, sdSphere(p - p3, 0.45), 8.0);
  d = smin(d, sdSphere(p - p4, 0.40), 8.0);
  return d;
}

// Central-difference normal
vec3 calcNormal(vec3 p) {
  vec2 e = vec2(0.001, 0.0);
  return normalize(vec3(map(p + e.xyy) - map(p - e.xyy),
                        map(p + e.yxy) - map(p - e.yxy),
                        map(p + e.yyx) - map(p - e.yyx)));
}

// Soft shadows
float softShadow(vec3 ro, vec3 rd, float mint, float maxt, float k) {
  float res = 1.0;
  float t   = mint;
  for (int i = 0; i < 32; i++) {
    float h = map(ro + rd * t);
    if (h < 0.001) return 0.0;
    res = min(res, k * h / t);
    t  += clamp(h, 0.01, 0.5);
    if (t > maxt) break;
  }
  return clamp(res, 0.0, 1.0);
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution.xy) / uResolution.y;

  // Camera
  vec3 ro  = vec3(0.0, 0.0, 4.0);
  vec3 rd  = normalize(vec3(uv, -1.5));
  vec3 col = vec3(0.0);

  // Ray march
  float t   = 0.0;
  bool  hit = false;
  for (int i = 0; i < 96; i++) {
    vec3  p = ro + rd * t;
    float d = map(p);
    if (d < 0.001) { hit = true; break; }
    if (t > 12.0)  break;
    t += d;
  }

  if (hit) {
    vec3 p = ro + rd * t;
    vec3 n = calcNormal(p);

    // Light direction
    vec3 ld  = normalize(vec3(1.5, 2.0, 2.5));
    vec3 ldc = normalize(vec3(-1.0, -0.5, 0.0)); // fill

    float diff  = clamp(dot(n, ld),  0.0, 1.0);
    float diff2 = clamp(dot(n, ldc), 0.0, 1.0) * 0.2;

    // Soft shadow
    float sha = softShadow(p + n * 0.01, ld, 0.01, 6.0, 16.0);

    // Fresnel-based specular
    vec3  h     = normalize(ld - rd);
    float spec  = pow(clamp(dot(n, h), 0.0, 1.0), 64.0);
    float fres  = pow(1.0 - clamp(dot(-rd, n), 0.0, 1.0), 4.0);

    // Metallic silver base
    vec3 baseCol  = vec3(0.75, 0.72, 0.78);
    // Purple ambient shadow
    vec3 ambient  = vec3(0.08, 0.04, 0.18);
    // Cyan rim
    vec3 rimCol   = vec3(0.1, 0.95, 0.95) * fres * 1.5;

    col  = ambient;
    col += baseCol * diff * sha;
    col += baseCol * diff2;
    col += vec3(1.0, 0.95, 0.9) * spec * sha * 0.8;
    col += rimCol;
  } else {
    // Background — deep space gradient
    col = mix(vec3(0.01, 0.01, 0.06), vec3(0.05, 0.02, 0.12), uv.y * 0.5 + 0.5);
    // Subtle stars
    vec2 st  = gl_FragCoord.xy;
    float s  = fract(sin(dot(floor(st / 3.0), vec2(127.1, 311.7))) * 43758.5453);
    float sb = step(0.97, s);
    col += sb * vec3(0.6, 0.7, 1.0) * 0.5;
  }

  // Gamma
  col = pow(clamp(col, 0.0, 1.0), vec3(0.4545));
  gl_FragColor = vec4(col, 1.0);
}
