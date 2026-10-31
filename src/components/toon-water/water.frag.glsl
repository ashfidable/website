uniform float uTime;
uniform float uFoam;
uniform vec3 uIsland;
uniform mat4 uWaterToCrate;
varying vec2 vPosition;
varying float vHeight;
varying float vFoam;
varying float vWall;

vec2 hash(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return fract(sin(p) * 43758.5453);
}

// Voronoi border distance: the wobbling net of light on stylized water.
float caustics(vec2 p) {
  vec2 cell = floor(p);
  vec2 f = fract(p);
  float nearest = 8.0;
  float second = 8.0;
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 g = vec2(float(x), float(y));
      vec2 o = 0.5 + 0.5 * sin(uTime * 0.7 + 6.2831 * hash(cell + g));
      float d = length(g + o - f);
      if (d < nearest) {
        second = nearest;
        nearest = d;
      } else if (d < second) {
        second = d;
      }
    }
  }
  return second - nearest;
}

void main() {
  vec2 p = vPosition;

  if (vWall > 0.0) {
    // Side walls: stepped depth, with a bright lip at the surface.
    vec3 wall = mix(vec3(0.05, 0.36, 0.72), vec3(0.04, 0.55, 0.82), step(-0.95, vHeight));
    wall = mix(wall, vec3(0.1, 0.72, 0.85), step(-0.4, vHeight));
    wall = mix(wall, vec3(0.92, 1.0, 0.97), step(vWall, 0.03));
    gl_FragColor = vec4(wall, mix(0.82, 1.0, step(vWall, 0.03)));
    return;
  }

  // Hard color steps give the surface its illustrated look.
  float band = vHeight / 0.1;
  vec3 color = mix(vec3(0.03, 0.5, 0.82), vec3(0.04, 0.66, 0.86), step(-0.5, band));
  color = mix(color, vec3(0.12, 0.8, 0.84), step(0.5, band));
  color = mix(color, vec3(0.36, 0.91, 0.84), step(1.3, band));

  // The sea floor shelves up around the island.
  float shore = length(p - uIsland.xy) - uIsland.z;
  color = mix(color, vec3(0.42, 0.93, 0.8), 1.0 - step(0.42, shore));
  float alpha = mix(0.56, 0.8, smoothstep(0.0, 0.8, shore));

  // A thin net of light drifts across everything.
  vec2 warp = p + 0.2 * sin(p.yx * 2.4 + uTime * 0.5);
  float net = 1.0 - step(0.055, caustics(warp * 1.7));
  color = mix(color, vec3(0.74, 0.98, 0.92), net * 0.55);

  // The crate shades the water straight below it.
  vec3 local = (uWaterToCrate * vec4(p.x, vHeight, p.y, 1.0)).xyz;
  vec2 under = abs(local.xz) - 0.5;
  color *= 1.0 - 0.2 * step(max(under.x, under.y), 0.0) * step(local.y, -0.5);

  // Measure each displaced water fragment against the oriented crate box,
  // so a band of foam hugs the waterline wherever the two actually meet.
  vec3 q = abs(local) - vec3(0.55);
  float distanceToCrate = length(max(q, 0.0))
    + min(max(q.x, max(q.y, q.z)), 0.0);
  float noise = sin(p.x * 17.0 + uTime * 1.6) * sin(p.y * 15.0 - uTime * 1.1);
  float enabled = step(0.001, uFoam);
  float contact = 1.0 - step(uFoam * (0.14 + 0.05 * noise), distanceToCrate);

  // Foam left by the simulation: wakes, splashes, and breaking crests.
  float trail = step(0.62 - 0.62 * caustics(p * 3.4), vFoam * uFoam * 1.25);

  // Two rings lap at the beach.
  float lap = step(0.8, sin(shore * 13.0 - uTime * 1.4 + noise)) * (1.0 - step(0.34, shore));
  float beach = 1.0 - step(0.07 + 0.035 * noise, shore);

  float foam = max(contact, max(trail, max(lap, beach))) * enabled;
  color = mix(color, vec3(0.95, 1.0, 0.97), foam);
  gl_FragColor = vec4(color, max(alpha, foam));
}
