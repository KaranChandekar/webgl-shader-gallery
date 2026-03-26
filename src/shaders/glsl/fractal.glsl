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
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution.xy) / uResolution.y;

  // Zoom / pan driven by time
  float zoom   = exp(-uTime * 0.08);
  vec2  center = vec2(-0.7269, 0.1889);

  // Mouse shifts the pan
  vec2 mouseOff = (uMouse - 0.5) * uMouseInfluence * 0.4;
  center += mouseOff * zoom;

  vec2 c = uv * zoom * 2.5 + center;

  // Mandelbrot iteration — smooth coloring
  vec2   z     = vec2(0.0);
  float  iter  = 0.0;
  const int MAX = 128;

  for (int i = 0; i < MAX; i++) {
    z    = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
    iter = float(i);
    if (dot(z, z) > 4.0) break;
  }

  if (dot(z, z) <= 4.0) {
    // Interior — deep dark colour
    gl_FragColor = vec4(0.0, 0.0, 0.02, 1.0);
    return;
  }

  // Smooth escape-time value
  float log2z  = log(dot(z, z)) * 0.5;
  float nu     = log(log2z / log(2.0)) / log(2.0);
  float smooth = iter + 1.0 - nu;

  // Normalise and add time-based cycling
  float t = smooth / float(MAX);
  float h = t * 3.0 + uTime * 0.05;   // hue cycles over time

  // Three-band palette: vivid HSV cycling
  vec3 col;
  col  = hsv2rgb(vec3(fract(h),         0.9, 1.0  )) * (1.0 - t);
  col += hsv2rgb(vec3(fract(h + 0.33),  0.8, 0.85 )) * t * (1.0 - t) * 4.0;
  col += hsv2rgb(vec3(fract(h + 0.66),  0.7, 0.6  )) * t * t;

  // Boost saturation near boundary
  float edgeBright = exp(-t * 8.0) * 0.8;
  col += edgeBright * hsv2rgb(vec3(fract(h + 0.15), 1.0, 1.0));

  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
