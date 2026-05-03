import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MessageCircle } from "lucide-react";
import InquiryDialog from "../common/InquiryDialog";
import { COMMODITY_CATEGORIES } from "../../data/commodities";
import { buildWhatsAppLink } from "../../data/company";

export default function CommoditiesGrid({ compact = false, heading = true }) {
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [selected, setSelected] = useState("");

  const openInquiry = (commodity = "") => {
    setSelected(commodity);
    setInquiryOpen(true);
  };

  return (
    <section
      data-testid="commodities-section"
      className={`relative bg-[#F8FAFC] ${compact ? "py-20" : "py-24 md:py-32"}`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12">
        {heading && (
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14 sn-reveal">
            <div className="max-w-2xl">
              <p className="text-[11px] font-display font-semibold tracking-[0.22em] uppercase text-[#2563EB]">
                02 — Commodities
              </p>
              <h2 className="mt-4 font-display text-3xl md:text-4xl lg:text-[44px] leading-[1.1] font-semibold tracking-tight text-[#0A192F]">
                Four verticals. One disciplined trade desk.
              </h2>
            </div>
            <Link
              to="/commodities"
              data-testid="commodities-all-link"
              className="group inline-flex items-center gap-2 text-sm font-medium text-[#0A192F] border-b border-[#0A192F] pb-1 hover:text-[#2563EB] hover:border-[#2563EB] transition-colors self-start md:self-auto"
            >
              View full catalogue
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        )}

        {/* Category image cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {COMMODITY_CATEGORIES.map((cat, i) => (
            <div
              key={cat.slug}
              className={`sn-img-card sn-card sn-reveal group relative h-[360px] bg-[#0A192F] border border-slate-200 overflow-hidden`}
              style={{ animationDelay: `${i * 80}ms` }}
              data-testid={`commodity-cat-card-${cat.slug}`}
            >
              <img
                src={cat.image}
                alt={cat.title}
                className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-80"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A192F] via-[#0A192F]/60 to-transparent" />
              <div className="relative h-full p-6 flex flex-col justify-end">
                <p className="text-[11px] font-display font-semibold tracking-[0.22em] uppercase text-[#93C5FD]">
                  Vertical
                </p>
                <h3 className="mt-1 font-display text-2xl font-semibold text-white">
                  {cat.title}
                </h3>
                <p className="mt-3 text-sm text-slate-300 leading-relaxed line-clamp-3">
                  {cat.summary}
                </p>
                <div className="mt-5 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => openInquiry(cat.title)}
                    data-testid={`commodity-cat-inquiry-${cat.slug}`}
                    className="inline-flex items-center gap-1.5 bg-white text-[#0A192F] text-xs font-semibold uppercase tracking-wider px-3.5 py-2.5 hover:bg-[#2563EB] hover:text-white transition-colors"
                  >
                    Send Inquiry <ArrowRight size={13} />
                  </button>
                  <a
                    href={buildWhatsAppLink(cat.title)}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-testid={`commodity-cat-whatsapp-${cat.slug}`}
                    className="inline-flex items-center gap-1.5 text-[#25D366] text-xs font-semibold uppercase tracking-wider px-2 py-2 hover:text-emerald-300 transition-colors"
                    aria-label={`WhatsApp about ${cat.title}`}
                  >
                    <MessageCircle size={14} />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {!compact && (
          <div className="mt-20 grid grid-cols-1 lg:grid-cols-2 gap-10">
            {COMMODITY_CATEGORIES.map((cat) => (
              <div
                key={`list-${cat.slug}`}
                className="sn-reveal bg-white border border-slate-200 p-8"
                data-testid={`commodity-list-${cat.slug}`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-xl font-semibold text-[#0A192F]">{cat.title}</h3>
                  <span className="text-[11px] tracking-[0.22em] uppercase font-display text-slate-500">
                    {cat.items.length} items
                  </span>
                </div>
                <div className="mt-6 divide-y divide-slate-100">
                  {cat.items.map((item) => (
                    <div
                      key={item.name}
                      className="py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                    >
                      <div>
                        <p className="font-display font-medium text-[#0A192F]">{item.name}</p>
                        <p className="text-sm text-slate-600 mt-0.5">{item.desc}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => openInquiry(item.name)}
                          data-testid={`commodity-inquiry-btn-${item.name.replace(/\s+/g, "-").toLowerCase()}`}
                          className="inline-flex items-center gap-1.5 bg-[#0A192F] text-white text-[11px] font-semibold uppercase tracking-wider px-3 py-2 hover:bg-[#2563EB] transition-colors"
                        >
                          Send Inquiry
                        </button>
                        <a
                          href={buildWhatsAppLink(item.name)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-[#25D366] hover:text-emerald-600 p-2"
                          aria-label={`WhatsApp about ${item.name}`}
                        >
                          <MessageCircle size={15} />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <InquiryDialog
        open={inquiryOpen}
        onOpenChange={setInquiryOpen}
        commodity={selected}
        source="commodities_section"
      />
    </section>
  );
}
