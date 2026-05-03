import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import PageHeader from "../components/common/PageHeader";
import InsightsGrid from "../components/sections/InsightsGrid";
import CtaStrip from "../components/sections/CtaStrip";
import useReveal from "../hooks/useReveal";
import { ARTICLES } from "../data/blog";
import { ArrowLeft } from "lucide-react";

export default function Blog() {
  const { slug } = useParams();
  const ref = useReveal([slug]);
  const navigate = useNavigate();

  if (slug) {
    const article = ARTICLES.find((a) => a.slug === slug);
    if (!article) {
      return (
        <main ref={ref} data-testid="blog-not-found" className="pt-32 pb-24">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <h1 className="font-display text-3xl font-semibold text-[#0A192F]">
              Article not found
            </h1>
            <button
              onClick={() => navigate("/insights")}
              className="mt-6 inline-flex items-center gap-2 text-sm border-b border-[#0A192F] pb-1"
            >
              <ArrowLeft size={14} /> Back to insights
            </button>
          </div>
        </main>
      );
    }
    return (
      <main ref={ref} data-testid="blog-article-page">
        <section className="relative bg-[#0A192F] text-white overflow-hidden pt-32 md:pt-40 pb-20">
          <div className="absolute inset-0 sn-grid-bg-dark opacity-40 pointer-events-none" />
          <div className="relative max-w-4xl mx-auto px-6 md:px-10">
            <Link
              to="/insights"
              className="inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-[#93C5FD] hover:text-white transition"
              data-testid="back-to-insights"
            >
              <ArrowLeft size={14} /> Back to insights
            </Link>
            <div className="mt-8 flex items-center gap-3 text-[11px] font-display tracking-[0.2em] uppercase text-slate-300">
              <span className="text-[#60A5FA]">{article.category}</span>
              <span className="w-1 h-1 rounded-full bg-slate-500" />
              <span>{article.date}</span>
            </div>
            <h1 className="mt-4 font-display text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.05] sn-fade-up">
              {article.title}
            </h1>
          </div>
        </section>

        <section className="bg-white py-20 md:py-24">
          <div className="max-w-4xl mx-auto px-6 md:px-10">
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-[360px] md:h-[480px] object-cover sn-reveal"
            />
            <div className="mt-12 space-y-6 text-slate-700 text-lg leading-relaxed sn-reveal sn-delay-1">
              {article.body.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
        </section>

        <InsightsGrid compact />
        <CtaStrip />
      </main>
    );
  }

  return (
    <main ref={ref} data-testid="blog-page">
      <PageHeader
        eyebrow="Insights"
        title="Perspective from the trading floor."
        subtitle="Commentary on global commodity flows, trade corridors, and what reliable sourcing really looks like."
      />
      <InsightsGrid />
      <CtaStrip />
    </main>
  );
}
