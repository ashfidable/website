import * as THREE from "three";

export const SIZE = 6;
export const FLOOR = -1.5;
// Grid cells per side. The extra ring of vertices forms the side walls.
const N = 96;
export const SEGMENTS = N + 2;
const W = N + 3;
const DX = SIZE / N;
const STEP = 1 / 120;
const SPEED = (2.2 * STEP) / DX;
const GRAVITY = 9.8;
const LIFT = 5.2;
const WATER_DRAG = 0.9;
const CONTACT = 420;
const CONTACT_DAMPING = 11;
const GRAB = 95;
const GRAB_DAMPING = 11;
const INERTIA = 0.2;
const HALF = 0.5;

export const ISLAND = { x: -1.55, z: -1.55, radius: 1.1 };

export const isIsland = (x: number, z: number) =>
  Math.hypot(x - ISLAND.x, z - ISLAND.z) < ISLAND.radius;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function createPhysics(onSplash: (x: number, z: number, strength: number) => void) {
  const height = new Float32Array(W * W);
  const velocity = new Float32Array(W * W);
  const foam = new Float32Array(W * W);
  const land = new Uint8Array(W * W);
  const worldAt = (i: number) => (i - 1) * DX - SIZE / 2;
  let wetCells = 0;
  for (let j = 0; j < W; j++) {
    for (let i = 0; i < W; i++) {
      const outside = i === 0 || j === 0 || i === W - 1 || j === W - 1;
      land[j * W + i] = isIsland(worldAt(i), worldAt(j)) ? 1 : 0;
      if (!land[j * W + i] && !outside) wetCells++;
    }
  }

  const position = new THREE.Vector3();
  const linear = new THREE.Vector3();
  const angular = new THREE.Vector3();
  const rotation = new THREE.Quaternion();
  const corners = [-HALF, HALF].flatMap((x) =>
    [-HALF, HALF].flatMap((y) => [-HALF, HALF].map((z) => new THREE.Vector3(x, y, z))),
  );

  const grabPoint = new THREE.Vector3();
  const grabTarget = new THREE.Vector3();
  let grabbed = false;

  const force = new THREE.Vector3();
  const torque = new THREE.Vector3();
  const point = new THREE.Vector3();
  const arm = new THREE.Vector3();
  const pointVelocity = new THREE.Vector3();
  const contact = new THREE.Vector3();
  const spin = new THREE.Quaternion();

  let wasWet = false;
  let cooldown = 0;
  const state = { time: 0, waves: 0.14 };

  const baseWave = (x: number, z: number) =>
    state.waves *
    (Math.sin(x * 2.2 + state.time * 1.3) * 0.65 + Math.cos(z * 2.8 - state.time) * 0.35);

  const rippleAt = (x: number, z: number) => {
    const fx = clamp((x + SIZE / 2) / DX + 1, 1, N);
    const fz = clamp((z + SIZE / 2) / DX + 1, 1, N);
    const i = Math.floor(fx);
    const j = Math.floor(fz);
    const u = fx - i;
    const v = fz - j;
    const a = height[j * W + i] * (1 - u) + height[j * W + i + 1] * u;
    const b = height[(j + 1) * W + i] * (1 - u) + height[(j + 1) * W + i + 1] * u;
    return a * (1 - v) + b * v;
  };

  const surface = (x: number, z: number) => baseWave(x, z) + rippleAt(x, z);

  // Visits every cell within `radius` of a point, skipping the island.
  const forCells = (
    x: number,
    z: number,
    radius: number,
    visit: (index: number, dx: number, dz: number, distance: number) => void,
  ) => {
    const cx = (x + SIZE / 2) / DX + 1;
    const cz = (z + SIZE / 2) / DX + 1;
    const reach = Math.ceil(radius / DX);
    for (let j = Math.max(1, Math.floor(cz) - reach); j <= Math.min(N + 1, cz + reach); j++) {
      for (let i = Math.max(1, Math.floor(cx) - reach); i <= Math.min(N + 1, cx + reach); i++) {
        const index = j * W + i;
        if (land[index]) continue;
        const dx = worldAt(i) - x;
        const dz = worldAt(j) - z;
        const distance = Math.hypot(dx, dz);
        if (distance <= radius) visit(index, dx, dz, distance);
      }
    }
  };

  const poke = (x: number, z: number, strength: number, radius = 0.28) => {
    forCells(x, z, radius, (index, _dx, _dz, distance) => {
      const falloff = 1 - distance / radius;
      velocity[index] -= strength * falloff * falloff;
      foam[index] = Math.min(1, foam[index] + strength * 50 * falloff);
    });
  };

  const stepWater = () => {
    let total = 0;
    for (let j = 1; j <= N + 1; j++) {
      for (let i = 1; i <= N + 1; i++) {
        const index = j * W + i;
        if (land[index]) continue;
        const neighbors =
          (land[index - 1] ? height[index] : height[index - 1]) +
          (land[index + 1] ? height[index] : height[index + 1]) +
          (land[index - W] ? height[index] : height[index - W]) +
          (land[index + W] ? height[index] : height[index + W]);
        velocity[index] += SPEED * SPEED * (neighbors - 4 * height[index]);
        velocity[index] *= 0.997;
      }
    }
    for (let j = 1; j <= N + 1; j++) {
      for (let i = 1; i <= N + 1; i++) {
        const index = j * W + i;
        if (land[index]) continue;
        height[index] = clamp(height[index] + velocity[index], -0.7, 0.7);
        total += height[index];
        // Fast-moving crests whip themselves into foam.
        const churn = Math.max(0, Math.abs(velocity[index]) - 0.012) * 9;
        foam[index] = Math.min(1, foam[index] * 0.994 + churn);
      }
    }
    // Pokes and the crate add or remove water, so hold the mean level at zero.
    const mean = total / wetCells;
    for (let index = 0; index < height.length; index++) if (!land[index]) height[index] -= mean;
    // The ghost ring mirrors the edge, so ripples bounce off the walls.
    for (let k = 0; k < W; k++) {
      height[k] = height[k + W];
      height[(W - 1) * W + k] = height[(W - 2) * W + k];
      height[k * W] = height[k * W + 1];
      height[k * W + W - 1] = height[k * W + W - 2];
    }
  };

  const applyForce = (applied: THREE.Vector3) => {
    force.add(applied);
    torque.add(contact.copy(arm).cross(applied));
  };

  const pointState = (local: THREE.Vector3) => {
    arm.copy(local).applyQuaternion(rotation);
    point.copy(position).add(arm);
    pointVelocity.copy(angular).cross(arm).add(linear);
  };

  const stepCrate = () => {
    force.set(0, -GRAVITY, 0);
    torque.set(0, 0, 0);
    let wet = 0;
    const applied = new THREE.Vector3();
    for (const corner of corners) {
      pointState(corner);
      const { x, y, z } = point;
      const depth = baseWave(x, z) + rippleAt(x, z) * 0.5 - y;
      applied.set(0, 0, 0);
      if (depth > 0) {
        const submerged = Math.min(depth, 0.85);
        applied.copy(pointVelocity).multiplyScalar(-WATER_DRAG * submerged);
        applied.y += LIFT * submerged;
        wet++;
      }
      if (y < FLOOR) {
        applied.y += CONTACT * (FLOOR - y) - CONTACT_DAMPING * Math.min(pointVelocity.y, 0);
        applied.x -= pointVelocity.x * 4;
        applied.z -= pointVelocity.z * 4;
      }
      const wall = SIZE / 2 - 0.04;
      if (Math.abs(x) > wall) {
        const side = Math.sign(x);
        applied.x -=
          side *
          (CONTACT * (Math.abs(x) - wall) + CONTACT_DAMPING * Math.max(side * pointVelocity.x, 0));
      }
      if (Math.abs(z) > wall) {
        const side = Math.sign(z);
        applied.z -=
          side *
          (CONTACT * (Math.abs(z) - wall) + CONTACT_DAMPING * Math.max(side * pointVelocity.z, 0));
      }
      // The island narrows toward its peak, so a sliding crate rolls off the beach.
      const offsetX = x - ISLAND.x;
      const offsetZ = z - ISLAND.z;
      const distance = Math.hypot(offsetX, offsetZ) || 1;
      const reach = ISLAND.radius - y * (y > 0 ? 1.6 : 0.35);
      if (y < 0.45 && distance < reach) {
        const nx = offsetX / distance;
        const nz = offsetZ / distance;
        const push =
          CONTACT * (reach - distance) -
          CONTACT_DAMPING * Math.min(pointVelocity.x * nx + pointVelocity.z * nz, 0);
        applied.x += nx * push;
        applied.z += nz * push;
      }
      applyForce(applied);
    }

    if (grabbed) {
      pointState(grabPoint);
      applied
        .copy(grabTarget)
        .sub(point)
        .multiplyScalar(GRAB)
        .addScaledVector(pointVelocity, -GRAB_DAMPING)
        .clampLength(0, 90);
      applyForce(applied);
    }

    linear.addScaledVector(force, STEP);
    angular.addScaledVector(torque, STEP / INERTIA);
    angular.multiplyScalar(1 - (0.5 + wet * 0.35) * STEP);
    position.addScaledVector(linear, STEP);
    spin.set(angular.x, angular.y, angular.z, 0).multiply(rotation);
    rotation.set(
      rotation.x + spin.x * STEP * 0.5,
      rotation.y + spin.y * STEP * 0.5,
      rotation.z + spin.z * STEP * 0.5,
      rotation.w + spin.w * STEP * 0.5,
    );
    rotation.normalize();

    // Waves shove the crate downhill while it floats.
    if (wet > 0) {
      const slopeX = surface(position.x + DX, position.z) - surface(position.x - DX, position.z);
      const slopeZ = surface(position.x, position.z + DX) - surface(position.x, position.z - DX);
      const shove = (GRAVITY * 0.6 * (wet / 8) * STEP) / (2 * DX);
      linear.x -= slopeX * shove;
      linear.z -= slopeZ * shove;
      // A faint current brings a drifting crate back to open water.
      if (!grabbed) {
        linear.x -= (position.x - 0.5) * 0.35 * STEP;
        linear.z -= (position.z - 0.5) * 0.35 * STEP;
      }
    }

    const level = surface(position.x, position.z);
    if (Math.abs(position.y - level) < 0.85) {
      // The crate pushes the water it moves through: down under it as it
      // sinks, up in front and down behind as it slides.
      // Slow drift stays out of this, or the crate and water feed each other.
      const moving = Math.hypot(linear.x, linear.y, linear.z);
      const push = Math.max(0, moving - 0.7) / (moving || 1);
      if (push > 0) {
        forCells(position.x, position.z, 0.72, (index, dx, dz, distance) => {
          const lead = (dx * linear.x + dz * linear.z) * 1.6;
          velocity[index] += (linear.y + lead) * push * STEP * 0.012;
          if (distance > 0.5) foam[index] = Math.min(1, foam[index] + push * moving * 0.01);
        });
      }
    }

    cooldown -= STEP;
    const isWet = wet > 0;
    const speed = linear.length();
    if (cooldown <= 0 && isWet !== wasWet && speed > (isWet ? 1.6 : 2.6)) {
      const strength = clamp(speed / 8, 0.2, 1);
      poke(position.x, position.z, strength * 0.012, 0.8);
      onSplash(position.x, position.z, strength);
      cooldown = 0.25;
    }
    wasWet = isWet;
  };

  const place = (x: number, y: number, z: number) => {
    position.set(x, y, z);
    linear.set(0, 0, 0);
    angular.set(0, 0, 0);
    rotation.setFromEuler(new THREE.Euler(0, 0.2, 0));
    grabbed = false;
  };

  return {
    STEP,
    height,
    foam,
    position,
    rotation,
    state,
    surface,
    poke,
    place,
    step() {
      state.time += STEP;
      stepCrate();
      stepWater();
    },
    drop(x: number, z: number) {
      place(x, 3, z);
      angular.set(Math.random() * 3 - 1.5, Math.random() * 2 - 1, Math.random() * 3 - 1.5);
    },
    grab(worldPoint: THREE.Vector3) {
      grabPoint.copy(worldPoint).sub(position).applyQuaternion(rotation.clone().invert());
      grabTarget.copy(worldPoint);
      grabbed = true;
    },
    moveGrab(worldPoint: THREE.Vector3) {
      grabTarget.set(
        clamp(worldPoint.x, -2.4, 2.4),
        clamp(worldPoint.y, FLOOR + 0.2, 3.4),
        clamp(worldPoint.z, -2.4, 2.4),
      );
    },
    release() {
      grabbed = false;
    },
  };
}
