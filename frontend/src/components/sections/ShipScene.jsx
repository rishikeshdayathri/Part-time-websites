import React, { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Plain three.js cargo-ship scene used as the hero background.
 * - Auto-rotates continuously (idle motion).
 * - Page scroll adds an extra rotation delta to the ship (scroll-to-rotate).
 * - No drag/pan; built without R3F to remain stable on React 19.
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
    scene.fog = new THREE.Fog(0x132849, 16, 36);

    const camera = new THREE.PerspectiveCamera(38, w / h, 0.1, 100);
    camera.position.set(7, 3.6, 7.5);
    camera.lookAt(0, 0.6, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    // ----- Lights (brighter rig) -----
    scene.add(new THREE.AmbientLight(0xb8d0f0, 0.85));
    scene.add(new THREE.HemisphereLight(0x9bc5ff, 0x14233f, 0.95));

    const sun = new THREE.DirectionalLight(0xffffff, 1.55);
    sun.position.set(6, 10, 6);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 30;
    sun.shadow.camera.left = -10;
    sun.shadow.camera.right = 10;
    sun.shadow.camera.top = 10;
    sun.shadow.camera.bottom = -10;
    sun.shadow.bias = -0.0008;
    scene.add(sun);

    // Cool rim light (back-left)
    const rim = new THREE.DirectionalLight(0x60a5fa, 0.85);
    rim.position.set(-6, 4, -4);
    scene.add(rim);

    // Warm fill from front-bottom
    const warmFill = new THREE.DirectionalLight(0xfacc88, 0.45);
    warmFill.position.set(2, 1.2, 6);
    scene.add(warmFill);

    // Bridge/funnel accent
    const accent = new THREE.PointLight(0x60a5fa, 1.1, 10);
    accent.position.set(-3.4, 2.4, 0);
    scene.add(accent);

    // ----- Ship (rotates around Y for auto + scroll) -----
    const shipPivot = new THREE.Group();
    scene.add(shipPivot);
    const ship = buildShip();
    shipPivot.add(ship);

    // ----- Water -----
    const waterGeom = new THREE.PlaneGeometry(60, 30, 60, 30);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x1a3866,
      metalness: 0.65,
      roughness: 0.4,
      side: THREE.DoubleSide,
    });
    const water = new THREE.Mesh(waterGeom, waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.y = -0.55;
    water.receiveShadow = true;
    scene.add(water);

    // ----- Auto + scroll-driven rotation -----
    let autoAngle = 0;                         // continuous spin
    let scrollAngle = 0;                       // animated towards scroll target
    let scrollTarget = 0;                      // target derived from window.scrollY
    const SCROLL_FACTOR = 0.0035;              // px → radians
    const updateScrollTarget = () => {
      scrollTarget = (window.scrollY || 0) * SCROLL_FACTOR;
    };
    updateScrollTarget();
    window.addEventListener("scroll", updateScrollTarget, { passive: true });

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

      // Continuous auto-rotate (~ 9 deg/sec)
      autoAngle += dt * 0.16;

      // Smoothly approach scroll target (eased)
      scrollAngle += (scrollTarget - scrollAngle) * Math.min(1, dt * 6);

      shipPivot.rotation.y = autoAngle + scrollAngle;

      // Gentle bob and roll on the inner ship
      ship.position.y = -0.05 + Math.sin(elapsed * 0.6) * 0.06;
      ship.rotation.z = Math.sin(elapsed * 0.4) * 0.018;
      ship.rotation.x = Math.cos(elapsed * 0.5) * 0.01;

      // Water waves
      const pos = waterGeom.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const z = pos.getY(i);
        const wave =
          Math.sin(x * 0.45 + elapsed * 1.1) * 0.06 +
          Math.cos(z * 0.55 + elapsed * 0.9) * 0.05 +
          Math.sin((x + z) * 0.3 + elapsed * 0.6) * 0.04;
        pos.setZ(i, wave);
      }
      pos.needsUpdate = true;
      waterGeom.computeVertexNormals();

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
      window.removeEventListener("scroll", updateScrollTarget);
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
      data-testid="ship-canvas"
    />
  );
}

/* ------------------------------------------------------------------ */
/* Build the cargo ship from THREE primitives — bright brand palette.  */
/* ------------------------------------------------------------------ */
function buildShip() {
  const group = new THREE.Group();

  // Brighter materials
  const hullMat       = new THREE.MeshStandardMaterial({ color: 0x1f3a63, metalness: 0.55, roughness: 0.45 });
  const deckMat       = new THREE.MeshStandardMaterial({ color: 0x3b4f6e, metalness: 0.4,  roughness: 0.55 });
  const trimMat       = new THREE.MeshStandardMaterial({ color: 0x2a3d5c, metalness: 0.5,  roughness: 0.5  });
  const waterlineMat  = new THREE.MeshStandardMaterial({ color: 0xb91c1c, metalness: 0.25, roughness: 0.6  });
  const bridgeMat     = new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.15, roughness: 0.45 });
  const bridgeTopMat  = new THREE.MeshStandardMaterial({ color: 0xe2e8f0 });
  const accentMat     = new THREE.MeshStandardMaterial({ color: 0x3b82f6, emissive: 0x60a5fa, emissiveIntensity: 0.85 });
  const windowMat     = new THREE.MeshStandardMaterial({ color: 0x0f172a, emissive: 0x60a5fa, emissiveIntensity: 1.1 });
  const mastMat       = new THREE.MeshStandardMaterial({ color: 0xcbd5e1 });
  const lightWhiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 2.4 });
  const lightBlueMat  = new THREE.MeshStandardMaterial({ color: 0x60a5fa, emissive: 0x60a5fa, emissiveIntensity: 2.0 });
  const lightAmberMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0xfacc15, emissiveIntensity: 1.3 });

  // Hull main body
  const hull = new THREE.Mesh(new THREE.BoxGeometry(7.6, 0.85, 1.85), hullMat);
  hull.position.y = 0.05;
  hull.castShadow = true;
  hull.receiveShadow = true;
  group.add(hull);

  // Bow wedge (4-sided cone)
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

  // Waterline stripe (red — classic cargo look, now brighter)
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

  // Containers (vivid palette so they pop against the hull/water)
  const palette = [
    0x60a5fa, 0x3b82f6, 0x2563eb, 0xef4444, 0xf97316,
    0xfacc15, 0x10b981, 0xe2e8f0, 0xf472b6, 0x22d3ee,
  ];
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
            metalness: 0.2,
            roughness: 0.55,
          })
        );
        m.position.set(startX + c * (cw + 0.04), 0.78 + s * 0.38, startZ + r * cd);
        m.castShadow = true;
        m.receiveShadow = true;
        group.add(m);
      }
    }
  }

  // Bridge
  const bridge = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.4, 1.55), bridgeMat);
  bridge.position.set(-3.0, 1.0, 0);
  bridge.castShadow = true;
  group.add(bridge);

  // Bridge windows (lit)
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

  // Funnel band (brand-blue, glowing)
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
    const portLightBack = portLight.clone();
    portLightBack.position.z = -0.93;
    group.add(portLightBack);
  });

  return group;
}
