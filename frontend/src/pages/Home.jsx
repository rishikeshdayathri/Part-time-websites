import React from "react";
import Hero from "../components/sections/Hero";
import AboutPreview from "../components/sections/AboutPreview";
import CommoditiesGrid from "../components/sections/CommoditiesGrid";
import ServicesGrid from "../components/sections/ServicesGrid";
import MarketsSection from "../components/sections/MarketsSection";
import InsightsGrid from "../components/sections/InsightsGrid";
import Sustainability from "../components/sections/Sustainability";
import FuturePlans from "../components/sections/FuturePlans";
import CtaStrip from "../components/sections/CtaStrip";
import useReveal from "../hooks/useReveal";

export default function Home() {
  const ref = useReveal([]);
  return (
    <main ref={ref} data-testid="home-page">
      <Hero />
      <AboutPreview />
      <CommoditiesGrid compact heading />
      <ServicesGrid compact />
      <MarketsSection compact />
      <InsightsGrid compact limit={4} />
      <Sustainability />
      <FuturePlans />
      <CtaStrip />
    </main>
  );
}
