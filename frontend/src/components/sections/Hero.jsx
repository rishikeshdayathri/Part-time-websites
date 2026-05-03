import React, { useState } from "react";
import { ArrowRight, Globe2, Anchor } from "lucide-react";
import { Link } from "react-router-dom";
import InquiryDialog from "../common/InquiryDialog";

export default function Hero() {
  const [inquiryOpen, setInquiryOpen] = useState(false);

  return (
    <section
      data-testid="hero-section"
      className="relative min-h-[92vh] flex items-center overflow-hidden bg-[#0A192F] text-white"
    >
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src="https://images.pexels.com/photos/3338019/pexels-photo-3338019.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=1200&w=1920"
          alt="Global port operations"
          className="w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A192F]/95 via-[#0A192F]/80 to-[#0A192F]/70" />
        <div className="absolute inset-0 sn-grid-bg-dark opacity-30" />
      </div>

      <div className="relative max-w-7xl mx-auto w-full px-6 md:px-10 lg:px-12 pt-28 md:pt-32 pb-24">
        <div className="max-w-4xl">
          <div className="flex items-center gap-3 mb-8 sn-fade-in">
            <span className="h-px w-10 bg-[#60A5FA]" />
            <p className="text-[11px] tracking-[0.3em] uppercase text-[#93C5FD] font-display font-semibold">
              Subterra Nexus · Est. 2025 · Hyderabad, India
            </p>
          </div>

          <h1
            className="font-display font-semibold tracking-tight text-4xl sm:text-5xl lg:text-6xl xl:text-7xl leading-[1.05] sn-fade-up"
            data-testid="hero-headline"
          >
            Global Commodity Trading{" "}
            <span className="text-[#60A5FA]">Built on Trust,</span> Quality, and Timely Delivery
          </h1>

          <p className="mt-7 text-base md:text-lg text-slate-300 max-w-2xl leading-relaxed sn-fade-up sn-delay-1">
            Connecting strategic suppliers and buyers across petrochemicals,
            food commodities, metals, and ores through reliable sourcing and
            global trade networks.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-3 sn-fade-up sn-delay-2">
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
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl sn-fade-up sn-delay-3">
            <HeroStat value="4" label="Commodity verticals" />
            <HeroStat value="15+" label="Country corridors" />
            <HeroStat value="B2B+B2G" label="Client coverage" />
            <HeroStat value="24/7" label="Trade desk" />
          </div>
        </div>
      </div>

      {/* Bottom marker */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-white/10">
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
