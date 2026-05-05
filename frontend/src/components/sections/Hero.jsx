import React, { Suspense, lazy, useState } from "react";
import { ArrowRight, Globe2, Anchor } from "lucide-react";
import { Link } from "react-router-dom";
import InquiryDialog from "../common/InquiryDialog";

const ShipScene = lazy(() => import("./ShipScene"));

export default function Hero() {
  const [inquiryOpen, setInquiryOpen] = useState(false);

  return (
    <section
      data-testid="hero-section"
      className="relative min-h-[92vh] overflow-hidden bg-[#0A192F] text-white"
    >
      {/* ---- 3D ship background ---- */}
      <div className="absolute inset-0 z-0" data-testid="hero-3d-bg">
        <Suspense fallback={null}>
          <ShipScene />
        </Suspense>
      </div>

      {/* Decorative grid + glow accents over the 3D scene */}
      <div className="absolute inset-0 z-[1] sn-grid-bg-dark opacity-25 pointer-events-none" />
      <div className="absolute -top-32 -right-24 w-[640px] h-[640px] rounded-full bg-[#2563EB]/15 blur-[160px] pointer-events-none z-[1]" />

      {/* Legibility overlay (left-weighted gradient — softer to keep the ship bright) */}
      <div className="absolute inset-0 z-[2] pointer-events-none bg-gradient-to-r from-[#0A192F]/92 via-[#0A192F]/55 to-transparent" />
      <div className="absolute inset-0 z-[2] pointer-events-none bg-gradient-to-t from-[#0A192F]/65 via-transparent to-[#0A192F]/25" />

      {/* ---- Copy (overlaid). The wrapper itself has pointer-events:none so the
              user can still drag the 3D scene through empty areas. Only the
              actual interactive elements re-enable pointer-events. ---- */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-6 md:px-10 lg:px-12 pt-28 md:pt-32 pb-24 min-h-[92vh] flex items-center pointer-events-none">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-8 sn-fade-in">
            <span className="h-px w-10 bg-[#60A5FA]" />
            <p className="text-[11px] tracking-[0.3em] uppercase text-[#93C5FD] font-display font-semibold">
              Subterra Nexus · Est. 2025 · Hyderabad, India
            </p>
          </div>

          <h1
            className="font-display font-semibold tracking-tight text-4xl sm:text-5xl lg:text-6xl xl:text-[68px] leading-[1.05] sn-fade-up"
            data-testid="hero-headline"
          >
            Global Commodity Trading{" "}
            <span className="text-[#60A5FA]">Built on Trust,</span> Quality, and Timely Delivery
          </h1>

          <p className="mt-7 text-base md:text-lg text-slate-300 max-w-2xl leading-relaxed sn-fade-up sn-delay-1">
            Connecting strategic suppliers and buyers across petrochemicals,
            food commodities, metals, and minerals through reliable sourcing
            and global trade networks.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-3 sn-fade-up sn-delay-2 pointer-events-auto">
            <Link
              to="/commodities"
              data-testid="hero-primary-cta"
              className="group inline-flex items-center justify-center gap-2 h-12 px-7 bg-white text-[#0A192F] text-sm font-medium tracking-wide hover:bg-[#60A5FA] hover:text-[#0A192F] transition-colors"
            >
              Explore Commodities
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <button
              type="button"
              data-testid="hero-secondary-cta"
              onClick={() => setInquiryOpen(true)}
              className="group inline-flex items-center justify-center gap-2 h-12 px-7 border border-white/30 text-white text-sm font-medium tracking-wide hover:bg-white/10 hover:border-white transition-colors"
            >
              Send Trade Inquiry
            </button>
          </div>

          {/* Trust strip */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl sn-fade-up sn-delay-3">
            <HeroStat value="4"        label="Commodity verticals" />
            <HeroStat value="15+"      label="Country corridors" />
            <HeroStat value="B2B+B2G"  label="Client coverage" />
            <HeroStat value="24/7"     label="Trade desk" />
          </div>
        </div>
      </div>

      {/* Caption chip — top-right of hero, hints interactivity */}
      <div className="absolute top-24 md:top-28 right-6 md:right-10 lg:right-12 z-10 inline-flex items-center gap-2 bg-[#0A192F]/65 border border-white/10 backdrop-blur-md px-3 py-2 text-[10px] uppercase tracking-[0.22em] font-display text-slate-200 pointer-events-none">
        <span className="w-1.5 h-1.5 rounded-full bg-[#60A5FA] sn-pulse-ring" />
        Scroll to rotate · 3D vessel
      </div>

      {/* Bottom marker */}
      <div className="absolute bottom-0 left-0 right-0 z-10 border-t border-white/10 bg-[#0A192F]/65 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto w-full px-6 md:px-10 lg:px-12 h-14 flex items-center justify-between text-[11px] tracking-[0.22em] uppercase text-slate-400 font-display">
          <span className="inline-flex items-center gap-2"><Globe2 size={13} /> Asia · MENA · LATAM · USA</span>
          <span className="hidden md:inline-flex items-center gap-2"><Anchor size={13} /> Global Commodities · Trusted Networks · Timely Delivery</span>
        </div>
      </div>

      <InquiryDialog open={inquiryOpen} onOpenChange={setInquiryOpen} source="hero_cta" />
    </section>
  );
}

function HeroStat({ value, label }) {
  return (
    <div>
      <div className="font-display text-3xl md:text-4xl font-semibold tracking-tight text-white">
        {value}
      </div>
      <div className="mt-1 text-xs uppercase tracking-[0.15em] text-slate-400">{label}</div>
    </div>
  );
}
