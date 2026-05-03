import React from "react";
import PageHeader from "../components/common/PageHeader";
import CommoditiesGrid from "../components/sections/CommoditiesGrid";
import CtaStrip from "../components/sections/CtaStrip";
import useReveal from "../hooks/useReveal";

export default function Commodities() {
  const ref = useReveal([]);
  return (
    <main ref={ref} data-testid="commodities-page">
      <PageHeader
        eyebrow="Commodities"
        title="Petrochemicals. Food. Metals. Ores."
        subtitle="Every commodity is sourced, verified, and executed through disciplined trade desk coordination. Send an inquiry on any item to speak with us directly."
      />
      <CommoditiesGrid heading={false} />
      <CtaStrip />
    </main>
  );
}
