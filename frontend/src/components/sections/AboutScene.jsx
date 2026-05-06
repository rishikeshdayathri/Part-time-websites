import React, { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * AboutScene — sleek 3D background for the About section.
 *
 * Visual metaphor for "global trade network":
 *  - ~60 floating particle nodes (suppliers / buyers / hubs).
 *  - ~10 low-poly wireframe shapes (commodity units: cubes, octahedrons, icosahedrons).
 *  - Static nearest-neighbour line connections that flex as nodes drift.
 *  - Whole network rotates slowly, individual nodes bob.
 *
 * Tuned for a white section: soft brand-blue tones, low alpha, no harsh contrast.
 */
export default function AboutScene() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const getSize = () => ({
      w: Math.max(320, mount.clientWidth || 800),
      h: Math.max(320, mount.clientHeight || 500),
    });
    let { w, h } = getSize();

    // ----- Scene / camera / renderer -----
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xffffff, 14, 28);

    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    camera.position.set(0, 0, 14);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    // ----- Lights -----
    scene.add(new THREE.AmbientLight(0xffffff, 0.9));
    const key = new THREE.DirectionalLight(0x60a5fa, 0.6);
    key.position.set(4, 6, 8);
    scene.add(key);

    // ----- Network group (slowly rotates as a whole) -----
    const network = new THREE.Group();
    scene.add(network);

    // ----- Particle nodes -----
    const NODE_COUNT = 60;
    const RADIUS = 9;
    const nodes = [];
    const nodeGeom = new THREE.SphereGeometry(0.07, 14, 14);
    const nodeMat = new THREE.MeshBasicMaterial({
      color: 0x2563eb,
      transparent: true,
      opacity: 0.85,
    });
    for (let i = 0; i < NODE_COUNT; i++) {
      // Distribute roughly on a wide flat shell with some thickness
      const u = Math.random();
      const v = Math.random();
      const theta = u * Math.PI * 2;
      const phi = Math.acos(2 * v - 1);
      const r = RADIUS * (0.45 + Math.random() * 0.55);
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = (Math.random() - 0.5) * 5.5;
      const z = r * Math.sin(phi) * Math.sin(theta) * 0.55; // flatten depth
      const mesh = new THREE.Mesh(nodeGeom, nodeMat);
      mesh.position.set(x, y, z);
      mesh.userData = {
        baseY: y,
        speed: 0.3 + Math.random() * 0.5,
        phase: Math.random() * Math.PI * 2,
        amp: 0.2 + Math.random() * 0.35,
      };
      network.add(mesh);
      nodes.push(mesh);
    }

    // ----- Pulse rings around a few "hub" nodes -----
    const hubIndices = [0, 7, 14, 23, 31, 42];
    const hubRingMat = new THREE.MeshBasicMaterial({
      color: 0x60a5fa,
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide,
    });
    const hubRings = hubIndices.map((idx) => {
      const ringGeom = new THREE.RingGeometry(0.16, 0.18, 32);
      const ring = new THREE.Mesh(ringGeom, hubRingMat.clone());
      ring.position.copy(nodes[idx].position);
      ring.userData = { phase: Math.random() * Math.PI * 2 };
      network.add(ring);
      return { ring, nodeIdx: idx };
    });

    // ----- Connection lines (each node → 2 nearest neighbours) -----
    const linePairs = [];
    for (let i = 0; i < nodes.length; i++) {
      const distances = [];
      for (let j = 0; j < nodes.length; j++) {
        if (i === j) continue;
        distances.push({ j, d: nodes[i].position.distanceTo(nodes[j].position) });
      }
      distances.sort((a, b) => a.d - b.d);
      for (let k = 0; k < 2; k++) {
        const a = i;
        const b = distances[k].j;
        // de-dup — only push once per unordered pair
        const key = a < b ? `${a}-${b}` : `${b}-${a}`;
        if (!linePairs.find((p) => p.key === key)) {
          linePairs.push({ key, a, b });
        }
      }
    }

    const linePositions = new Float32Array(linePairs.length * 2 * 3);
    const lineGeom = new THREE.BufferGeometry();
    lineGeom.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x93c5fd,
      transparent: true,
      opacity: 0.35,
    });
    const lines = new THREE.LineSegments(lineGeom, lineMat);
    network.add(lines);

    // ----- Floating commodity shapes (low-poly) -----
    const shapes = [];
    const SHAPE_PRESETS = [
      () => new THREE.IcosahedronGeometry(0.55, 0),
      () => new THREE.OctahedronGeometry(0.55, 0),
      () => new THREE.BoxGeometry(0.7, 0.7, 0.7),
      () => new THREE.DodecahedronGeometry(0.55, 0),
      () => new THREE.TetrahedronGeometry(0.65, 0),
    ];
    const SHAPE_COUNT = 11;
    for (let i = 0; i < SHAPE_COUNT; i++) {
      const Geom = SHAPE_PRESETS[i % SHAPE_PRESETS.length]();
      const wireMat = new THREE.MeshBasicMaterial({
        color: 0x1e40af,
        wireframe: true,
        transparent: true,
        opacity: 0.32,
      });
      const fillMat = new THREE.MeshBasicMaterial({
        color: 0x60a5fa,
        transparent: true,
        opacity: 0.07,
      });
      const grp = new THREE.Group();
      const wireMesh = new THREE.Mesh(Geom, wireMat);
      const fillMesh = new THREE.Mesh(Geom, fillMat);
      grp.add(wireMesh);
      grp.add(fillMesh);

      const angle = (i / SHAPE_COUNT) * Math.PI * 2;
      const r = 5 + Math.random() * 4;
      grp.position.set(
        Math.cos(angle) * r,
        (Math.random() - 0.5) * 4.5,
        Math.sin(angle) * r * 0.6 - 1
      );
      grp.userData = {
        baseY: grp.position.y,
        bobAmp: 0.35 + Math.random() * 0.4,
        bobSpeed: 0.25 + Math.random() * 0.4,
        phase: Math.random() * Math.PI * 2,
        rotSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 0.4,
          (Math.random() - 0.5) * 0.5,
          (Math.random() - 0.5) * 0.3
        ),
      };
      const scale = 0.6 + Math.random() * 0.6;
      grp.scale.setScalar(scale);
      network.add(grp);
      shapes.push(grp);
    }

    // ----- Animation loop -----
    let raf = 0;
    let isVisible = true;
    let lastT = performance.now();
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!isVisible) { lastT = performance.now(); return; }
      const now = performance.now();
      const dt = Math.min(0.05, (now - lastT) / 1000);
      lastT = now;
      const elapsed = now / 1000;

      // Whole network slow Y rotation
      network.rotation.y += dt * 0.06;
      network.rotation.x = Math.sin(elapsed * 0.15) * 0.05;

      // Bob each node
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.position.y =
          n.userData.baseY +
          Math.sin(elapsed * n.userData.speed + n.userData.phase) *
            n.userData.amp;
      }

      // Update line positions
      const linePos = lineGeom.attributes.position.array;
      for (let i = 0; i < linePairs.length; i++) {
        const { a, b } = linePairs[i];
        const pa = nodes[a].position;
        const pb = nodes[b].position;
        const o = i * 6;
        linePos[o + 0] = pa.x; linePos[o + 1] = pa.y; linePos[o + 2] = pa.z;
        linePos[o + 3] = pb.x; linePos[o + 4] = pb.y; linePos[o + 5] = pb.z;
      }
      lineGeom.attributes.position.needsUpdate = true;

      // Pulse hub rings
      hubRings.forEach(({ ring, nodeIdx }) => {
        ring.position.copy(nodes[nodeIdx].position);
        const t = (elapsed * 0.6 + ring.userData.phase) % 2;
        ring.scale.setScalar(1 + t * 5);
        ring.material.opacity = Math.max(0, 0.45 * (1 - t / 2));
      });

      // Float and rotate commodity shapes
      for (let i = 0; i < shapes.length; i++) {
        const s = shapes[i];
        s.position.y =
          s.userData.baseY +
          Math.sin(elapsed * s.userData.bobSpeed + s.userData.phase) *
            s.userData.bobAmp;
        s.rotation.x += dt * s.userData.rotSpeed.x;
        s.rotation.y += dt * s.userData.rotSpeed.y;
        s.rotation.z += dt * s.userData.rotSpeed.z;
      }

      renderer.render(scene, camera);
    };
    tick();

    // ----- Resize -----
    const handleResize = () => {
      const s = getSize();
      w = s.w; h = s.h;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(handleResize);
    ro.observe(mount);
    window.addEventListener("resize", handleResize);

    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { isVisible = e.isIntersecting; }),
      { threshold: 0.01 }
    );
    io.observe(mount);
    const onVis = () => { isVisible = !document.hidden; };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", onVis);
      renderer.dispose();
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
          mats.forEach((m) => m && m.dispose && m.dispose());
        }
      });
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 pointer-events-none"
      data-testid="about-scene"
    />
  );
}
