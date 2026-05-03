import React from "react";
import PageHeader from "../components/common/PageHeader";
import InteractiveWorldMap from "../components/sections/InteractiveWorldMap";
import MarketsSection from "../components/sections/MarketsSection";
import CtaStrip from "../components/sections/CtaStrip";
import useReveal from "../hooks/useReveal";

export default function Markets() {
  const ref = useReveal([]);
  return (
    <main ref={ref} data-testid="markets-page">
      <PageHeader
        eyebrow="Markets"
        title="Global trade reach, disciplined local execution."
        subtitle="Subterra Nexus operates across Asia, MENA, LATAM, the United States, UAE, Brazil, and Ecuador — connecting manufacturers, governments, distributors, and retail chains across corridors that matter."
      />
      <InteractiveWorldMap />
      <MarketsSection />
      <CtaStrip />
    </main>
  );
}
