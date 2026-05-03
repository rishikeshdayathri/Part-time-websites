import React from "react";
import { Leaf, Recycle, ShieldCheck } from "lucide-react";

export default function Sustainability() {
  const pillars = [
    {
      icon: Leaf,
      title: "Responsible Sourcing",
      desc: "Working with verified suppliers who meet quality, compliance, and ethical standards.",
    },
    {
      icon: Recycle,
      title: "Efficient Logistics",
      desc: "Optimising routes, load consolidation, and partner selection to reduce inefficiencies.",
    },
    {
      icon: ShieldCheck,
      title: "Supply-Chain Transparency",
      desc: "Clean documentation, audit-ready records, and honest post-delivery reporting.",
    },
  ];

  return (
    <section
      data-testid="sustainability-section"
      className="relative bg-[#F8FAFC] py-24 md:py-32"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-5 sn-reveal">
            <p className="text-[11px] font-display font-semibold tracking-[0.22em] uppercase text-[#2563EB]">
              06 — Sustainability
            </p>
            <h2 className="mt-4 font-display text-3xl md:text-4xl lg:text-[44px] leading-[1.1] font-semibold tracking-tight text-[#0A192F]">
              Responsible trade for a changing world.
            </h2>
            <p className="mt-6 text-lg text-slate-600 leading-relaxed">
              Subterra Nexus is committed to responsible sourcing, efficient
              logistics, and improving transparency across supply chains — with
              a long-term focus on reducing inefficiencies and supporting
              sustainable trade practices.
            </p>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {pillars.map((p, i) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.title}
                  className="sn-reveal sn-card bg-white border border-slate-200 p-6"
                  style={{ animationDelay: `${i * 80}ms` }}
                  data-testid={`sustain-pillar-${i}`}
                >
                  <div className="inline-flex items-center justify-center w-11 h-11 bg-[#0A192F] text-white">
                    <Icon size={20} strokeWidth={1.6} />
                  </div>
                  <h3 className="mt-6 font-display text-lg font-semibold text-[#0A192F]">
                    {p.title}
                  </h3>
                  <p className="mt-3 text-sm text-slate-600 leading-relaxed">{p.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
