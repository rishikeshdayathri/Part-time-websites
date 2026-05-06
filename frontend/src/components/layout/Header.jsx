import React, { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "../ui/button";
import InquiryDialog from "../common/InquiryDialog";

const NAV_LINKS = [
  { to: "/",            label: "Home" },
  { to: "/about",       label: "About" },
  { to: "/services",    label: "Services" },
  { to: "/commodities", label: "Commodities" },
  { to: "/markets",     label: "Markets" },
  { to: "/insights",    label: "Insights" },
  { to: "/contact",     label: "Contact" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <>
      <header
        data-testid="site-header"
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? "bg-white/85 backdrop-blur-xl border-b border-slate-200 shadow-[0_1px_0_0_rgba(15,23,42,0.04)]"
            : "bg-white/60 backdrop-blur-md border-b border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 h-16 md:h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group" data-testid="nav-logo">
            <span className="relative inline-flex items-center justify-center w-9 h-9 bg-[#0A192F]">
              <img
                src="https://customer-assets.emergentagent.com/job_nexus-trade-13/artifacts/xqb4b8uu_WhatsApp_Image_2026-05-05_at_21.09.23-removebg-preview.png"
                alt="Subterra Nexus"
                className="w-7 h-7 object-contain"
                style={{ filter: "brightness(0) invert(1)" }}
              />
              <span className="absolute -right-2 -bottom-2 w-2.5 h-2.5 bg-[#2563EB]" />
            </span>
            <span className="font-display font-semibold tracking-tight text-[#0A192F] text-lg">
              Subterra Nexus
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  `sn-nav-link text-sm font-medium transition-colors ${
                    isActive ? "text-[#0A192F]" : "text-slate-600 hover:text-[#0A192F]"
                  }`
                }
                data-testid={`nav-link-${link.label.toLowerCase()}`}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            <Button
              data-testid="nav-inquiry-btn"
              onClick={() => setInquiryOpen(true)}
              className="rounded-none bg-[#0A192F] hover:bg-[#2563EB] text-white font-medium px-5 h-10 transition-colors"
            >
              Send Inquiry
            </Button>
          </div>

          <button
            className="lg:hidden inline-flex items-center justify-center w-10 h-10 text-[#0A192F]"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
            data-testid="mobile-menu-toggle"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        <div
          className={`lg:hidden overflow-hidden transition-[max-height,opacity] duration-300 border-t border-slate-200 bg-white ${
            open ? "max-h-[540px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <nav className="px-6 py-5 flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  `py-3 text-base font-medium border-b border-slate-100 ${
                    isActive ? "text-[#0A192F]" : "text-slate-600"
                  }`
                }
                data-testid={`mobile-nav-${link.label.toLowerCase()}`}
              >
                {link.label}
              </NavLink>
            ))}
            <Button
              data-testid="mobile-inquiry-btn"
              onClick={() => setInquiryOpen(true)}
              className="mt-4 rounded-none bg-[#0A192F] hover:bg-[#2563EB] text-white font-medium h-11"
            >
              Send Inquiry
            </Button>
          </nav>
        </div>
      </header>

      <InquiryDialog open={inquiryOpen} onOpenChange={setInquiryOpen} source="header_cta" />
    </>
  );
}
