import React from "react";
import PageHeader from "../components/common/PageHeader";
import Sustainability from "../components/sections/Sustainability";
import FuturePlans from "../components/sections/FuturePlans";
import CtaStrip from "../components/sections/CtaStrip";
import useReveal from "../hooks/useReveal";
import { COMPANY } from "../data/company";

export default function About() {
  const ref = useReveal([]);
  return (
    <main ref={ref} data-testid="about-page">
      <PageHeader
        eyebrow="About Subterra Nexus"
        title="A trusted bridge between global commodity suppliers and buyers."
        subtitle={`Founded in ${COMPANY.founded} and headquartered in Hyderabad, India, Subterra Nexus Pvt Ltd. operates across petrochemicals, food commodities, metals, and ores — serving B2B and B2G clients across Asia, MENA, LATAM, and beyond.`}
      />

      <section className="bg-white py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          <div className="lg:col-span-5 sn-reveal">
            <img
              src="https://images.pexels.com/photos/14020705/pexels-photo-14020705.jpeg?auto=compress&cs=tinysrgb&w=1200"
              alt="Global logistics"
              className="w-full h-[420px] object-cover"
            />
          </div>
          <div className="lg:col-span-7 sn-reveal sn-delay-1">
            <p className="text-[11px] font-display font-semibold tracking-[0.22em] uppercase text-[#2563EB]">
              Our Story
            </p>
            <h2 className="mt-4 font-display text-3xl md:text-4xl leading-tight font-semibold tracking-tight text-[#0A192F]">
              Built in 2025 for the next decade of global trade.
            </h2>
            <div className="mt-6 space-y-5 text-slate-600 text-base md:text-lg leading-relaxed">
              <p>
                Subterra Nexus was founded to simplify international commodity
                trade. We believe modern trading counterparties want the same
                three things: reliability, quality assurance, and timely
                delivery — executed by a partner they can trust across borders
                and cycles.
              </p>
              <p>
                We focus on verified counterparties, disciplined documentation,
                and logistics partners that actually perform. Every commodity
                we handle — from petrochemicals and food commodities to metals
                and minerals — is backed by a single accountable trade desk from
                inquiry to delivery.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#F8FAFC] py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white border border-slate-200 p-10 sn-reveal">
              <p className="text-[11px] font-display font-semibold tracking-[0.22em] uppercase text-[#2563EB]">
                Mission
              </p>
              <h3 className="mt-4 font-display text-2xl md:text-3xl font-semibold leading-tight text-[#0A192F]">
                To simplify international commodity trade through reliable sourcing, transparent processes, and efficient execution.
              </h3>
            </div>
            <div className="bg-[#0A192F] text-white p-10 sn-reveal sn-delay-1 relative overflow-hidden">
              <div className="absolute inset-0 sn-grid-bg-dark opacity-40 pointer-events-none" />
              <div className="relative">
                <p className="text-[11px] font-display font-semibold tracking-[0.22em] uppercase text-[#93C5FD]">
                  Vision
                </p>
                <h3 className="mt-4 font-display text-2xl md:text-3xl font-semibold leading-tight">
                  To become a globally trusted commodity trading partner across emerging and established markets.
                </h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Sustainability />
      <FuturePlans />
      <CtaStrip />
    </main>
  );
}
