import React from "react";
import { MessageCircle } from "lucide-react";
import { buildWhatsAppLink } from "../../data/company";

export default function WhatsAppFloat({ commodity = "" }) {
  return (
    <a
      href={buildWhatsAppLink(commodity)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      data-testid="whatsapp-float-button"
      className="fixed bottom-6 right-6 z-50 group"
    >
      <span className="absolute inset-0 rounded-full sn-pulse-ring" />
      <span className="relative flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-[0_12px_32px_-8px_rgba(37,211,102,0.55)] transition-transform duration-300 group-hover:scale-105">
        <MessageCircle size={26} strokeWidth={2} />
      </span>
      <span className="hidden md:block absolute right-[72px] top-1/2 -translate-y-1/2 whitespace-nowrap bg-[#0A192F] text-white text-xs font-medium px-3 py-2 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all pointer-events-none">
        Chat on WhatsApp
      </span>
    </a>
  );
}
