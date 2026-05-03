import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { ARTICLES } from "../../data/blog";

export default function InsightsGrid({ compact = false, limit }) {
  const items = typeof limit === "number" ? ARTICLES.slice(0, limit) : ARTICLES;
  return (
    <section
      data-testid="insights-section"
      className={`relative bg-white ${compact ? "py-20" : "py-24 md:py-32"}`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14 sn-reveal">
          <div className="max-w-2xl">
            <p className="text-[11px] font-display font-semibold tracking-[0.22em] uppercase text-[#2563EB]">
              05 — Insights
            </p>
            <h2 className="mt-4 font-display text-3xl md:text-4xl lg:text-[44px] leading-[1.1] font-semibold tracking-tight text-[#0A192F]">
              Perspective from the trading floor.
            </h2>
          </div>
          {typeof limit === "number" && (
            <Link
              to="/insights"
              className="group inline-flex items-center gap-2 text-sm font-medium text-[#0A192F] border-b border-[#0A192F] pb-1 hover:text-[#2563EB] hover:border-[#2563EB] transition-colors self-start md:self-auto"
              data-testid="insights-all-link"
            >
              All articles
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
          {items.map((a, i) => (
            <article
              key={a.slug}
              className="sn-reveal group flex flex-col border-t border-slate-300 pt-6 hover:border-[#0A192F] transition-colors"
              style={{ animationDelay: `${i * 70}ms` }}
              data-testid={`insight-card-${i}`}
            >
              <div className="overflow-hidden aspect-[4/3] bg-slate-100 mb-5">
                <img
                  src={a.image}
                  alt={a.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="flex items-center gap-3 text-[11px] font-display tracking-[0.2em] uppercase text-slate-500">
                <span className="text-[#2563EB]">{a.category}</span>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <span>{a.date}</span>
              </div>
              <h3 className="mt-3 font-display text-lg font-semibold text-[#0A192F] leading-snug group-hover:text-[#2563EB] transition-colors">
                {a.title}
              </h3>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed line-clamp-3">
                {a.excerpt}
              </p>
              <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.18em] uppercase text-[#0A192F] group-hover:text-[#2563EB] transition-colors">
                Read article <ArrowRight size={13} />
              </span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
