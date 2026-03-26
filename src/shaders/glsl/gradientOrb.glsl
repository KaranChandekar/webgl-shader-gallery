precision highp float;

uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform float uMouseInfluence;

// Sphere SDF
float sdSphere(vec3 p, float r) { return length(p) - r; }

// Rotation matrices
mat3 rotY(float a) {
  float c = cos(a), s = sin(a);
  return mat3(c, 0.0, s, 0.0, 1.0, 0.0, -s, 0.0, c);
}
mat3 rotX(float a) {
  float c = cos(a), s = sin(a);
  return mat3(1.0, 0.0, 0.0, 0.0, c, -s, 0.0, s, c);
}

// HSV → RGB
vec3 hsv2rgb(vec3 c) {
  vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
  return c.z * mix(vec3(1.0), rgb, c.y);
}

// Subtle procedural bump on the sphere surface
float bump(vec3 p) {
  // sin-based bands that rotate with time
  float lat = asin(p.y / length(p));
  float lon = atan(p.z, p.x) + uTime * 0.4;
  return 0.015 * (sin(lon * 8.0) * cos(lat * 6.0) + sin(lat * 10.0) * 0.5);
}

void main() {
  vec2  uv  = (gl_FragCoord.xy - 0.5 * uResolution.xy) / uResolution.y;

  // Camera
  vec3 ro   = vec3(0.0, 0.0, 3.5);
  vec3 rd   = normalize(vec3(uv, -1.8));

  // Mouse slightly tilts the sphere
  float mx  = (uMouse.x - 0.5) * uMouseInfluence * 1.6;
  float my  = (uMouse.y - 0.5) * uMouseInfluence * 1.0;

  // Sphere radius & position
  float R   = 1.0;
  vec3  sc  = vec3(0.0);

  // Analytic ray-sphere intersection
  vec3  oc  = ro - sc;
  float b   = dot(oc, rd);
  float c_  = dot(oc, oc) - R * R;
  float dis = b * b - c_;

  vec3 col  = vec3(0.0);

  if (dis >= 0.0) {
    float t   = -b - sqrt(dis);
    if (t < 0.0) t = -b + sqrt(dis);
    vec3  p   = ro + rd * t;
    vec3  n   = normalize(p - sc);

    // Rotate surface normal to simulate orb rotation
    float rotAngle = uTime * 0.5;
    n = rotY(rotAngle + mx) * rotX(my) * n;

    // UV on sphere surface (spherical coords)
    float u_s = atan(n.z, n.x) / (2.0 * 3.14159265) + 0.5;
    float v_s = asin(clamp(n.y, -1.0, 1.0)) / 3.14159265 + 0.5;

    // --- Gradient: Purple → Blue → Cyan based on latitude + longitude ---
    float hue = mix(0.72, 0.55, v_s);           // purple → blue top-to-bottom
    hue       = mix(hue,  0.50, u_s * 0.3);     // slight cyan shift on one side
    hue       = fract(hue + 0.05 * sin(uTime * 0.2)); // gentle hue drift
    vec3 baseCol = hsv2rgb(vec3(hue, 0.85, 0.9));

    // Bump perturbs shading normal slightly
    float bumpVal = bump(n);
    vec3  bn      = normalize(n + vec3(bumpVal));

    // Lighting
    vec3 ld    = normalize(vec3(1.2, 1.5, 1.8));

    // Diffuse (Lambertian)
    float diff = clamp(dot(bn, ld), 0.0, 1.0);

    // Blinn-Phong specular
    vec3  h_   = normalize(ld - rd);
    float spec = pow(clamp(dot(bn, h_), 0.0, 1.0), 128.0);

    // Fresnel rim lighting
    float rim  = pow(1.0 - clamp(dot(-rd, n), 0.0, 1.0), 3.5);

    // Ambient occlusion approximation from poles
    float ao   = 0.5 + 0.5 * n.y;

    // Compose
    vec3 ambient = vec3(0.04, 0.02, 0.10) * ao;
    col  = ambient;
    col += baseCol * diff * 0.9;
    col += vec3(0.9, 0.95, 1.0) * spec * 1.2;   // white-ish specular highlight
    col += vec3(0.1, 0.8, 1.0) * rim * 0.8;     // cyan rim

    // Gloss layer from second light (fill, warm)
    vec3  ld2   = normalize(vec3(-0.8, -0.3, 0.5));
    float diff2 = clamp(dot(bn, ld2), 0.0, 1.0) * 0.25;
    col += baseCol * diff2 * vec3(1.0, 0.85, 0.7);

  } else {
    // Background — dark gradient
    float bg = length(uv);
    col = mix(vec3(0.02, 0.01, 0.06), vec3(0.0), smoothstep(0.4, 1.4, bg));

    // Subtle nebula-like glow behind orb
    float nebula = exp(-bg * bg * 2.0) * 0.15;
    col += vec3(0.3, 0.1, 0.6) * nebula;
  }

  // Tone-map + gamma
  col  = col / (col + 0.8);                     // simple Reinhard
  col  = pow(clamp(col, 0.0, 1.0), vec3(0.4545));

  gl_FragColor = vec4(col, 1.0);
}
