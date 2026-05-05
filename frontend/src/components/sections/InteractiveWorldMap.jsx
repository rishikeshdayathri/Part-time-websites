import React, { useEffect, useMemo, useRef, useState } from "react";
import { geoEqualEarth, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import { Anchor, Ship, MapPin } from "lucide-react";

/**
 * InteractiveWorldMap
 * - Renders a stylised dark navy world map with subtle dot/grid overlay.
 * - Places hub markers for key trade ports.
 * - Draws curved arcs between Subterra Nexus's HQ (Hyderabad) and major hubs.
 * - Animates ship icons travelling along each arc using SMIL <animateMotion>.
 * - Hover or tap a hub to inspect the region.
 */

const WIDTH = 980;
const HEIGHT = 470;

const HUBS = [
  { id: "hyd", name: "Hyderabad",  region: "India · HQ",   coords: [78.48, 17.38], primary: true,
    blurb: "Global headquarters and trade desk. Coordinating sourcing, logistics, and execution worldwide." },
  { id: "jea", name: "Jebel Ali",  region: "UAE · MENA",   coords: [55.06, 25.01],
    blurb: "Strategic re-export hub for petrochemicals, base oils, and metals across MENA." },
  { id: "sha", name: "Shanghai",   region: "China · Asia", coords: [121.47, 31.23],
    blurb: "Anchor port for North-East Asia — petrochemicals, metals, and manufacturing inputs." },
  { id: "sin", name: "Singapore", region: "Asia",          coords: [103.82, 1.35],
    blurb: "Anchor port for Southeast and East Asian distribution corridors." },
  { id: "hou", name: "Houston",    region: "USA",          coords: [-95.37, 29.76],
    blurb: "Engagement with U.S. industrial and consumer supply chains." },
  { id: "sts", name: "Santos",     region: "Brazil · LATAM", coords: [-46.33, -23.95],
    blurb: "Producer-side corridor for minerals, sugar, and food commodities." },
  { id: "guy", name: "Guayaquil",  region: "Ecuador · LATAM", coords: [-79.92, -2.17],
    blurb: "LATAM origin for food commodities and metals exports." },
  { id: "suz", name: "Suez",       region: "Egypt · MENA", coords: [32.55, 29.97],
    blurb: "Critical transit corridor connecting MENA, Asia, and European markets." },
];

// Routes from HQ to each hub
const ROUTE_PAIRS = [
  ["hyd", "jea", 7],
  ["hyd", "sha", 8],
  ["hyd", "sin", 6],
  ["hyd", "suz", 9],
  ["hyd", "sts", 14],
  ["hyd", "guy", 15],
  ["hyd", "hou", 13],
];

// Ship SVG path (simple silhouette pointing right, ~24x12 viewport)
const SHIP_PATH =
  "M-10,-1 L-6,-4 L8,-4 L11,-1 L11,1 L8,4 L-6,4 L-10,1 Z";

const TOPO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

export default function InteractiveWorldMap() {
  const [countries, setCountries] = useState([]);
  const [hovered, setHovered] = useState(null);
  const [active, setActive] = useState("hyd");
  const cancelledRef = useRef(false);

  const projection = useMemo(
    () =>
      geoEqualEarth()
        .scale(178)
        .translate([WIDTH / 2, HEIGHT / 2 + 12]),
    []
  );
  const pathGen = useMemo(() => geoPath(projection), [projection]);

  // Fetch world topology once
  useEffect(() => {
    cancelledRef.current = false;
    fetch(TOPO_URL)
      .then((r) => r.json())
      .then((topo) => {
        if (cancelledRef.current) return;
        const fc = feature(topo, topo.objects.countries);
        setCountries(fc.features || []);
      })
      .catch(() => { /* graceful: keep dots-only fallback */ });
    return () => { cancelledRef.current = true; };
  }, []);

  // Project hubs to SVG coords once
  const projectedHubs = useMemo(
    () => HUBS.map((h) => {
      const p = projection(h.coords);
      return { ...h, x: p ? p[0] : 0, y: p ? p[1] : 0 };
    }),
    [projection]
  );

  const hubById = useMemo(
    () => Object.fromEntries(projectedHubs.map((h) => [h.id, h])),
    [projectedHubs]
  );

  const routes = useMemo(() => {
    return ROUTE_PAIRS.map(([a, b, dur], idx) => {
      const A = hubById[a];
      const B = hubById[b];
      if (!A || !B) return null;
      const mx = (A.x + B.x) / 2;
      const my = (A.y + B.y) / 2;
      // Perpendicular offset to bow the arc upward (negative y)
      const dx = B.x - A.x;
      const dy = B.y - A.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const offset = -Math.min(dist * 0.32, 90);
      // Perpendicular unit vector
      const nx = -dy / (dist || 1);
      const ny = dx / (dist || 1);
      const cx = mx + nx * offset;
      const cy = my + ny * offset;
      const d = `M${A.x},${A.y} Q${cx},${cy} ${B.x},${B.y}`;
      return { id: `r-${a}-${b}`, d, dur, idx, fromId: a, toId: b };
    }).filter(Boolean);
  }, [hubById]);

  const activeHub = projectedHubs.find((h) => h.id === active) || projectedHubs[0];

  return (
    <section
      data-testid="world-map-section"
      className="relative bg-[#0A192F] text-white overflow-hidden"
    >
      <div className="absolute inset-0 sn-grid-bg-dark opacity-30 pointer-events-none" />
      <div className="absolute -top-40 -right-20 w-[600px] h-[600px] rounded-full bg-[#2563EB]/15 blur-[140px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 md:px-10 lg:px-12 py-24 md:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end mb-10 sn-reveal">
          <div className="lg:col-span-7">
            <p className="text-[11px] font-display font-semibold tracking-[0.22em] uppercase text-[#93C5FD]">
              Live Trade Routes
            </p>
            <h2 className="mt-4 font-display text-3xl md:text-4xl lg:text-[44px] leading-[1.1] font-semibold tracking-tight">
              Ships in motion. Corridors in focus.
            </h2>
          </div>
          <p className="lg:col-span-5 text-slate-300 text-base md:text-lg leading-relaxed">
            Hover or tap any port to explore our active corridors — from
            Hyderabad to the UAE, MENA, LATAM, Asia, and the United States.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Map */}
          <div className="lg:col-span-9 relative bg-[#0B1426] border border-white/10 sn-reveal">
            <svg
              viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
              className="w-full h-auto block"
              preserveAspectRatio="xMidYMid meet"
              role="img"
              aria-label="Subterra Nexus global trade routes map"
              data-testid="world-map-svg"
            >
              <defs>
                <radialGradient id="oceanGrad" cx="50%" cy="40%" r="70%">
                  <stop offset="0%" stopColor="#0F2547" stopOpacity="1" />
                  <stop offset="100%" stopColor="#0A192F" stopOpacity="1" />
                </radialGradient>
                <linearGradient id="routeGrad" x1="0" x2="1">
                  <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.0" />
                  <stop offset="50%" stopColor="#60A5FA" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#60A5FA" stopOpacity="0.0" />
                </linearGradient>
                <pattern id="dotGrid" width="14" height="14" patternUnits="userSpaceOnUse">
                  <circle cx="1" cy="1" r="0.6" fill="#1E3A5F" />
                </pattern>
              </defs>

              {/* Ocean */}
              <rect width={WIDTH} height={HEIGHT} fill="url(#oceanGrad)" />
              <rect width={WIDTH} height={HEIGHT} fill="url(#dotGrid)" opacity="0.55" />

              {/* Continents */}
              <g data-testid="world-map-geographies">
                {countries.map((c, i) => (
                  <path
                    key={c.id || i}
                    d={pathGen(c) || ""}
                    fill="#142C4E"
                    stroke="#1E3A5F"
                    strokeWidth={0.45}
                  />
                ))}
                {/* If countries failed to load, the dot grid acts as a graceful fallback */}
              </g>

              {/* Routes (dashed under-line) */}
              <g opacity="0.55">
                {routes.map((r) => (
                  <path
                    key={`bg-${r.id}`}
                    d={r.d}
                    fill="none"
                    stroke="#3B82F6"
                    strokeOpacity="0.35"
                    strokeWidth="1"
                    strokeDasharray="3 4"
                  />
                ))}
              </g>

              {/* Routes (animated highlight) + ships */}
              <g>
                {routes.map((r) => (
                  <g key={r.id}>
                    {/* Hidden path used as motion guide */}
                    <path
                      id={r.id}
                      d={r.d}
                      fill="none"
                      stroke="url(#routeGrad)"
                      strokeWidth="1.4"
                      strokeOpacity="0.85"
                    />
                    {/* Ship traveling along the route */}
                    <g data-testid={`route-ship-${r.id}`}>
                      <g>
                        <circle r="6" fill="#60A5FA" opacity="0.22" />
                        <circle r="3.4" fill="#FFFFFF" opacity="0.95" />
                        <path d={SHIP_PATH} fill="#FFFFFF" stroke="#0A192F" strokeWidth="0.4" />
                        <animateMotion
                          dur={`${r.dur}s`}
                          repeatCount="indefinite"
                          rotate="auto"
                          begin={`${(r.idx % 6) * 0.9}s`}
                        >
                          <mpath href={`#${r.id}`} />
                        </animateMotion>
                      </g>
                    </g>
                  </g>
                ))}
              </g>

              {/* Hub markers */}
              <g>
                {projectedHubs.map((h) => {
                  const isActive = active === h.id;
                  const isHover  = hovered === h.id;
                  const isHQ     = h.primary;
                  const r        = isHQ ? 7 : 5;
                  const ringR    = isHQ ? 14 : 11;
                  return (
                    <g
                      key={h.id}
                      transform={`translate(${h.x},${h.y})`}
                      onMouseEnter={() => setHovered(h.id)}
                      onMouseLeave={() => setHovered(null)}
                      onClick={() => setActive(h.id)}
                      style={{ cursor: "pointer" }}
                      data-testid={`hub-marker-${h.id}`}
                    >
                      {/* pulse */}
                      <circle r={ringR} fill="none" stroke={isHQ ? "#60A5FA" : "#93C5FD"} strokeWidth="1" opacity="0.7">
                        <animate attributeName="r" from={r} to={ringR + 8} dur="2.4s" repeatCount="indefinite" />
                        <animate attributeName="opacity" from="0.85" to="0" dur="2.4s" repeatCount="indefinite" />
                      </circle>
                      <circle r={r + 3} fill={isHQ ? "#1D4ED8" : "#1E40AF"} opacity={isActive || isHover ? 0.55 : 0.3} />
                      <circle r={r} fill={isHQ ? "#FFFFFF" : "#60A5FA"} stroke="#0A192F" strokeWidth="1" />
                      {(isActive || isHover) && (
                        <g pointerEvents="none">
                          <rect x={r + 6} y={-12} width={Math.max(72, h.name.length * 6.2)} height={22} rx={2} fill="#0A192F" stroke="#1E3A5F" />
                          <text x={r + 12} y={3} fill="#FFFFFF" fontSize="10" fontFamily="Outfit, sans-serif" letterSpacing="0.5">
                            {h.name}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </g>
            </svg>

            {/* Legend */}
            <div className="absolute left-4 bottom-4 flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] font-display text-slate-300/80 pointer-events-none">
              <span className="inline-flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-white" /> HQ
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#60A5FA]" /> Hub
              </span>
              <span className="inline-flex items-center gap-2">
                <Ship size={12} className="text-white" /> Live route
              </span>
            </div>
          </div>

          {/* Side panel */}
          <aside className="lg:col-span-3 flex flex-col gap-4">
            <div className="bg-white/[0.04] border border-white/10 backdrop-blur-sm p-6 sn-reveal sn-delay-1" data-testid="world-map-detail">
              <p className="text-[11px] font-display font-semibold tracking-[0.22em] uppercase text-[#93C5FD] flex items-center gap-2">
                <MapPin size={12} /> Selected Hub
              </p>
              <h3 className="mt-3 font-display text-2xl font-semibold text-white">
                {activeHub.name}
              </h3>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400 mt-1 font-display">
                {activeHub.region}
              </p>
              <p className="mt-4 text-sm leading-relaxed text-slate-300">
                {activeHub.blurb}
              </p>
            </div>

            <div className="border border-white/10 p-5 sn-reveal sn-delay-2 bg-[#0B1426]">
              <p className="text-[11px] font-display font-semibold tracking-[0.22em] uppercase text-slate-400 flex items-center gap-2">
                <Anchor size={12} /> Active Hubs
              </p>
              <ul className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
                {projectedHubs.map((h) => (
                  <li key={h.id}>
                    <button
                      type="button"
                      onClick={() => setActive(h.id)}
                      className={`text-left w-full font-display tracking-wide transition-colors ${
                        active === h.id ? "text-white" : "text-slate-400 hover:text-white"
                      }`}
                      data-testid={`hub-side-${h.id}`}
                    >
                      <span className={`inline-block w-1.5 h-1.5 mr-2 align-middle ${active === h.id ? "bg-[#60A5FA]" : "bg-slate-600"}`} />
                      {h.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
