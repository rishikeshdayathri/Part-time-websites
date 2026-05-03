import React from "react";

export default function FuturePlans() {
  return (
    <section
      data-testid="future-plans-section"
      className="relative bg-[#0A192F] text-white py-24 md:py-32 overflow-hidden"
    >
      <div className="absolute inset-0 sn-grid-bg-dark opacity-40 pointer-events-none" />
      <div className="absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full bg-[#2563EB]/15 blur-[120px]" />
      <div className="absolute bottom-0 right-0 w-[420px] h-[420px] rounded-full bg-[#60A5FA]/10 blur-[120px]" />

      <div className="relative max-w-7xl mx-auto px-6 md:px-10 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-6 sn-reveal">
            <p className="text-[11px] font-display font-semibold tracking-[0.22em] uppercase text-[#93C5FD]">
              07 — Future
            </p>
            <h2 className="mt-4 font-display text-3xl md:text-4xl lg:text-[48px] leading-[1.05] font-semibold tracking-tight text-white">
              Building the next generation of commodity trade.
            </h2>
          </div>
          <div className="lg:col-span-6 sn-reveal sn-delay-1">
            <p className="text-lg text-slate-300 leading-relaxed">
              Expanding global supplier networks. Improving digital trade
              processes. Strengthening long-term partnerships across Asia,
              MENA, LATAM, and beyond — with a disciplined focus on reliability
              and execution.
            </p>

            <ul className="mt-8 divide-y divide-white/10 border-y border-white/10">
              {[
                "Expanding verified supplier and buyer networks",
                "Digitising trade documentation and execution",
                "Deepening corridors across MENA, LATAM, and Asia",
                "Growing our B2G engagement across emerging markets",
              ].map((t, i) => (
                <li
                  key={i}
                  className="py-4 flex items-center gap-4 text-slate-200"
                  data-testid={`future-point-${i}`}
                >
                  <span className="font-display text-xs tracking-[0.22em] text-[#93C5FD] w-10 shrink-0">
                    0{i + 1}
                  </span>
                  <span className="text-[15px]">{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
