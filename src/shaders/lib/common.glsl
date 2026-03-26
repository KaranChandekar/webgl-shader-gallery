#define PI 3.14159265359
#define TWO_PI 6.28318530718
#define HALF_PI 1.57079632679

vec2 normalizeUV(vec2 fragCoord, vec2 resolution) {
  return (fragCoord * 2.0 - resolution) / min(resolution.x, resolution.y);
}

vec3 hsv2rgb(vec3 c) {
  vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
  return c.z * mix(vec3(1.0), rgb, c.y);
}

mat2 rot2d(float a) {
  float s = sin(a);
  float c = cos(a);
  return mat2(c, -s, s, c);
}

float remap(float value, float inMin, float inMax, float outMin, float outMax) {
  return outMin + (outMax - outMin) * (value - inMin) / (inMax - inMin);
}
