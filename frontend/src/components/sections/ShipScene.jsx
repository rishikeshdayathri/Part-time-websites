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
    scene.fog = new THREE.Fog(0x15284a, 22, 46);

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

    // ----- Water (true circular disc — no rectangular edges) -----
    const FADE_INNER = 14;   // fully ocean within this radius
    const FADE_OUTER = 50;   // fully blended into horizon by this radius
    const MAX_R = FADE_OUTER;

    // Slightly darker, realistic ocean colour + matching horizon
    const WATER_RGB   = { r: 0.106, g: 0.247, b: 0.420 }; // ~ #1B3F6B
    const HORIZON_RGB = { r: 0.082, g: 0.157, b: 0.290 }; // ~ #15284A (matches fog)

    const waterGeom = buildCircularPlane(MAX_R, 90, 144);

    // Per-vertex radial blend factor (1 = ocean, 0 = horizon)
    const fadeArr = new Float32Array(waterGeom.attributes.position.count);
    const colorsArr = new Float32Array(waterGeom.attributes.position.count * 3);
    for (let i = 0; i < waterGeom.attributes.position.count; i++) {
      const x = waterGeom.attributes.position.getX(i);
      const y = waterGeom.attributes.position.getY(i);
      const d = Math.sqrt(x * x + y * y);
      let f = 1 - (d - FADE_INNER) / (FADE_OUTER - FADE_INNER);
      if (f > 1) f = 1; if (f < 0) f = 0;
      f = f * f * (3 - 2 * f); // smooth-step
      fadeArr[i] = f;
      colorsArr[i * 3 + 0] = WATER_RGB.r * f + HORIZON_RGB.r * (1 - f);
      colorsArr[i * 3 + 1] = WATER_RGB.g * f + HORIZON_RGB.g * (1 - f);
      colorsArr[i * 3 + 2] = WATER_RGB.b * f + HORIZON_RGB.b * (1 - f);
    }
    waterGeom.setAttribute("color", new THREE.BufferAttribute(colorsArr, 3));

    const waterMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      metalness: 0.45,
      roughness: 0.5,
      side: THREE.DoubleSide,
      flatShading: false,
    });
    const water = new THREE.Mesh(waterGeom, waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.y = -0.55;
    water.receiveShadow = true;
    scene.add(water);

    // Foam crest layer (mirrors water geometry; carries per-vertex intensity)
    const foamGeom = buildCircularPlane(MAX_R, 90, 144);
    const foamMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 1.0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
      vertexColors: true,
    });
    const foamColors = new Float32Array(foamGeom.attributes.position.count * 3);
    foamGeom.setAttribute("color", new THREE.BufferAttribute(foamColors, 3));
    const foam = new THREE.Mesh(foamGeom, foamMat);
    foam.rotation.x = -Math.PI / 2;
    foam.position.y = -0.535;
    scene.add(foam);

    // Stern wake — a long bright streak behind the ship
    const wakeGeom = new THREE.PlaneGeometry(7.5, 0.9, 40, 4);
    const wakeMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    // Fade ends with vertex colors
    const wakeColors = new Float32Array(wakeGeom.attributes.position.count * 3);
    const wakePos = wakeGeom.attributes.position;
    for (let i = 0; i < wakePos.count; i++) {
      const u = (wakePos.getX(i) + 7.5 / 2) / 7.5; // 0..1 along length
      const v = Math.abs(wakePos.getY(i)) / (0.9 / 2); // 0..1 across width
      const a = (1 - u) * (1 - v); // bright near ship, fades back & to edges
      wakeColors[i * 3 + 0] = a;
      wakeColors[i * 3 + 1] = a;
      wakeColors[i * 3 + 2] = a;
    }
    wakeGeom.setAttribute("color", new THREE.BufferAttribute(wakeColors, 3));
    wakeMat.vertexColors = true;
    const wake = new THREE.Mesh(wakeGeom, wakeMat);
    wake.rotation.x = -Math.PI / 2;
    wake.position.set(-4.4, -0.535, 0);
    shipPivot.add(wake);

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

      // Gentle bob and roll on the inner ship (smaller, more realistic)
      ship.position.y = -0.05 + Math.sin(elapsed * 0.5) * 0.025;
      ship.rotation.z = Math.sin(elapsed * 0.35) * 0.008;
      ship.rotation.x = Math.cos(elapsed * 0.45) * 0.005;

      // Realistic multi-layer water — gentler swell + small ripples,
      // with wave amplitude radially attenuated near horizon (so the disc looks calm at edges).
      const pos = waterGeom.attributes.position;
      const fpos = foamGeom.attributes.position;
      const fcol = foamGeom.attributes.color;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        const f = fadeArr[i]; // 1 inside, 0 at horizon
        // Base swell (long wavelength, low frequency)
        const swell =
          Math.sin(x * 0.18 + elapsed * 0.42) * 0.045 +
          Math.cos(y * 0.22 + elapsed * 0.36) * 0.038;
        // Mid chop
        const chop =
          Math.sin((x + y) * 0.55 + elapsed * 0.7) * 0.018 +
          Math.cos((x - y) * 0.65 + elapsed * 0.55) * 0.014;
        // High-frequency ripples
        const ripple =
          Math.sin(x * 1.6 + elapsed * 1.4) * 0.006 +
          Math.cos(y * 1.8 + elapsed * 1.2) * 0.005;
        const wave = (swell + chop + ripple) * (0.25 + 0.75 * f);
        pos.setZ(i, wave);
        fpos.setZ(i, wave + 0.002);
        // Foam: only on bright crests, never near horizon
        const peak = Math.max(0, (wave - 0.045) * 4.5) * f;
        const c = Math.min(0.4, peak);
        fcol.setXYZ(i, c, c, c);
      }
      pos.needsUpdate = true;
      fpos.needsUpdate = true;
      fcol.needsUpdate = true;
      waterGeom.computeVertexNormals();

      // Stern wake — subtle, slow opacity breathing
      wakeMat.opacity = 0.20 + Math.sin(elapsed * 0.6) * 0.03;

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
/* Build a flat circular disc geometry (no rectangular edges).         */
/* Vertices = 1 center + ringCount × angularCount, in a fan + ring grid */
/* ------------------------------------------------------------------ */
function buildCircularPlane(maxR, ringCount, angularCount) {
  const geom = new THREE.BufferGeometry();
  const vertCount = 1 + ringCount * angularCount;
  const positions = new Float32Array(vertCount * 3);
  const indices = [];

  // Center vertex
  positions[0] = 0; positions[1] = 0; positions[2] = 0;

  for (let r = 1; r <= ringCount; r++) {
    const radius = (r / ringCount) * maxR;
    for (let a = 0; a < angularCount; a++) {
      const angle = (a / angularCount) * Math.PI * 2;
      const idx = 1 + (r - 1) * angularCount + a;
      positions[idx * 3 + 0] = Math.cos(angle) * radius;
      positions[idx * 3 + 1] = Math.sin(angle) * radius;
      positions[idx * 3 + 2] = 0;
    }
  }

  // Center fan (center → ring 1)
  for (let a = 0; a < angularCount; a++) {
    const i1 = 1 + a;
    const i2 = 1 + ((a + 1) % angularCount);
    indices.push(0, i2, i1);
  }
  // Ring strips
  for (let r = 1; r < ringCount; r++) {
    const ringStart = 1 + (r - 1) * angularCount;
    const nextRingStart = 1 + r * angularCount;
    for (let a = 0; a < angularCount; a++) {
      const aNext = (a + 1) % angularCount;
      const i00 = ringStart + a;
      const i01 = ringStart + aNext;
      const i10 = nextRingStart + a;
      const i11 = nextRingStart + aNext;
      indices.push(i00, i11, i10);
      indices.push(i00, i01, i11);
    }
  }

  geom.setIndex(indices);
  geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geom.computeVertexNormals();
  return geom;
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

  // Hull nameplate — "SUBTERRA NEXUS" on both sides
  const nameTexture = createNameplateTexture("SUBTERRA NEXUS");
  const nameMat = new THREE.MeshBasicMaterial({
    map: nameTexture,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const nameGeom = new THREE.PlaneGeometry(4.2, 0.55);

  // Starboard (front-facing +Z)
  const nameStar = new THREE.Mesh(nameGeom, nameMat);
  nameStar.position.set(-0.4, 0.18, 0.931);
  group.add(nameStar);

  // Port (back-facing -Z)
  const namePort = new THREE.Mesh(nameGeom, nameMat);
  namePort.position.set(-0.4, 0.18, -0.931);
  namePort.rotation.y = Math.PI;
  group.add(namePort);

  return group;
}

/* Build a transparent canvas texture with bold nameplate text. */
function createNameplateTexture(text) {
  const W = 1024;
  const H = 144;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, W, H);

  // Subtle drop-shadow for legibility on hull
  ctx.shadowColor = "rgba(0, 0, 0, 0.55)";
  ctx.shadowBlur = 8;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 2;

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "700 96px 'Outfit', 'Helvetica Neue', Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  if ("letterSpacing" in ctx) ctx.letterSpacing = "10px";
  ctx.fillText(text, W / 2, H / 2 + 4);

  // Small accent dot to the right of the wordmark
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#60A5FA";
  ctx.beginPath();
  const metrics = ctx.measureText(text);
  const dotX = W / 2 + metrics.width / 2 + 24;
  ctx.arc(dotX, H / 2 + 4, 8, 0, Math.PI * 2);
  ctx.fill();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}
