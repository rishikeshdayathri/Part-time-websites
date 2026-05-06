import React from "react";
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";
import { COMPANY } from "../../data/company";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer
      data-testid="site-footer"
      className="relative bg-[#0A192F] text-slate-300 overflow-hidden"
    >
      <div className="absolute inset-0 sn-grid-bg-dark opacity-40 pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-6 md:px-10 lg:px-12 py-20 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          <div className="md:col-span-5">
            <div className="flex items-center gap-2.5 mb-5">
              <span className="relative inline-flex items-center justify-center w-10 h-10 bg-white">
                <img
                  src="https://customer-assets.emergentagent.com/job_nexus-trade-13/artifacts/xqb4b8uu_WhatsApp_Image_2026-05-05_at_21.09.23-removebg-preview.png"
                  alt="Subterra Nexus"
                  className="w-8 h-8 object-contain"
                />
                <span className="absolute -right-1 -bottom-1 w-2.5 h-2.5 bg-[#2563EB]" />
              </span>
              <span className="font-display font-semibold tracking-tight text-white text-xl">
                Subterra Nexus
              </span>
            </div>
            <p className="text-slate-400 max-w-md text-sm leading-relaxed">
              International commodity trading across petrochemicals, food
              commodities, metals, and minerals — connecting verified suppliers and
              buyers across Asia, MENA, LATAM, and beyond.
            </p>
            <p className="mt-6 text-xs uppercase tracking-[0.2em] text-slate-500">
              Social media coming soon
            </p>
          </div>

          <div className="md:col-span-3">
            <h4 className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-5 font-display">
              Explore
            </h4>
            <ul className="space-y-3 text-sm">
              {[
                ["Home", "/"],
                ["About", "/about"],
                ["Services", "/services"],
                ["Commodities", "/commodities"],
                ["Markets", "/markets"],
                ["Insights", "/insights"],
                ["Contact", "/contact"],
              ].map(([label, to]) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-slate-300 hover:text-white transition-colors"
                    data-testid={`footer-link-${label.toLowerCase()}`}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-4">
            <h4 className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-5 font-display">
              Contact
            </h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="mt-0.5 text-[#2563EB] flex-shrink-0" />
                <span className="text-slate-300">
                  {COMPANY.address.line1},<br />
                  {COMPANY.address.line2},<br />
                  {COMPANY.address.country}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-[#2563EB] flex-shrink-0" />
                <a
                  href={`mailto:${COMPANY.email}`}
                  className="text-slate-300 hover:text-white"
                  data-testid="footer-email"
                >
                  {COMPANY.email}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-[#2563EB] flex-shrink-0" />
                <a
                  href={`tel:${COMPANY.phone.replace(/\s+/g, "")}`}
                  className="text-slate-300 hover:text-white"
                  data-testid="footer-phone"
                >
                  {COMPANY.phone}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            © {year} Subterra Nexus Pvt Ltd. All rights reserved.
          </p>
          <p className="text-xs text-slate-500 font-display tracking-[0.18em] uppercase">
            Global Commodities · Trusted Networks · Timely Delivery
          </p>
        </div>
      </div>
    </footer>
  );
}
