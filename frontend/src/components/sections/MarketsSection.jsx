import React from "react";
import { MARKETS, MARKET_STATS } from "../../data/markets";

export default function MarketsSection({ compact = false }) {
  return (
    <section
      data-testid="markets-section"
      className={`relative text-white sn-radial-navy ${compact ? "py-20" : "py-24 md:py-32"}`}
    >
      <div className="absolute inset-0 sn-grid-bg-dark opacity-40 pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-6 md:px-10 lg:px-12">
        <div className="max-w-3xl sn-reveal">
          <p className="text-[11px] font-display font-semibold tracking-[0.22em] uppercase text-[#93C5FD]">
            04 — Markets
          </p>
          <h2 className="mt-4 font-display text-3xl md:text-4xl lg:text-[44px] leading-[1.1] font-semibold tracking-tight">
            A global reach across emerging and established corridors.
          </h2>
          <p className="mt-5 text-lg text-slate-300 leading-relaxed">
            Subterra Nexus operates across Asia, MENA, LATAM, the United
            States, UAE, Brazil, and Ecuador — connecting manufacturers,
            governments, distributors, and retail chains to the right
            counterparties, at the right time.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-6 sn-reveal sn-delay-1">
          {MARKET_STATS.map((s, i) => (
            <div
              key={i}
              className="border-t border-white/15 pt-6"
              data-testid={`market-stat-${i}`}
            >
              <div className="font-display text-3xl md:text-4xl font-semibold tracking-tight">
                {s.value}
              </div>
              <div className="mt-1.5 text-xs uppercase tracking-[0.15em] text-slate-400">
                {s.label}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
          {MARKETS.map((m, i) => (
            <div
              key={m.region}
              className="sn-reveal border border-white/10 bg-white/[0.03] backdrop-blur-sm p-7 md:p-8 hover:bg-white/[0.05] transition-colors"
              style={{ animationDelay: `${i * 80}ms` }}
              data-testid={`market-card-${m.region.toLowerCase()}`}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display text-xl font-semibold text-white">
                  {m.region}
                </h3>
                <span className="font-display text-[10px] tracking-[0.22em] uppercase text-[#93C5FD]">
                  Region
                </span>
              </div>
              <p className="mt-4 text-sm text-slate-300 leading-relaxed">
                {m.desc}
              </p>
              <p className="mt-5 pt-5 border-t border-white/10 text-[11px] uppercase tracking-[0.18em] font-display text-slate-400">
                {m.partners}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
