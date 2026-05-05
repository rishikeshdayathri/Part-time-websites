import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three-stdlib";

/**
 * Plain three.js cargo-ship scene used as the hero background.
 * Uses three-stdlib OrbitControls (drag to rotate). Auto-rotates while idle.
 * Built without @react-three/fiber to avoid React-19 reconciler issues.
 */
export default function ShipScene() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const getSize = () => ({
      w: Math.max(320, mount.clientWidth || mount.offsetWidth || 800),
      h: Math.max(320, mount.clientHeight || mount.offsetHeight || 600),
    });
    let { w, h } = getSize();

    // ----- Scene / camera / renderer -----
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0a192f, 14, 32);

    const camera = new THREE.PerspectiveCamera(38, w / h, 0.1, 100);
    camera.position.set(7, 3.6, 7.5);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    // ----- Lights -----
    scene.add(new THREE.AmbientLight(0x9db7e0, 0.42));
    scene.add(new THREE.HemisphereLight(0x60a5fa, 0x0a192f, 0.55));

    const sun = new THREE.DirectionalLight(0xffffff, 1.0);
    sun.position.set(6, 9, 5);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 30;
    sun.shadow.camera.left = -10;
    sun.shadow.camera.right = 10;
    sun.shadow.camera.top = 10;
    sun.shadow.camera.bottom = -10;
    scene.add(sun);

    const fill = new THREE.DirectionalLight(0x60a5fa, 0.5);
    fill.position.set(-6, 3, -4);
    scene.add(fill);

    const accent = new THREE.PointLight(0x60a5fa, 0.6, 8);
    accent.position.set(-3.4, 2.4, 0);
    scene.add(accent);

    // ----- Ship -----
    const ship = buildShip();
    scene.add(ship);

    // ----- Water -----
    const waterGeom = new THREE.PlaneGeometry(60, 30, 60, 30);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x0b1e3a,
      metalness: 0.7,
      roughness: 0.35,
      side: THREE.DoubleSide,
    });
    const water = new THREE.Mesh(waterGeom, waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.y = -0.55;
    water.receiveShadow = true;
    scene.add(water);

    // ----- Controls -----
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.55;
    controls.minPolarAngle = Math.PI / 2.55;
    controls.maxPolarAngle = Math.PI / 2.05;
    controls.rotateSpeed = 0.6;
    controls.enableDamping = true;
    controls.dampingFactor = 0.12;
    controls.target.set(0, 0.6, 0);

    // ----- Animation loop -----
    let raf = 0;
    let isVisible = true;
    const start = performance.now();
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!isVisible) return;
      const t = (performance.now() - start) / 1000;

      // Ship gentle bob and roll
      ship.position.y = -0.05 + Math.sin(t * 0.6) * 0.06;
      ship.rotation.z = Math.sin(t * 0.4) * 0.018;
      ship.rotation.x = Math.cos(t * 0.5) * 0.01;

      // Water waves (vertex displacement)
      const pos = waterGeom.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const z = pos.getY(i);
        const wave =
          Math.sin(x * 0.45 + t * 1.1) * 0.06 +
          Math.cos(z * 0.55 + t * 0.9) * 0.05 +
          Math.sin((x + z) * 0.3 + t * 0.6) * 0.04;
        pos.setZ(i, wave);
      }
      pos.needsUpdate = true;
      waterGeom.computeVertexNormals();

      controls.update();
      renderer.render(scene, camera);
    };
    tick();

    // ----- Resize handler -----
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

    // Pause when off-screen / tab hidden
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
      controls.dispose();
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
      className="absolute inset-0"
      data-testid="ship-canvas"
      style={{ cursor: "grab" }}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Build the cargo ship from THREE primitives.                         */
/* ------------------------------------------------------------------ */
function buildShip() {
  const group = new THREE.Group();

  const hullMat = new THREE.MeshStandardMaterial({ color: 0x0a1628, metalness: 0.55, roughness: 0.45 });
  const deckMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.4, roughness: 0.6 });
  const trimMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.5, roughness: 0.5 });
  const waterlineMat = new THREE.MeshStandardMaterial({ color: 0x5b0f1a, metalness: 0.25, roughness: 0.7 });
  const bridgeMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.2, roughness: 0.5 });
  const bridgeTopMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1 });
  const accentMat = new THREE.MeshStandardMaterial({ color: 0x2563eb, emissive: 0x2563eb, emissiveIntensity: 0.45 });
  const windowMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, emissive: 0x60a5fa, emissiveIntensity: 0.55 });
  const mastMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8 });
  const lightWhiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 1.6 });
  const lightBlueMat = new THREE.MeshStandardMaterial({ color: 0x60a5fa, emissive: 0x60a5fa, emissiveIntensity: 1.2 });
  const lightAmberMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0xfacc15, emissiveIntensity: 0.8 });

  // Hull main body
  const hull = new THREE.Mesh(new THREE.BoxGeometry(7.6, 0.85, 1.85), hullMat);
  hull.position.y = 0.05;
  hull.castShadow = true;
  hull.receiveShadow = true;
  group.add(hull);

  // Bow wedge (4-sided cone tip pointing forward = +X)
  const bow = new THREE.Mesh(new THREE.CylinderGeometry(0.001, 0.92, 1.0, 4, 1, false, Math.PI / 4), hullMat);
  bow.position.set(3.95, 0.05, 0);
  bow.rotation.z = -Math.PI / 2;
  bow.castShadow = true;
  group.add(bow);

  // Stern block
  const stern = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.85, 1.85), hullMat);
  stern.position.set(-3.85, 0.05, 0);
  stern.castShadow = true;
  group.add(stern);

  // Waterline stripe
  const waterline = new THREE.Mesh(new THREE.BoxGeometry(7.7, 0.18, 1.78), waterlineMat);
  waterline.position.y = -0.45;
  group.add(waterline);

  // Deck
  const deck = new THREE.Mesh(new THREE.BoxGeometry(7.4, 0.06, 1.7), deckMat);
  deck.position.y = 0.5;
  deck.receiveShadow = true;
  group.add(deck);

  // Side rails
  const rail1 = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.16, 0.05), trimMat);
  rail1.position.set(0, 0.62, 0.85);
  group.add(rail1);
  const rail2 = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.16, 0.05), trimMat);
  rail2.position.set(0, 0.62, -0.85);
  group.add(rail2);

  // Containers
  const palette = [0x1e40af, 0x1d4ed8, 0x0f172a, 0x475569, 0x2563eb, 0x334155, 0x0ea5e9, 0x1e293b];
  const containerGeom = new THREE.BoxGeometry(0.42, 0.36, 0.5);
  const cw = 0.42, cd = 0.5;
  const cols = 14, rows = 3, stacks = 2;
  const startX = -2.7;
  const startZ = -((rows - 1) * cd) / 2;
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      for (let s = 0; s < stacks; s++) {
        if (s === 1 && (c % 5 === 0 || c === cols - 1)) continue;
        const m = new THREE.Mesh(
          containerGeom,
          new THREE.MeshStandardMaterial({
            color: palette[(c + r * 3 + s * 2) % palette.length],
            metalness: 0.18,
            roughness: 0.7,
          })
        );
        m.position.set(startX + c * (cw + 0.04), 0.78 + s * 0.38, startZ + r * cd);
        m.castShadow = true;
        group.add(m);
      }
    }
  }

  // Bridge (white block near stern)
  const bridge = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.4, 1.55), bridgeMat);
  bridge.position.set(-3.0, 1.0, 0);
  bridge.castShadow = true;
  group.add(bridge);

  // Bridge windows (lit blue strip)
  const windows = new THREE.Mesh(new THREE.BoxGeometry(1.02, 0.22, 1.57), windowMat);
  windows.position.set(-3.0, 1.55, 0);
  group.add(windows);

  // Bridge top deck
  const bridgeTop = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.2, 1.0), bridgeTopMat);
  bridgeTop.position.set(-3.0, 1.78, 0);
  bridgeTop.castShadow = true;
  group.add(bridgeTop);

  // Funnel
  const funnel = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.6, 0.7), trimMat);
  funnel.position.set(-3.4, 2.0, 0);
  funnel.castShadow = true;
  group.add(funnel);

  // Funnel band
  const funnelBand = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.12, 0.71), accentMat);
  funnelBand.position.set(-3.4, 2.18, 0);
  group.add(funnelBand);

  // Aft mast + light
  const aftMast = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.9, 8), mastMat);
  aftMast.position.set(-3.5, 2.55, 0);
  group.add(aftMast);
  const aftLight = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 12), lightWhiteMat);
  aftLight.position.set(-3.5, 3.05, 0);
  group.add(aftLight);

  // Bow mast + light
  const bowMast = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.9, 8), mastMat);
  bowMast.position.set(3.4, 1.1, 0);
  group.add(bowMast);
  const bowLight = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 12), lightBlueMat);
  bowLight.position.set(3.4, 1.6, 0);
  group.add(bowLight);

  // Side hull port lights
  [-2.4, -1.4, -0.4, 0.6, 1.6, 2.6].forEach((x) => {
    const portLight = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.08, 0.02), lightAmberMat);
    portLight.position.set(x, -0.05, 0.93);
    group.add(portLight);
  });

  return group;
}
