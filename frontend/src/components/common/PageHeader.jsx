import React from "react";

/** Reusable page header for internal pages. */
export default function PageHeader({ eyebrow, title, subtitle, align = "left" }) {
  return (
    <section
      data-testid="page-header"
      className="relative bg-[#0A192F] text-white overflow-hidden pt-32 md:pt-40 pb-20 md:pb-28"
    >
      <div className="absolute inset-0 sn-grid-bg-dark opacity-40 pointer-events-none" />
      <div className="absolute -top-40 -right-20 w-[520px] h-[520px] rounded-full bg-[#2563EB]/15 blur-[140px]" />
      <div className={`relative max-w-7xl mx-auto px-6 md:px-10 lg:px-12 ${align === "center" ? "text-center" : ""}`}>
        {eyebrow && (
          <p className="text-[11px] font-display font-semibold tracking-[0.22em] uppercase text-[#93C5FD] sn-fade-in">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-4 font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.05] font-semibold tracking-tight sn-fade-up">
          {title}
        </h1>
        {subtitle && (
          <p className={`mt-6 text-lg text-slate-300 leading-relaxed max-w-3xl sn-fade-up sn-delay-1 ${align === "center" ? "mx-auto" : ""}`}>
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}
