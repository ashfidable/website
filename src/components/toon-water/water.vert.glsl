uniform float uTime;
uniform float uWaves;
attribute float aRipple;
attribute float aFoam;
varying vec2 vPosition;
varying float vHeight;
varying float vFoam;
varying float vWall;

void main() {
  vec3 p = position;
  vPosition = p.xz;
  vFoam = aFoam;
  // Rim vertices hang down to the sea floor and form the side walls.
  vWall = step(p.y, -0.01);
  if (vWall < 0.5) {
    p.y = aRipple + uWaves * (sin(p.x * 2.2 + uTime * 1.3) * 0.65
      + cos(p.z * 2.8 - uTime) * 0.35);
  }
  vHeight = p.y;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}
