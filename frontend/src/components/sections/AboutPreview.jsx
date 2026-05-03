import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function AboutPreview() {
  return (
    <section data-testid="about-preview" className="relative bg-white py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
          <div className="lg:col-span-5 sn-reveal">
            <p className="text-[11px] font-display font-semibold tracking-[0.22em] uppercase text-[#2563EB]">
              01 — About
            </p>
            <h2 className="mt-4 font-display text-3xl md:text-4xl lg:text-[44px] leading-[1.1] font-semibold tracking-tight text-[#0A192F]">
              A trusted bridge between global commodity suppliers and buyers.
            </h2>
          </div>

          <div className="lg:col-span-7 space-y-6 sn-reveal sn-delay-1">
            <p className="text-lg text-slate-600 leading-relaxed">
              Founded in 2025, Subterra Nexus Pvt Ltd. is an international
              commodity trading company focused on quality, speed, transparency,
              and long-term relationships — serving B2B and B2G clients across
              Asia, MENA, LATAM, and beyond.
            </p>
            <p className="text-base text-slate-600 leading-relaxed">
              We simplify international trade through efficient sourcing,
              logistics coordination, and disciplined execution. Every
              transaction is built on verified counterparties, clean
              documentation, and a single accountable trade desk.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-slate-200">
              <div>
                <p className="text-[11px] font-display font-semibold tracking-[0.22em] uppercase text-slate-500">
                  Mission
                </p>
                <p className="mt-2 text-[#0A192F] font-display text-lg leading-snug">
                  To simplify international commodity trade through reliable sourcing, transparent processes, and efficient execution.
                </p>
              </div>
              <div>
                <p className="text-[11px] font-display font-semibold tracking-[0.22em] uppercase text-slate-500">
                  Vision
                </p>
                <p className="mt-2 text-[#0A192F] font-display text-lg leading-snug">
                  To become a globally trusted commodity trading partner across emerging and established markets.
                </p>
              </div>
            </div>

            <div className="pt-4">
              <Link
                to="/about"
                data-testid="about-preview-cta"
                className="group inline-flex items-center gap-2 text-sm font-medium text-[#0A192F] border-b border-[#0A192F] pb-1 hover:text-[#2563EB] hover:border-[#2563EB] transition-colors"
              >
                Read our story
                <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
