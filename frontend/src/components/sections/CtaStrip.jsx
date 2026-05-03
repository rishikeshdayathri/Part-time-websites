import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MessageCircle } from "lucide-react";
import InquiryDialog from "../common/InquiryDialog";
import { buildWhatsAppLink } from "../../data/company";

export default function CtaStrip() {
  const [open, setOpen] = useState(false);
  return (
    <section
      data-testid="cta-strip"
      className="relative bg-white border-t border-slate-200 py-16 md:py-20"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div className="max-w-2xl sn-reveal">
            <p className="text-[11px] font-display font-semibold tracking-[0.22em] uppercase text-[#2563EB]">
              Speak to our trade desk
            </p>
            <h3 className="mt-4 font-display text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight text-[#0A192F]">
              Ready to source, supply, or move a commodity across borders?
            </h3>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sn-reveal sn-delay-1">
            <button
              type="button"
              onClick={() => setOpen(true)}
              data-testid="cta-strip-inquiry"
              className="inline-flex items-center justify-center gap-2 h-12 px-6 bg-[#0A192F] text-white text-sm font-medium hover:bg-[#2563EB] transition-colors"
            >
              Send Inquiry <ArrowRight size={15} />
            </button>
            <a
              href={buildWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="cta-strip-whatsapp"
              className="inline-flex items-center justify-center gap-2 h-12 px-6 bg-[#25D366] text-white text-sm font-medium hover:brightness-95 transition"
            >
              <MessageCircle size={16} /> WhatsApp
            </a>
            <Link
              to="/contact"
              data-testid="cta-strip-contact"
              className="inline-flex items-center justify-center gap-2 h-12 px-6 border border-slate-300 text-[#0A192F] text-sm font-medium hover:border-[#0A192F] transition-colors"
            >
              Full Contact
            </Link>
          </div>
        </div>
      </div>
      <InquiryDialog open={open} onOpenChange={setOpen} source="cta_strip" />
    </section>
  );
}
