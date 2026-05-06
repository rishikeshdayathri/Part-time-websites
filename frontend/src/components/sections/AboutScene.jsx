import React, { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * AboutScene — a single elegant rotating 3D globe.
 * Sits to the right of the section as a quiet visual anchor.
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

    const camera = new THREE.PerspectiveCamera(38, w / h, 0.1, 100);
    camera.position.set(0, 0, 12);
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
    scene.add(new THREE.AmbientLight(0xffffff, 0.95));
    const key = new THREE.DirectionalLight(0x60a5fa, 0.6);
    key.position.set(4, 5, 6);
    scene.add(key);

    // ----- Globe group (positioned right side of canvas) -----
    const globe = new THREE.Group();
    globe.position.set(3.6, 0, 0);
    scene.add(globe);

    const RADIUS = 2.4;

    // 1) Solid sphere — soft brand-blue fill with subtle gradient feel
    const solidGeom = new THREE.IcosahedronGeometry(RADIUS, 6);
    const solidMat = new THREE.MeshPhongMaterial({
      color: 0xeff6ff,
      emissive: 0x1d4ed8,
      emissiveIntensity: 0.08,
      shininess: 25,
      specular: 0x60a5fa,
      transparent: true,
      opacity: 0.85,
    });
    const solid = new THREE.Mesh(solidGeom, solidMat);
    globe.add(solid);

    // 2) Wireframe overlay — meridians & parallels feel
    const wireGeom = new THREE.IcosahedronGeometry(RADIUS * 1.005, 3);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x2563eb,
      wireframe: true,
      transparent: true,
      opacity: 0.45,
    });
    const wire = new THREE.Mesh(wireGeom, wireMat);
    globe.add(wire);

    // 3) Equator & rotation axis rings
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x60a5fa,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
    });
    const equator = new THREE.Mesh(new THREE.RingGeometry(RADIUS * 1.04, RADIUS * 1.05, 96), ringMat);
    equator.rotation.x = Math.PI / 2;
    globe.add(equator);

    const tilted = new THREE.Mesh(new THREE.RingGeometry(RADIUS * 1.07, RADIUS * 1.08, 96), ringMat.clone());
    tilted.rotation.x = Math.PI / 2;
    tilted.rotation.z = Math.PI / 6;
    tilted.material.opacity = 0.32;
    globe.add(tilted);

    // 4) Hub markers on globe surface (small dots that travel with the globe)
    const HUBS_LATLNG = [
      [17.4, 78.5],   // Hyderabad
      [25.0, 55.1],   // Jebel Ali (UAE)
      [31.2, 121.5],  // Shanghai
      [1.3, 103.8],   // Singapore
      [29.8, -95.4],  // Houston
      [-23.9, -46.3], // Santos
      [-2.2, -79.9],  // Guayaquil
      [30.0, 32.5],   // Suez
    ];
    const hubColors = [0xfacc15, 0x60a5fa, 0xef4444, 0x10b981, 0x60a5fa, 0xf97316, 0xa855f7, 0x22d3ee];
    const hubMeshes = [];
    HUBS_LATLNG.forEach(([lat, lng], idx) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lng + 180) * (Math.PI / 180);
      const r = RADIUS * 1.02;
      const x = -r * Math.sin(phi) * Math.cos(theta);
      const y =  r * Math.cos(phi);
      const z =  r * Math.sin(phi) * Math.sin(theta);

      const dotMat = new THREE.MeshBasicMaterial({ color: hubColors[idx] });
      const dot = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 12), dotMat);
      dot.position.set(x, y, z);
      globe.add(dot);

      // Outer pulse ring at hub location, oriented to face outward
      const pulseMat = new THREE.MeshBasicMaterial({
        color: hubColors[idx],
        transparent: true,
        opacity: 0.7,
        side: THREE.DoubleSide,
      });
      const pulse = new THREE.Mesh(new THREE.RingGeometry(0.06, 0.085, 24), pulseMat);
      pulse.position.set(x, y, z);
      pulse.lookAt(0, 0, 0);
      pulse.userData = { phase: idx * 0.4 };
      globe.add(pulse);
      hubMeshes.push(pulse);
    });

    // 5) Outer atmospheric halo
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0x60a5fa,
      transparent: true,
      opacity: 0.06,
      side: THREE.BackSide,
    });
    const halo = new THREE.Mesh(new THREE.SphereGeometry(RADIUS * 1.18, 48, 48), haloMat);
    globe.add(halo);

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

      // Slow global rotation
      globe.rotation.y += dt * 0.18;
      globe.rotation.x = Math.sin(elapsed * 0.18) * 0.07;

      // Counter-rotate the wireframe slightly for visual depth
      wire.rotation.y -= dt * 0.05;

      // Pulse hub rings
      hubMeshes.forEach((m) => {
        const t = (elapsed * 0.9 + m.userData.phase) % 2;
        m.scale.setScalar(1 + t * 3);
        m.material.opacity = Math.max(0, 0.7 * (1 - t / 2));
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
