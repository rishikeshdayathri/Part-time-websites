import React, { useState } from "react";
import { ArrowUpRight, MessageCircle } from "lucide-react";
import { SERVICES } from "../../data/services";
import InquiryDialog from "../common/InquiryDialog";

export default function ServicesGrid({ compact = false }) {
  const [inquiryOpen, setInquiryOpen] = useState(false);

  return (
    <section
      data-testid="services-section"
      className={`relative bg-white ${compact ? "py-20" : "py-24 md:py-32"}`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12">
        <div className="max-w-3xl mb-14 sn-reveal">
          <p className="text-[11px] font-display font-semibold tracking-[0.22em] uppercase text-[#2563EB]">
            03 — Services
          </p>
          <h2 className="mt-4 font-display text-3xl md:text-4xl lg:text-[44px] leading-[1.1] font-semibold tracking-tight text-[#0A192F]">
            End-to-end capabilities for cross-border commodity trade.
          </h2>
          <p className="mt-5 text-lg text-slate-600 leading-relaxed">
            Every service is delivered with a single accountable trade desk —
            from first inquiry to final delivery and documentation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-t border-l border-slate-200">
          {SERVICES.map((svc, i) => {
            const Icon = svc.icon;
            return (
              <div
                key={svc.title}
                className="group relative p-8 md:p-10 border-b border-r border-slate-200 bg-white hover:bg-[#F8FAFC] transition-colors sn-reveal"
                style={{ animationDelay: `${i * 60}ms` }}
                data-testid={`service-card-${i}`}
              >
                <div className="flex items-start justify-between">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-[#0A192F] text-white group-hover:bg-[#2563EB] transition-colors">
                    <Icon size={22} strokeWidth={1.6} />
                  </div>
                  <span className="font-display text-xs tracking-[0.2em] text-slate-400">
                    0{i + 1}
                  </span>
                </div>
                <h3 className="mt-8 font-display text-xl font-semibold text-[#0A192F]">
                  {svc.title}
                </h3>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                  {svc.desc}
                </p>
                <button
                  type="button"
                  onClick={() => setInquiryOpen(true)}
                  className="mt-8 inline-flex items-center gap-2 text-xs font-semibold tracking-[0.18em] uppercase text-[#0A192F] hover:text-[#2563EB] transition-colors"
                  data-testid={`service-contact-btn-${i}`}
                >
                  Contact Trade Desk <ArrowUpRight size={14} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <InquiryDialog open={inquiryOpen} onOpenChange={setInquiryOpen} source="services_section" />
    </section>
  );
}
