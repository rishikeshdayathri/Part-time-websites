import React, { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * AboutScene — sleek wireframe globe (meridians + parallels), slowly rotating.
 * Light, airy, elegant — no chunky filled mesh.
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

    const camera = new THREE.PerspectiveCamera(36, w / h, 0.1, 100);
    camera.position.set(0, 0, 12);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    // ----- Globe group -----
    const globe = new THREE.Group();
    globe.position.set(3.6, 0, 0);
    globe.rotation.z = 0.2; // slight axial tilt
    scene.add(globe);

    const RADIUS = 2.4;

    // Soft inner depth sphere — barely visible, just to give the wireframe substance
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0xeff6ff,
      transparent: true,
      opacity: 0.04,
    });
    const inner = new THREE.Mesh(new THREE.SphereGeometry(RADIUS * 0.985, 48, 48), innerMat);
    globe.add(inner);

    // Parallels (lat lines) — finer, thinner
    const parallelsGeom = buildParallels(RADIUS, 11, 128);
    const parallelsMat = new THREE.LineBasicMaterial({
      color: 0x1e3a8a,
      transparent: true,
      opacity: 0.5,
    });
    const parallels = new THREE.LineSegments(parallelsGeom, parallelsMat);
    globe.add(parallels);

    // Meridians (lng lines)
    const meridiansGeom = buildMeridians(RADIUS, 18, 96);
    const meridiansMat = new THREE.LineBasicMaterial({
      color: 0x1d4ed8,
      transparent: true,
      opacity: 0.62,
    });
    const meridians = new THREE.LineSegments(meridiansGeom, meridiansMat);
    globe.add(meridians);

    // Hub markers (subtle, refined)
    const HUBS_LATLNG = [
      [17.4, 78.5],   // Hyderabad
      [25.0, 55.1],   // Jebel Ali
      [31.2, 121.5],  // Shanghai
      [1.3, 103.8],   // Singapore
      [29.8, -95.4],  // Houston
      [-23.9, -46.3], // Santos
      [-2.2, -79.9],  // Guayaquil
      [30.0, 32.5],   // Suez
    ];
    const hubColors = [
      0xfacc15, 0x60a5fa, 0xef4444, 0x10b981,
      0x60a5fa, 0xf97316, 0xa855f7, 0x22d3ee,
    ];
    const hubMeshes = [];
    HUBS_LATLNG.forEach(([lat, lng], idx) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lng + 180) * (Math.PI / 180);
      const r = RADIUS * 1.005;
      const x = -r * Math.sin(phi) * Math.cos(theta);
      const y =  r * Math.cos(phi);
      const z =  r * Math.sin(phi) * Math.sin(theta);

      // Tiny crisp dot
      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(0.038, 12, 12),
        new THREE.MeshBasicMaterial({ color: hubColors[idx] })
      );
      dot.position.set(x, y, z);
      globe.add(dot);

      // Slim pulse ring oriented outward
      const pulse = new THREE.Mesh(
        new THREE.RingGeometry(0.045, 0.058, 32),
        new THREE.MeshBasicMaterial({
          color: hubColors[idx],
          transparent: true,
          opacity: 0.55,
          side: THREE.DoubleSide,
        })
      );
      pulse.position.set(x, y, z);
      pulse.lookAt(0, 0, 0);
      pulse.userData = { phase: idx * 0.45 };
      globe.add(pulse);
      hubMeshes.push(pulse);
    });

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

      globe.rotation.y += dt * 0.16;

      hubMeshes.forEach((m) => {
        const t = (elapsed * 0.85 + m.userData.phase) % 2;
        m.scale.setScalar(1 + t * 3.4);
        m.material.opacity = Math.max(0, 0.55 * (1 - t / 2));
      });

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

/* Build horizontal latitude rings as a single LineSegments geometry. */
function buildParallels(radius, count, segments) {
  const positions = [];
  for (let p = 1; p < count; p++) {
    const phi = (p / count) * Math.PI;
    const r = Math.sin(phi) * radius;
    const y = Math.cos(phi) * radius;
    for (let s = 0; s < segments; s++) {
      const a1 = (s / segments) * Math.PI * 2;
      const a2 = ((s + 1) / segments) * Math.PI * 2;
      positions.push(Math.cos(a1) * r, y, Math.sin(a1) * r);
      positions.push(Math.cos(a2) * r, y, Math.sin(a2) * r);
    }
  }
  const geom = new THREE.BufferGeometry();
  geom.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  return geom;
}

/* Build vertical meridian half-circles as a single LineSegments geometry. */
function buildMeridians(radius, count, segments) {
  const positions = [];
  for (let m = 0; m < count; m++) {
    const angle = (m / count) * Math.PI * 2;
    for (let s = 0; s < segments; s++) {
      const phi1 = (s / segments) * Math.PI;
      const phi2 = ((s + 1) / segments) * Math.PI;
      const r1 = Math.sin(phi1) * radius;
      const r2 = Math.sin(phi2) * radius;
      const y1 = Math.cos(phi1) * radius;
      const y2 = Math.cos(phi2) * radius;
      positions.push(Math.cos(angle) * r1, y1, Math.sin(angle) * r1);
      positions.push(Math.cos(angle) * r2, y2, Math.sin(angle) * r2);
    }
  }
  const geom = new THREE.BufferGeometry();
  geom.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  return geom;
}
