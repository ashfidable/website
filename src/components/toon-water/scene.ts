import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import vertexShader from "./water.vert.glsl?raw";
import fragmentShader from "./water.frag.glsl?raw";
import { createPhysics, FLOOR, ISLAND, isIsland, SEGMENTS, SIZE } from "./physics";

const VIEW = new THREE.Vector3(8.6, 6.6, 10);
const DROPLETS = 90;

export function createWaterScene(host: HTMLDivElement) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.shadowMap.enabled = true;
  const canvas = renderer.domElement;
  canvas.setAttribute("role", "img");
  canvas.setAttribute("aria-label", "Wooden crate floating in a lagoon beside a small palm island");
  host.appendChild(canvas);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.copy(VIEW);

  // Tones for every toon material: three flat steps of light.
  const tones = new THREE.DataTexture(new Uint8Array([120, 195, 255]), 3, 1, THREE.RedFormat);
  tones.minFilter = tones.magFilter = THREE.NearestFilter;
  tones.needsUpdate = true;
  const toon = (color: number, flatShading = false) =>
    Object.assign(new THREE.MeshToonMaterial({ color, gradientMap: tones }), { flatShading });

  scene.add(new THREE.HemisphereLight(0xf2fffb, 0x7fc4d8, 2));
  const sun = new THREE.DirectionalLight(0xfff0d8, 2.6);
  sun.position.set(-4, 9, 5);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.bias = -0.002;
  Object.assign(sun.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6, near: 1, far: 22 });
  scene.add(sun);

  const box = (
    w: number,
    h: number,
    d: number,
    color: number,
    parent: THREE.Object3D,
    x = 0,
    y = 0,
    z = 0,
  ) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), toon(color));
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    parent.add(mesh);
    return mesh;
  };

  // The sea floor and the block the whole diorama sits on.
  const sand = box(SIZE, 0.3, SIZE, 0xffdf9e, scene, 0, FLOOR - 0.15);
  sand.castShadow = false;
  sand.receiveShadow = true;
  box(SIZE + 0.24, 0.5, SIZE + 0.24, 0xf0b56a, scene, 0, FLOOR - 0.5).castShadow = false;

  const island = new THREE.Mesh(
    new THREE.LatheGeometry(
      [
        [1.4, FLOOR],
        [1.3, -0.7],
        [1.1, -0.02],
        [0.9, 0.2],
        [0.5, 0.36],
        [0, 0.4],
      ].map(([x, y]) => new THREE.Vector2(x, y)),
      28,
    ),
    toon(0xffe2a0, true),
  );
  island.position.set(ISLAND.x, 0, ISLAND.z);
  island.castShadow = island.receiveShadow = true;
  scene.add(island);

  for (const [x, y, z, size, color] of [
    [0.74, 0.14, 0.36, 0.22, 0x9aa8b8],
    [0.5, 0.1, 0.62, 0.13, 0xb7c3d0],
    [1.6, -1.42, -1.9, 0.3, 0x6d8fa8],
    [2.1, -1.42, -1.5, 0.18, 0x7fa3ba],
    [-1.9, -1.42, 1.7, 0.26, 0xff8f7a],
    [-1.55, -1.42, 2.1, 0.17, 0xffb07a],
  ]) {
    const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(size), toon(color, true));
    rock.position.set(x + (y > 0 ? ISLAND.x : 0), y, z + (y > 0 ? ISLAND.z : 0));
    rock.rotation.set(x * 3, z * 2, 0);
    rock.castShadow = true;
    scene.add(rock);
  }

  const palm = new THREE.Group();
  palm.position.set(ISLAND.x - 0.08, 0.3, ISLAND.z - 0.08);
  scene.add(palm);
  const crown = new THREE.Vector3(0.42, 1.62, 0.28);
  const trunk = new THREE.Mesh(
    new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(),
        new THREE.Vector3(0.04, 0.6, 0.02),
        new THREE.Vector3(0.18, 1.2, 0.12),
        crown,
      ]),
      10,
      0.07,
      6,
    ),
    toon(0xb97a48, true),
  );
  trunk.castShadow = true;
  palm.add(trunk);

  // Leaves taper and droop by bending a plane along its length.
  const leafGeometry = new THREE.PlaneGeometry(0.42, 1.25, 1, 6);
  leafGeometry.translate(0, 0.625, 0);
  leafGeometry.rotateX(Math.PI / 2);
  const leafShape = leafGeometry.attributes.position;
  for (let i = 0; i < leafShape.count; i++) {
    const along = leafShape.getZ(i) / 1.25;
    leafShape.setX(i, leafShape.getX(i) * Math.sin(Math.min(along + 0.08, 1) * Math.PI));
    leafShape.setY(i, 0.22 * along - 0.72 * along * along);
  }
  leafGeometry.computeVertexNormals();
  const leafMaterials = [toon(0x3fbf6e, true), toon(0x57d67e, true)];
  leafMaterials.forEach((material) => (material.side = THREE.DoubleSide));
  const leaves = new THREE.Group();
  leaves.position.copy(crown);
  palm.add(leaves);
  for (let i = 0; i < 7; i++) {
    const leaf = new THREE.Mesh(leafGeometry, leafMaterials[i % 2]);
    leaf.rotation.y = (i / 7) * Math.PI * 2;
    leaf.castShadow = true;
    leaves.add(leaf);
  }
  for (const [x, z] of [
    [0.09, 0.05],
    [-0.08, 0.08],
    [0, -0.1],
  ]) {
    const coconut = new THREE.Mesh(new THREE.SphereGeometry(0.075, 8, 6), toon(0x7a4a2c));
    coconut.position.set(crown.x + x, crown.y - 0.08, crown.z + z);
    palm.add(coconut);
  }

  const crate = new THREE.Group();
  scene.add(crate);
  box(0.98, 0.98, 0.98, 0xb85b27, crate);
  // Slats and raised battens remain readable at this small scale.
  for (const side of [-1, 1]) {
    for (let i = -1; i <= 1; i++) {
      box(0.29, 0.9, 0.035, 0xe68b3b, crate, i * 0.31, 0, side * 0.5);
      box(0.035, 0.9, 0.29, 0xd87b30, crate, side * 0.5, 0, i * 0.31);
      box(0.29, 0.035, 0.96, 0xf3aa52, crate, i * 0.31, side * 0.5, 0);
    }
    for (const y of [-0.37, 0.37]) {
      box(1.1, 0.13, 0.09, 0xffba66, crate, 0, y, side * 0.54);
      box(0.09, 0.13, 1.1, 0xf3a34d, crate, side * 0.54, y, 0);
    }
    const brace = box(0.12, 1.04, 0.07, 0xffba66, crate, 0, 0, side * 0.56);
    brace.rotation.z = -Math.PI / 4;
  }

  const droplets = new THREE.InstancedMesh(
    new THREE.IcosahedronGeometry(0.075, 0),
    new THREE.MeshBasicMaterial({ color: 0xf2fffb }),
    DROPLETS,
  );
  droplets.frustumCulled = false;
  scene.add(droplets);
  const drops = Array.from({ length: DROPLETS }, () => ({
    position: new THREE.Vector3(),
    velocity: new THREE.Vector3(),
    size: 0,
  }));
  let nextDrop = 0;
  const spray = (x: number, z: number, y: number, count: number, reach: number, lift: number) => {
    for (let i = 0; i < Math.round(count * Math.min(uniforms.uFoam.value * 1.4, 1)); i++) {
      const drop = drops[nextDrop++ % DROPLETS];
      const angle = Math.random() * Math.PI * 2;
      const out = 0.4 + Math.random() * 0.6;
      drop.position.set(x + Math.cos(angle) * reach, y, z + Math.sin(angle) * reach);
      drop.velocity.set(
        Math.cos(angle) * out * 2,
        lift * (0.55 + Math.random() * 0.45),
        Math.sin(angle) * out * 2,
      );
      drop.size = 0.6 + Math.random() * 0.8;
    }
  };

  const uniforms = {
    uTime: { value: 0 },
    uWaves: { value: 0.14 },
    uFoam: { value: 0.8 },
    uIsland: { value: new THREE.Vector3(ISLAND.x, ISLAND.z, ISLAND.radius) },
    uWaterToCrate: { value: new THREE.Matrix4() },
  };
  const physics = createPhysics((x, z, strength) => {
    spray(x, z, physics.surface(x, z) + 0.05, 14 + strength * 30, 0.6, 3 + strength * 3.5);
  });
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) physics.place(0.7, -0.05, 0.8);
  else physics.drop(0.7, 0.8);

  // One grid, folded: its outer ring drops to the floor to make the walls.
  const geometry = new THREE.PlaneGeometry(SIZE, SIZE, SEGMENTS, SEGMENTS);
  geometry.rotateX(-Math.PI / 2);
  const shape = geometry.attributes.position;
  const last = SEGMENTS;
  for (let j = 0; j <= last; j++) {
    for (let i = 0; i <= last; i++) {
      const index = j * (last + 1) + i;
      const cell = SIZE / (last - 2);
      shape.setXYZ(
        index,
        (Math.min(Math.max(i - 1, 0), last - 2) - (last - 2) / 2) * cell,
        i === 0 || j === 0 || i === last || j === last ? FLOOR : 0,
        (Math.min(Math.max(j - 1, 0), last - 2) - (last - 2) / 2) * cell,
      );
    }
  }
  const rippleAttribute = new THREE.BufferAttribute(physics.height, 1);
  const foamAttribute = new THREE.BufferAttribute(physics.foam, 1);
  rippleAttribute.setUsage(THREE.DynamicDrawUsage);
  foamAttribute.setUsage(THREE.DynamicDrawUsage);
  geometry.setAttribute("aRipple", rippleAttribute);
  geometry.setAttribute("aFoam", foamAttribute);
  const water = new THREE.Mesh(
    geometry,
    new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms, transparent: true }),
  );
  water.frustumCulled = false;
  scene.add(water);

  const controls = new OrbitControls(camera, canvas);
  controls.target.set(0, -0.35, 0);
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.enableDamping = true;
  controls.minPolarAngle = 0.35;
  controls.maxPolarAngle = 1.38;
  controls.update();

  let paused = reduceMotion;
  let visible = true;
  let previous = performance.now();
  let pending = 0;

  const render = () => {
    const time = physics.state.time;
    crate.position.copy(physics.position);
    crate.quaternion.copy(physics.rotation);
    leaves.rotation.z = Math.sin(time * 1.1) * 0.05;
    leaves.rotation.x = Math.cos(time * 0.8) * 0.04;
    uniforms.uTime.value = time;
    rippleAttribute.needsUpdate = true;
    foamAttribute.needsUpdate = true;
    crate.updateMatrixWorld(true);
    water.updateMatrixWorld(true);
    uniforms.uWaterToCrate.value.copy(crate.matrixWorld).invert().multiply(water.matrixWorld);
    renderer.render(scene, camera);
  };

  const pose = new THREE.Object3D();
  const stepDrops = (dt: number) => {
    drops.forEach((drop, index) => {
      if (drop.size > 0) {
        drop.velocity.y -= 9.8 * dt;
        drop.position.addScaledVector(drop.velocity, dt);
        const { x, y, z } = drop.position;
        const offShore = Math.abs(x) > SIZE / 2 || Math.abs(z) > SIZE / 2 || isIsland(x, z);
        if (drop.velocity.y < 0 && (y < physics.surface(x, z) || y < FLOOR)) {
          if (!offShore) physics.poke(x, z, 0.0006, 0.16);
          drop.size = 0;
        }
      }
      pose.position.copy(drop.position);
      pose.scale.setScalar(drop.size);
      pose.updateMatrix();
      droplets.setMatrixAt(index, pose.matrix);
    });
    droplets.instanceMatrix.needsUpdate = true;
  };

  const resize = new ResizeObserver(() => {
    const width = host.clientWidth;
    const height = host.clientHeight;
    if (!width || !height) return;
    camera.aspect = width / height;
    // Pull back on narrow screens so the whole diorama stays in frame.
    camera.fov = camera.aspect < 1.3 ? 30 * (1.3 / camera.aspect) ** 0.8 : 30;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    render();
  });
  resize.observe(host);
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
  });
  observer.observe(host);
  controls.addEventListener("change", render);

  // A capture listener runs ahead of OrbitControls, so grabbing the crate can
  // switch orbiting off for that drag and leave it on everywhere else.
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const dragPlane = new THREE.Plane();
  const waterPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const hitPoint = new THREE.Vector3();
  const facing = new THREE.Vector3();
  let dragging = false;
  let tap: { x: number; y: number } | null = null;
  const aim = (event: PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    pointer.set(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1,
    );
    raycaster.setFromCamera(pointer, camera);
  };
  const onDown = (event: PointerEvent) => {
    if (paused || event.button !== 0) return;
    aim(event);
    const hit = raycaster.intersectObject(crate, true)[0];
    if (!hit) {
      tap = { x: event.clientX, y: event.clientY };
      return;
    }
    // Drag across an upright plane facing the camera, so up on screen is up.
    camera.getWorldDirection(facing).setY(0).normalize();
    dragPlane.setFromNormalAndCoplanarPoint(facing, hit.point);
    physics.grab(hit.point);
    controls.enabled = false;
    dragging = true;
    canvas.style.cursor = "grabbing";
    canvas.setPointerCapture(event.pointerId);
  };
  const onMove = (event: PointerEvent) => {
    aim(event);
    if (dragging) {
      if (raycaster.ray.intersectPlane(dragPlane, hitPoint)) physics.moveGrab(hitPoint);
    } else if (event.buttons === 0) {
      canvas.style.cursor = raycaster.intersectObject(crate, true).length ? "grab" : "";
    }
  };
  const onUp = (event: PointerEvent) => {
    if (dragging) {
      physics.release();
      dragging = false;
      controls.enabled = true;
      canvas.style.cursor = "grab";
    } else if (tap && Math.hypot(event.clientX - tap.x, event.clientY - tap.y) < 6) {
      aim(event);
      if (raycaster.ray.intersectPlane(waterPlane, hitPoint)) {
        const { x, z } = hitPoint;
        if (Math.abs(x) < SIZE / 2 && Math.abs(z) < SIZE / 2 && !isIsland(x, z)) {
          physics.poke(x, z, 0.014, 0.34);
          spray(x, z, 0.05, 12, 0.08, 4.5);
        }
      }
    }
    tap = null;
  };
  canvas.addEventListener("pointerdown", onDown, true);
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointercancel", onUp);

  renderer.setAnimationLoop((now) => {
    const dt = Math.min((now - previous) / 1000, 0.05);
    previous = now;
    controls.update();
    if (!visible || document.hidden || paused) return;
    pending += dt;
    while (pending >= physics.STEP) {
      physics.step();
      pending -= physics.STEP;
    }
    stepDrops(dt);
    render();
  });

  return {
    setWaves(value: number) {
      uniforms.uWaves.value = value;
      physics.state.waves = value;
      render();
    },
    setFoam(value: number) {
      uniforms.uFoam.value = value;
      render();
    },
    setPaused(value: boolean) {
      paused = value;
    },
    drop() {
      physics.drop(Math.random() * 3 - 1, Math.random() * 3 - 1);
      render();
    },
    resetView() {
      camera.position.copy(VIEW);
      controls.update();
      render();
    },
    dispose() {
      renderer.setAnimationLoop(null);
      resize.disconnect();
      observer.disconnect();
      controls.dispose();
      canvas.removeEventListener("pointerdown", onDown, true);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => material.dispose());
        }
      });
      tones.dispose();
      renderer.dispose();
      canvas.remove();
    },
  };
}
