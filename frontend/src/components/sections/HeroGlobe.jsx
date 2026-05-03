import React, { useEffect, useMemo, useRef, useState } from "react";
import Globe from "react-globe.gl";
import * as THREE from "three";
import { feature } from "topojson-client";

/**
 * HeroGlobe — interactive 3D globe for the hero section.
 *  - Dotted-hex continents over a deep navy sphere with soft atmosphere.
 *  - Animated arcs connecting Hyderabad (HQ) to all key trade hubs.
 *  - Auto-rotates; pauses on user drag/touch; hover/touch a hub to see the name.
 */

const TOPO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const HUBS = [
  { name: "Hyderabad", region: "India · HQ",   lat: 17.38, lng: 78.48,  primary: true },
  { name: "Jebel Ali", region: "UAE · MENA",   lat: 25.01, lng: 55.06 },
  { name: "Singapore", region: "Asia",         lat:  1.35, lng: 103.82 },
  { name: "Suez",      region: "Egypt · MENA", lat: 29.97, lng: 32.55 },
  { name: "Houston",   region: "USA",          lat: 29.76, lng: -95.37 },
  { name: "Santos",    region: "Brazil",       lat: -23.95, lng: -46.33 },
  { name: "Guayaquil", region: "Ecuador",      lat: -2.17, lng: -79.92 },
];
const HQ = HUBS[0];

export default function HeroGlobe() {
  const containerRef = useRef(null);
  const globeRef = useRef(null);
  const [size, setSize] = useState({ w: 600, h: 600 });
  const [features, setFeatures] = useState([]);
  const cancelRef = useRef(false);

  // Topology
  useEffect(() => {
    cancelRef.current = false;
    fetch(TOPO_URL)
      .then((r) => r.json())
      .then((topo) => {
        if (cancelRef.current) return;
        const fc = feature(topo, topo.objects.countries);
        setFeatures(fc.features || []);
      })
      .catch(() => {});
    return () => { cancelRef.current = true; };
  }, []);

  // Responsive sizing
  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const update = () => {
      const r = el.getBoundingClientRect();
      setSize({ w: Math.max(280, r.width), h: Math.max(320, r.height) });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Configure controls + initial POV
  useEffect(() => {
    const g = globeRef.current;
    if (!g) return;
    const controls = g.controls();
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.55;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.minPolarAngle = Math.PI * 0.2;
    controls.maxPolarAngle = Math.PI * 0.8;
    g.pointOfView({ lat: 16, lng: 60, altitude: 2.55 }, 0);
  }, [features.length, size.w]);

  const globeMaterial = useMemo(
    () => new THREE.MeshPhongMaterial({
      color: new THREE.Color("#0A192F"),
      emissive: new THREE.Color("#08111F"),
      shininess: 4,
      transparent: false,
    }),
    []
  );

  const arcs = useMemo(
    () =>
      HUBS.filter((h) => !h.primary).map((h) => ({
        startLat: HQ.lat, startLng: HQ.lng,
        endLat: h.lat,    endLng: h.lng,
        color: [
          "rgba(96,165,250,0.05)",
          "rgba(147,197,253,0.95)",
          "rgba(96,165,250,0.05)",
        ],
      })),
    []
  );

  const points = useMemo(
    () =>
      HUBS.map((h) => ({
        ...h,
        size: h.primary ? 0.55 : 0.32,
        color: h.primary ? "#FFFFFF" : "#60A5FA",
      })),
    []
  );

  const rings = useMemo(
    () => [{ lat: HQ.lat, lng: HQ.lng }],
    []
  );

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 select-none"
      data-testid="hero-globe"
    >
      <Globe
        ref={globeRef}
        width={size.w}
        height={size.h}
        backgroundColor="rgba(0,0,0,0)"
        animateIn={true}
        rendererConfig={{ antialias: true, alpha: true }}
        showAtmosphere
        atmosphereColor="#60A5FA"
        atmosphereAltitude={0.2}
        globeMaterial={globeMaterial}
        /* Country polygons (stylised) */
        polygonsData={features}
        polygonCapColor={() => "rgba(20, 44, 78, 0.92)"}
        polygonSideColor={() => "rgba(15, 30, 60, 0.4)"}
        polygonStrokeColor={() => "rgba(96, 165, 250, 0.55)"}
        polygonAltitude={0.008}
        /* Arcs */
        arcsData={arcs}
        arcColor={(d) => d.color}
        arcStroke={0.45}
        arcAltitudeAutoScale={0.45}
        arcDashLength={0.35}
        arcDashGap={1.6}
        arcDashInitialGap={() => Math.random() * 5}
        arcDashAnimateTime={2400}
        /* Points (hubs) */
        pointsData={points}
        pointLat="lat"
        pointLng="lng"
        pointColor="color"
        pointRadius="size"
        pointAltitude={0.012}
        pointLabel={(p) =>
          `<div style="background:#0A192F;border:1px solid #1E3A5F;color:#fff;padding:6px 10px;font-family:Outfit,sans-serif;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;white-space:nowrap;box-shadow:0 6px 18px rgba(0,0,0,0.35)">
             <div style='color:#93C5FD;font-size:9px;margin-bottom:2px'>${p.region}</div>
             ${p.name}
           </div>`
        }
        /* Pulsing HQ ring */
        ringsData={rings}
        ringColor={() => (t) => `rgba(96,165,250,${1 - t})`}
        ringMaxRadius={3.5}
        ringPropagationSpeed={1.4}
        ringRepeatPeriod={1400}
        ringAltitude={0.005}
      />

      {/* Soft inner vignette to blend the globe into the hero */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(closest-side at 50% 50%, transparent 60%, rgba(10,25,47,0.55) 100%)",
        }}
      />
    </div>
  );
}
